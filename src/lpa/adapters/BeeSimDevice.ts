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

/**
 * BeeSIM BLE reader.
 *
 * The peripheral advertises a single vendor service and exposes exactly two
 * usable characteristics: one `writeWithoutResponse` and one `notify`. Their
 * UUIDs vary between firmware revisions, so they are located by property
 * rather than hardcoded.
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
 * Unlike the ESTKme-RED there are no claim/power control frames: the reader
 * powers the card on connect.
 */

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
    this.available = false;
    return true;
  }

  /**
   * Finds the write and notify characteristics by their properties.
   *
   * Both are required: without the notify characteristic no response can ever
   * be reassembled, and the reader would appear to hang.
   */
  private async resolveCharacteristics(): Promise<void> {
    if (this.writeUuid && this.notifyUuid) {
      return;
    }
    for (const service of await this.device.services()) {
      const characteristics = await service.characteristics();
      let write = '';
      let notify = '';
      for (const characteristic of characteristics) {
        if (characteristic.isWritableWithoutResponse) {
          write = characteristic.uuid;
        } else if (characteristic.isNotifiable) {
          notify = characteristic.uuid;
        }
      }
      if (write && notify) {
        this.serviceUuid = service.uuid;
        this.writeUuid = write;
        this.notifyUuid = notify;
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
            await this.device.writeCharacteristicWithoutResponseForService(
              this.serviceUuid,
              this.writeUuid,
              bytesToBase64(frame),
            );
          }
        } catch (error) {
          finish(() => reject(error));
        }
      })();
    });
  }

  async transmit(apdu: string): Promise<string> {
    return bytesToHex(await this.transmitRaw(hexToBytes(apdu)));
  }
}
