import {
  APDU_CLOSE_CHANNEL,
  APDU_OPEN_CHANNEL,
  APDU_TERMINAL_CAPABILITIES,
  NO_AID_FOUND,
  openedChannel,
  releaseChannel,
  selectSupportedAid,
} from '@/lpa/adapters/apdu';

import {BleError, Characteristic, Device as BLEDevice, Subscription} from 'react-native-ble-plx';
import {Device} from '@/lpa/adapters/Adapter';
import {base64ToBytes, bytesToBase64} from '@/shared/utils/base64';
import {bytesToHex, hexToBytes} from '@/lpa/core';
import {FrameAssembler, buildFrames} from '@/lpa/adapters/beeSimFraming';
import {BeeSimCommandPacer} from '@/lpa/adapters/beeSimPacer';
import {devLog} from '@/shared/utils/devLog';

/**
 * BeeSIM BLE reader.
 *
 * The peripheral advertises a vendor service (`ae30`) with a write
 * characteristic (`ae01`) and a notify one (`ae02`). Firmware revisions
 * renumber them, so resolution falls back to matching on properties.
 *
 * Commands are paced: the reader stops answering after a burst unless the
 * client waits (see `beeSimPacer`). Every APDU goes through it, because a
 * plain profile list already exceeds one burst.
 *
 * Framing is symmetric and very simple: an APDU is split into 18-byte
 * payloads, and every frame — in both directions — is prefixed with
 * `[totalChunks, chunkIndex]` where the index is 1-based. A response is
 * complete once a frame arrives whose index equals its total.
 *
 *     APDU 40 bytes -> [3,1] + 18 bytes
 *                      [3,2] + 18 bytes
 *                      [3,3] +  4 bytes
 *
 * The reader powers the card on connect, so there is no claim/power-on
 * handshake; the one control frame sent is the TX power level below.
 *
 * Notifications are monitored once for the whole connection and completed
 * responses are queued, rather than subscribing per command. The reader is not
 * strictly request/response — its control commands answer with a status record
 * that can arrive after the command has already been answered — and a
 * per-command subscription hands that straggler to the *next* command as its
 * reply, shifting every later exchange by one. The visible symptom is the
 * MANAGE CHANNEL reply arriving where the channel number should be, so every
 * SELECT goes out on a bogus class byte and the reader comes up with "no
 * supported AID found" on a card that has one. Clearing the queue at the start
 * of each command is what discards such a straggler.
 */

/**
 * Raise the reader's transmit power to level 4.
 *
 * BeeSIM's own install flow does this before it starts, and a profile
 * download is a long transfer over a link that is otherwise weak enough to
 * drop mid-session. It is applied once per connection rather than per
 * download, so every entry point benefits.
 */
const CMD_SET_POWER = Uint8Array.of(0xa0, 0x3e, 0x04, 0x00, 0x00);

/** Advertised GATT service. */
const SERVICE_UUID = '0000ae30-0000-1000-8000-00805f9b34fb';

/** How long to wait for the card to answer before giving up. */
const REPLY_TIMEOUT_MS = 60000;

/**
 * How long to wait for the TX power level to be acknowledged.
 *
 * Raising the power is an optimisation, not a precondition, so it gets a short
 * budget of its own: a firmware revision that stays silent here must not hold
 * the reader in "connecting" for the full reply timeout.
 */
const POWER_TIMEOUT_MS = 5000;

/**
 * Settling time after notifications are enabled.
 *
 * Enabling them writes the client configuration descriptor, which the stack
 * acknowledges asynchronously — on CoreBluetooth noticeably later than the
 * call returns. A command written before that lands is answered into a
 * subscription that is not yet receiving.
 */
const NOTIFY_SETTLE_MS = 200;

/** A response the reader has finished sending but nothing is waiting for yet. */
type PendingReply = {
  resolve: (value: Uint8Array) => void;
  reject: (error: Error) => void;
};

export class BeeSimDevice implements Device {
  type = 'ble';
  displayName = '';
  deviceName = '';
  deviceId = '';
  channel = '1';
  available = false;
  description = '';
  explicitConnectionRequired = false;
  device: BLEDevice;

