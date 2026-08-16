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

/** ESTKme-RED GATT service and characteristic UUIDs. */
const SERVICE_UUID = '4553';
const NOTIFY_UUID = '544b';
const WRITE_UUID = '6d65';

/** Bytes reserved from the negotiated MTU for ATT overhead. */
const MTU_HEADROOM = 10;

/** MTU we ask the peripheral for; it may negotiate down. */
const REQUESTED_MTU = 233;

/** Reader control frames: claim ("ESTKme"), power on/off, disclaim. */
const CMD_CLAIM = Uint8Array.of(2, 6, 0, 0x45, 0x53, 0x54, 0x4b, 0x6d, 0x65);
const CMD_POWER_ON = Uint8Array.of(3, 2, 0, 1, 1);
const CMD_POWER_OFF = Uint8Array.of(3, 0, 0);
const CMD_DISCLAIM = Uint8Array.of(2, 0, 0);

function hexToUint8Array(hexString: string): Uint8Array {
  const byteArray = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    byteArray[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  }
  return byteArray;
}

/** Prefixes a 2-byte little-endian length header to an APDU payload. */
function addHeaderToUint8Array(hexString: string): Uint8Array {
  const byteArray = hexToUint8Array(hexString);
  const length = byteArray.length;
  const header = new Uint8Array([length % 255, Math.floor(length / 256)]);
  const result = new Uint8Array(header.length + byteArray.length);
  result.set(header);
  result.set(byteArray, header.length);
  return result;
}

function uint8ArrayToHex(uint8Array: Uint8Array): string {
  return Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

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
        this.device = await this.device.connect({requestMTU: REQUESTED_MTU});
        this.device = await this.device.discoverAllServicesAndCharacteristics();
        await this.transmitRaw(CMD_CLAIM);
        await this.transmitRaw(CMD_POWER_ON);
      }

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

      const subscription = this.device.monitorCharacteristicForService(
        SERVICE_UUID,
        NOTIFY_UUID,
        (error: BleError | null, characteristic: Characteristic | null) => {
          if (settled) {
            return;
          }
          if (error) {
            settled = true;
            subscription.remove();
            reject(error);
            return;
          }
          if (!characteristic?.value) {
            return;
          }

          const value = base64ToBytes(characteristic.value);
          if (resultSize === -1) {
            resultSize = value[1] + value[2] * 256;
            resultArray = new Uint8Array(resultSize);
            resultArray.set(value.subarray(3));
            currentSize += value.length - 3;
          } else {
            resultArray.set(value, currentSize);
            currentSize += value.length;
          }

          if (currentSize === resultSize) {
            settled = true;
            subscription.remove();
            resolve(resultArray);
          }
        },
      );

      // Kick off the write. Previously this lived in an `async` executor, so a
      // write failure produced an unhandled rejection and left the promise
      // pending forever.
      void (async () => {
        try {
          const mtu = this.device.mtu - MTU_HEADROOM;
          for (let i = 0; i < arr.length; i += mtu) {
            await this.device.writeCharacteristicWithoutResponseForService(
              SERVICE_UUID,
              WRITE_UUID,
              bytesToBase64(arr.subarray(i, Math.min(i + mtu, arr.length))),
            );
          }
        } catch (error) {
          if (!settled) {
            settled = true;
            subscription.remove();
            reject(error);
          }
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
