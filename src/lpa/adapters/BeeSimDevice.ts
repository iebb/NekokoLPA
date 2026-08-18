import {
  APDU_CLOSE_CHANNEL,
  APDU_OPEN_CHANNEL,
  APDU_TERMINAL_CAPABILITIES,
  NO_AID_FOUND,
  selectSupportedAid,
} from '@/lpa/adapters/apdu';

import {BleError, Characteristic, Device as BLEDevice} from 'react-native-ble-plx';
import {Device} from '@/lpa/adapters/Adapter';
import {base64ToBytes, bytesToBase64} from '@/shared/utils/base64';
import {bytesToHex, hexToBytes} from '@/lpa/core';
import {FrameAssembler, buildFrames} from '@/lpa/adapters/beeSimFraming';
import {BeeSimCommandPacer} from '@/lpa/adapters/beeSimPacer';

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
      this.pacer.reset();
      await this.transmitRaw(CMD_SET_POWER);

      await this.transmit(APDU_TERMINAL_CAPABILITIES);
      const channelResp = await this.transmit(APDU_OPEN_CHANNEL);
      const channelPrefix = channelResp.substring(0, 2);
      this.channel = channelPrefix.substring(1);

      if (await selectSupportedAid(apdu => this.transmit(apdu), channelPrefix)) {
        this.available = true;
        return true;
      }
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

  /**
   * Writes one APDU as `[total, index]`-framed chunks and reassembles the
   * response frames, which carry the same header.
   */
  transmitRaw(apdu: Uint8Array): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
      const assembler = new FrameAssembler();
      let settled = false;

      const finish = (fn: () => void) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        subscription.remove();
        fn();
      };

      const timer = setTimeout(
        () => finish(() => reject(new Error('BeeSIM reader did not answer'))),
        REPLY_TIMEOUT_MS,
      );

      const subscription = this.device.monitorCharacteristicForService(
        this.serviceUuid,
        this.notifyUuid,
        (error: BleError | null, characteristic: Characteristic | null) => {
          if (settled) {
            return;
          }
          if (error) {
            finish(() => reject(error));
            return;
          }
          if (!characteristic?.value) {
            return;
          }

          const payload = assembler.push(base64ToBytes(characteristic.value));
          if (payload) {
            finish(() => resolve(payload));
          }
        },
      );

      void (async () => {
        try {
          for (const frame of buildFrames(apdu)) {
            // Firmware that only advertises write-with-response rejects the
            // without-response call outright, so honour what the
            // characteristic actually supports.
            const payload = bytesToBase64(frame);
            if (this.writeNeedsResponse) {
              await this.device.writeCharacteristicWithResponseForService(
                this.serviceUuid,
                this.writeUuid,
                payload,
              );
            } else {
              await this.device.writeCharacteristicWithoutResponseForService(
                this.serviceUuid,
                this.writeUuid,
                payload,
              );
            }
          }
        } catch (error) {
          finish(() => reject(error));
        }
      })();
    });
  }

  async transmit(apdu: string): Promise<string> {
    // Pace before every command, not just inside a download: the profile list
    // alone issues enough APDUs to exhaust a burst.
    if (await this.pacer.beforeCommand()) {
      console.warn('[BeeSIM] burst limit reached — waiting out the cooldown');
    }
    return bytesToHex(await this.transmitRaw(hexToBytes(apdu)));
  }
}
