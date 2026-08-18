import {
  APDU_CLOSE_CHANNEL,
  APDU_OPEN_CHANNEL,
  APDU_TERMINAL_CAPABILITIES,
  NO_AID_FOUND,
  openedChannel,
  releaseChannel,
  selectSupportedAid,
} from '@/lpa/adapters/apdu';

import {Platform} from 'react-native';
import {BleError, Characteristic, Device as BLEDevice} from 'react-native-ble-plx';
import {Device} from '@/lpa/adapters/Adapter';
import {base64ToBytes, bytesToBase64} from '@/shared/utils/base64';
import {addHeaderToUint8Array, uint8ArrayToHex} from '@/lpa/adapters/estkMeFraming';

/** ESTKme-RED GATT service and characteristic UUIDs. */
const SERVICE_UUID = '4553';
const NOTIFY_UUID = '544b';
const WRITE_UUID = '6d65';

/** Bytes reserved from the negotiated MTU for ATT overhead. */
const MTU_HEADROOM = 10;

/**
 * Smallest chunk we will ever write.
 *
 * `device.mtu` is only meaningful once an MTU has been negotiated, which
 * `requestMTU` does on Android. Apple platforms negotiate it themselves and
 * ble-plx may report 0 until they do — and `mtu - MTU_HEADROOM` then goes
 * non-positive, so the write loop stops advancing and the peripheral drops the
 * link. 20 bytes is the ATT payload every BLE device supports.
 */
const MIN_CHUNK = 20;

/** MTU we ask the peripheral for; it may negotiate down. */
const REQUESTED_MTU = 233;

/** How long to wait for the reader to answer before giving up. */
const REPLY_TIMEOUT_MS = 30000;

/** Reader control frames: claim ("ESTKme"), power on/off, disclaim. */
const CMD_CLAIM = Uint8Array.of(2, 6, 0, 0x45, 0x53, 0x54, 0x4b, 0x6d, 0x65);
const CMD_POWER_ON = Uint8Array.of(3, 2, 0, 1, 1);
const CMD_POWER_OFF = Uint8Array.of(3, 0, 0);
const CMD_DISCLAIM = Uint8Array.of(2, 0, 0);

export class EstkMeRed implements Device {
  type = 'ble';
  displayName = '';
  deviceName = '';
  deviceId = '';
  channel = '1';
  available = false;
  description = '';
  explicitConnectionRequired = false;
  device: BLEDevice;

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
        // requestMTU is Android-only; Apple platforms negotiate their own.
        this.device = await this.device.connect(
          Platform.OS === 'android' ? {requestMTU: REQUESTED_MTU} : undefined,
        );
        this.device = await this.device.discoverAllServicesAndCharacteristics();
        await this.transmitRaw(CMD_CLAIM);
        await this.transmitRaw(CMD_POWER_ON);
      }

      await this.transmit(APDU_TERMINAL_CAPABILITIES);
      const channelResp = await this.transmit(APDU_OPEN_CHANNEL);
      const channel = openedChannel(channelResp);
      if (channel === null) {
        console.error('[ESTKme-RED] unusable MANAGE CHANNEL response', channelResp);
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
      console.error('[ESTKme-RED] connect failed', error);
      this.description = error?.message;
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      await this.transmit(APDU_CLOSE_CHANNEL);
    } catch (error) {}
    await this.transmitRaw(CMD_POWER_OFF);
    await this.transmitRaw(CMD_DISCLAIM);
    await this.device.cancelConnection();
    return true;
  }

  /**
   * Writes a framed payload and reassembles the chunked notification response.
   *
   * The reply arrives as several notifications: the first carries a 3-byte
   * header (key, then a little-endian length), the rest are raw continuation
   * bytes.
   */
  transmitRaw(arr: Uint8Array): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
      let resultArray = Uint8Array.of();
      let resultSize = -1;
      let currentSize = 0;
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

      // Without this a reader that stops answering mid-exchange leaves the
      // promise pending forever, and the UI sits on a spinner with no error.
      const timer = setTimeout(
        () => finish(() => reject(new Error('ESTKme-RED reader did not answer'))),
        REPLY_TIMEOUT_MS,
      );

      const subscription = this.device.monitorCharacteristicForService(
        SERVICE_UUID,
        NOTIFY_UUID,
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

          const value = base64ToBytes(characteristic.value);
          if (resultSize === -1) {
            resultSize = value[1] + value[2] * 256;
            resultArray = new Uint8Array(resultSize);
            const body = value.subarray(3, 3 + resultSize);
            resultArray.set(body);
            currentSize += body.length;
          } else {
            // Clamp: a frame that runs past the declared length would throw a
            // RangeError out of the notification handler, where nothing can
            // catch it, and the promise would never settle.
            const body = value.subarray(0, resultSize - currentSize);
            resultArray.set(body, currentSize);
            currentSize += body.length;
          }

          if (currentSize >= resultSize) {
            finish(() => resolve(resultArray));
          }
        },
      );

      // Kick off the write. Previously this lived in an `async` executor, so a
      // write failure produced an unhandled rejection and left the promise
      // pending forever.
      void (async () => {
        try {
          const mtu = Math.max(MIN_CHUNK, (this.device.mtu ?? 0) - MTU_HEADROOM);
          for (let i = 0; i < arr.length; i += mtu) {
            await this.device.writeCharacteristicWithoutResponseForService(
              SERVICE_UUID,
              WRITE_UUID,
              bytesToBase64(arr.subarray(i, Math.min(i + mtu, arr.length))),
            );
          }
        } catch (error) {
          finish(() => reject(error));
        }
      })();
    });
  }
  async transmit(s: string): Promise<string> {
    const arr = addHeaderToUint8Array(s);
    const val = uint8ArrayToHex(await this.transmitRaw(Uint8Array.of(4, ...arr)));
    return val;
  }
}
