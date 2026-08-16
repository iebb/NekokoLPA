import {BleError, Characteristic, Device as BLEDevice} from 'react-native-ble-plx';

import {
  APDU_OPEN_CHANNEL,
  APDU_TERMINAL_CAPABILITIES,
  NO_AID_FOUND,
  selectSupportedAid,
} from '@/lpa/adapters/apdu';
import {Device} from '@/lpa/adapters/Adapter';

/** Nordic UART Service, used by the 9eSIM / eSIM_Writer firmware. */
const NUS_SERVICE_UUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
const NUS_WRITE_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
const NUS_NOTIFY_UUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';

/** Bytes reserved from the negotiated MTU for ATT overhead. */
const MTU_HEADROOM = 10;

/** Error string the firmware returns when the logical channel has dropped. */
const APDU_CHANNEL_CLOSED = 'APDU channel not open!';

/** MTU we ask the peripheral for; it may negotiate down. */
const REQUESTED_MTU = 185;

/** Firmware `action` codes for the APDU command. */
const APDU_ACTION_OPEN = 0;
const APDU_ACTION_TRANSMIT = 1;
const APDU_ACTION_CLOSE = 2;

/** The card exposes at most four logical channels (0-3). */
const MAX_OPEN_CHANNELS = 3;

/** Largest GET RESPONSE length this firmware handles reliably. */
const MAX_GET_RESPONSE_LEN = 0x4f;

export class SimLinkDevice implements Device {
  type = 'ble_9el';
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
      }
      await this.transmitRaw({cmd: 'APDU', action: APDU_ACTION_CLOSE});
      await this.transmitRaw({cmd: 'APDU', action: APDU_ACTION_OPEN});

      await this.transmit(APDU_TERMINAL_CAPABILITIES);
      const channelResp = await this.transmit(APDU_OPEN_CHANNEL);
      const channelPrefix = channelResp.substring(0, 2);
      this.channel = channelPrefix[1];

      if (channelResp[0] === '6' && channelResp[1] !== '1') {
        this.description = 'Failed to open channel';
        this.available = false;
        return false;
      }
      if (parseInt(channelPrefix, 10) > MAX_OPEN_CHANNELS) {
        this.description = `Too many opened channels, ${channelPrefix}`;
        this.available = false;
        return false;
      }

      if (await selectSupportedAid(apdu => this.transmit(apdu), channelPrefix)) {
        this.available = true;
        return true;
      }
      this.description = NO_AID_FOUND;
      return false;
    } catch (error: any) {
      console.error('[9eSIM] connect failed', error);
      this.description = error?.message;
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      await this.transmitRaw({cmd: 'APDU', action: APDU_ACTION_CLOSE});
      await this.device.cancelConnection();
    } catch (error) {}
    return true;
  }

  /**
   * Sends a JSON command over the Nordic UART service and accumulates the
   * notification stream until it parses as a complete JSON reply.
   *
   * If the card reports a closed APDU channel we reopen it once and replay the
   * original command.
   */
  transmitRaw(obj: object | string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let buffer = '';
      let settled = false;

      const finish = (fn: () => void) => {
        if (settled) {
          return;
        }
        settled = true;
        subscription.remove();
        fn();
      };

      const subscription = this.device.monitorCharacteristicForService(
        NUS_SERVICE_UUID,
        NUS_NOTIFY_UUID,
        (error: BleError | null, characteristic: Characteristic | null) => {
          if (settled) {
            return;
          }
          if (!characteristic?.value) {
            // errorCode 2 is the expected "operation cancelled" on teardown.
            if (error && error.errorCode !== 2) {
              finish(() => reject(error));
            }
            return;
          }

          buffer += atob(characteristic.value);

          let reply: {error?: string; data?: string};
          try {
            reply = JSON.parse(buffer);
          } catch {
            // Partial frame; wait for the next notification.
            return;
          }

          if (reply.error === APDU_CHANNEL_CLOSED) {
            finish(() => {
              this.transmitRaw({cmd: 'APDU', action: APDU_ACTION_OPEN})
                .then(() => this.transmitRaw(obj))
                .then(resolve, reject);
            });
          } else if (reply.error) {
            finish(() => resolve(''));
          } else {
            finish(() => resolve(reply.data ?? ''));
          }
        },
      );

      // Previously this ran inside an `async` executor, so a write failure was
      // an unhandled rejection and the promise never settled.
      void (async () => {
        try {
          const mtu = this.device.mtu - MTU_HEADROOM;
          const text = typeof obj === 'string' ? obj : JSON.stringify(obj);
          for (let i = 0; i < text.length; i += mtu) {
            await this.device.writeCharacteristicWithResponseForService(
              NUS_SERVICE_UUID,
              NUS_WRITE_UUID,
              btoa(text.substring(i, Math.min(i + mtu, text.length))),
            );
          }
        } catch (error) {
          finish(() => reject(error));
        }
      })();
    });
  }
  async transmit(s: string): Promise<string> {
    // GET RESPONSE (C0) asking for more than 0x4F bytes — or for 0, meaning 256
    // — overflows this firmware's buffer, so cap the requested length at 0x4F.
    const isGetResponse = s.substring(2).startsWith('c00000') && s.length === 10;
    if (isGetResponse) {
      const requested = parseInt(s.substring(8), 16);
      if (requested > MAX_GET_RESPONSE_LEN || requested === 0) {
        return this.transmitRaw({
          cmd: 'APDU',
          data: `${s.substring(0, 2)}c000004f`,
          action: APDU_ACTION_TRANSMIT,
        });
      }
    }
    return this.transmitRaw({cmd: 'APDU', data: s, action: APDU_ACTION_TRANSMIT});
  }
}