  private serviceUuid = SERVICE_UUID;
  private writeUuid = '';
  private notifyUuid = '';
  private writeNeedsResponse = false;
  private readonly pacer = new BeeSimCommandPacer();

  private monitor: Subscription | null = null;
  private readonly assembler = new FrameAssembler();
  private readonly replies: Uint8Array[] = [];
  private pending: PendingReply | null = null;

  constructor(device: BLEDevice) {
    this.deviceName = device.name!;
    this.displayName = device.name!;
    this.deviceId = 'ble:' + device.id;
    this.device = device;
  }

  async reconnect(): Promise<boolean> {
    await this.disconnect();
    return await this.connect();
  }

  async refresh(): Promise<boolean> {
    return (await this.device.isConnected()) ? true : await this.connect();
  }

  async connect(): Promise<boolean> {
    try {
      if (!(await this.device.isConnected())) {
        this.device = await this.device.connect();
        this.device = await this.device.discoverAllServicesAndCharacteristics();
      }
      await this.resolveCharacteristics();
      await this.startMonitoring();
      this.pacer.reset();

      try {
        await this.transmitRaw(CMD_SET_POWER, POWER_TIMEOUT_MS);
      } catch (error) {
        console.warn('[BeeSIM] TX power init was not acknowledged', error);
      }

      await this.transmit(APDU_TERMINAL_CAPABILITIES);
      const channelResp = await this.transmit(APDU_OPEN_CHANNEL);

      const channel = openedChannel(channelResp);
      if (channel === null) {
        console.error('[BeeSIM] unusable MANAGE CHANNEL response', channelResp);
        this.description = `Failed to open channel (${channelResp})`;
        return false;
      }
      this.channel = channel.toString(16);

      if (await selectSupportedAid(apdu => this.transmit(apdu), channel)) {
        this.available = true;
        return true;
      }
      await releaseChannel(apdu => this.transmit(apdu), channel);
      this.description = NO_AID_FOUND;
      return false;
    } catch (error: any) {
      console.error('[BeeSIM] connect failed', error);
      this.description = error?.message;
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      await this.transmit(APDU_CLOSE_CHANNEL);
    } catch (error) {}
    this.stopMonitoring();
    await this.device.cancelConnection();
    this.pacer.reset();
    this.available = false;
    return true;
  }

  /**
   * Finds the write and notify characteristics.
   *
   * Known firmware exposes `ae01` for TX and `ae02` for RX under the `ae30`
   * service, so those are matched first; revisions that renumber them fall back
   * to the first writable characteristic for TX and the first notify-or-
   * indicate characteristic that is *not* the writer for RX.
   *
   * That "not the writer" clause matters: some revisions mark a single
   * characteristic both writable and notifiable, and classifying by a simple
   * if/else lets it claim the TX slot and leave RX empty — the reader then
   * accepts every command and appears to hang, because no response can ever be
   * reassembled.
   */
  private async resolveCharacteristics(): Promise<void> {
    if (this.writeUuid && this.notifyUuid) {
      return;
    }
    for (const service of await this.device.services()) {
      const characteristics = await service.characteristics();
      let write = '';
      let notify = '';
      let writeNeedsResponse = false;

      for (const characteristic of characteristics) {
        const uuid = characteristic.uuid.toLowerCase();
        const canWrite =
          characteristic.isWritableWithResponse || characteristic.isWritableWithoutResponse;
        const canNotify = characteristic.isNotifiable || characteristic.isIndicatable;

        if (uuid.includes('ae01') && canWrite) {
          write = characteristic.uuid;
          writeNeedsResponse = !characteristic.isWritableWithoutResponse;
        } else if (uuid.includes('ae02') && canNotify) {
          notify = characteristic.uuid;
        }
      }

      if (!write) {
        const candidate = characteristics.find(
          c => c.isWritableWithResponse || c.isWritableWithoutResponse,
        );
        if (candidate) {
          write = candidate.uuid;
          writeNeedsResponse = !candidate.isWritableWithoutResponse;
        }
      }
      if (!notify) {
        const candidate = characteristics.find(
          c => (c.isNotifiable || c.isIndicatable) && c.uuid !== write,
        );
        if (candidate) {
          notify = candidate.uuid;
        }
      }

      if (write && notify) {
        this.serviceUuid = service.uuid;
        this.writeUuid = write;
        this.notifyUuid = notify;
        this.writeNeedsResponse = writeNeedsResponse;
        return;
      }
    }
    throw new Error('No usable BeeSIM characteristics found');
  }

  /** Subscribes to the notify characteristic for the life of the connection. */
  private async startMonitoring(): Promise<void> {
    this.stopMonitoring();
    this.monitor = this.device.monitorCharacteristicForService(
      this.serviceUuid,
      this.notifyUuid,
      (error, characteristic) => this.onNotification(error, characteristic),
    );
    await new Promise(resolve => setTimeout(resolve, NOTIFY_SETTLE_MS));
  }

  private stopMonitoring(): void {
    this.monitor?.remove();
    this.monitor = null;
    this.assembler.reset();
    this.replies.length = 0;
    const waiting = this.pending;
    this.pending = null;
    waiting?.reject(new Error('BeeSIM link closed'));
  }

  /** Accumulates one inbound frame, queueing the payload once it completes. */
  private onNotification(error: BleError | null, characteristic: Characteristic | null): void {
    if (error) {
      const waiting = this.pending;
      this.pending = null;
      waiting?.reject(error);
      return;
    }
    if (!characteristic?.value) {
      return;
    }

    const payload = this.assembler.push(base64ToBytes(characteristic.value));
    if (!payload) {
      return;
    }

    const waiting = this.pending;
    if (waiting) {
      this.pending = null;
      waiting.resolve(payload);
    } else {
      this.replies.push(payload);
    }
  }

  /**
   * Writes one APDU as `[total, index]`-framed chunks and resolves with the
   * reassembled response.
   */
  async transmitRaw(apdu: Uint8Array, timeoutMs = REPLY_TIMEOUT_MS): Promise<Uint8Array> {
    // Whatever is queued predates this command: it is a status frame the reader
    // volunteered, or the tail of a command that timed out. Answering with one
    // shifts this exchange and every later one by a response.
    this.replies.length = 0;
    this.assembler.reset();

    const frames = buildFrames(apdu);
    for (let index = 0; index < frames.length; index++) {
      const payload = bytesToBase64(frames[index]);
      // Firmware that only advertises write-with-response rejects the
      // without-response call outright, so honour what the characteristic
      // actually supports.
      if (this.writeNeedsResponse) {
        await this.device.writeCharacteristicWithResponseForService(
          this.serviceUuid,
          this.writeUuid,
          payload,
        );
        // Acknowledged writes arrive back to back faster than this firmware
        // reassembles them; NekokoLPA 2 spaces them the same way.
        if (frames.length > 1 && index < frames.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      } else {
        await this.device.writeCharacteristicWithoutResponseForService(
          this.serviceUuid,
          this.writeUuid,
          payload,
        );
      }
    }

    return await this.awaitReply(timeoutMs);
  }

  /** Resolves with the next complete response, queued or still in flight. */
  private awaitReply(timeoutMs: number): Promise<Uint8Array> {
    const queued = this.replies.shift();
    if (queued) {
      return Promise.resolve(queued);
    }
    return new Promise<Uint8Array>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending = null;
        reject(new Error('BeeSIM reader did not answer'));
      }, timeoutMs);
      this.pending = {
        resolve: value => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: error => {
          clearTimeout(timer);
          reject(error);
        },
      };
    });
  }

  async transmit(apdu: string): Promise<string> {
    // Pace before every command, not just inside a download: the profile list
    // alone issues enough APDUs to exhaust a burst.
    if (await this.pacer.beforeCommand()) {
      // Expected on any long exchange, and handled: not a warning.
      devLog('[BeeSIM] burst limit reached — waiting out the cooldown');
    }
    const response = bytesToHex(await this.transmitRaw(hexToBytes(apdu)));
    // The exchange itself is the only way to tell a reader fault from a card
    // one, and it is not reconstructable after the fact.
    devLog(`[BeeSIM] ${apdu} -> ${response}`);
    return response;
  }
}
