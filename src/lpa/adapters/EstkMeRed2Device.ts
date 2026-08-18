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
import {
  CcidAssembler,
  PC_TO_RDR_ICC_POWER_ON,
  PC_TO_RDR_XFR_BLOCK,
  packCcid,
} from '@/lpa/adapters/estkMeCcidFraming';

/**
 * ESTKme-RED, second generation.
 *
 * Shares the first generation's GATT service and characteristics but not its
 * protocol: this reader speaks CCID, where the v1 reader used its own
 * `[command, lengthLo, lengthHi]` framing. Sending v1 frames to it gets no
 * usable answer, which is why one adapter could not serve both.
 *
 * The two are told apart by advertised name — "ESTKme RED" with a space is
 * this one — matching how NekokoLPA 2 dispatches.
 */

/** Same GATT identifiers as the first generation. */
const SERVICE_UUID = '4553';
const NOTIFY_UUID = '544b';
const WRITE_UUID = '6d65';

const MTU_HEADROOM = 10;
const REQUESTED_MTU = 233;
const REPLY_TIMEOUT_MS = 30000;

export class EstkMeRed2 implements Device {
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
        await this.negotiate();
        await this.powerOn();
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
      console.error('[ESTKme-RED2] connect failed', error);
      this.description = error?.message;
      return false;
    }
  }

  /**
   * Protocol negotiation.
   *
   * The reader answers `61 <len>` when it wants a follow-up frame declaring
   * the length it will use. Upstream treats a failure here as non-fatal — the
   * reader still works on its default — so a throw is swallowed.
   */
  private async negotiate(): Promise<void> {
    try {
      const response = await this.exchange(
        PC_TO_RDR_XFR_BLOCK,
        Uint8Array.of(0xff, 0xff, 0xff, 0x00, 0x02, 0x00, 0x00),
      );
      if (response.length >= 2 && response[0] === 0x61) {
        await this.exchange(
          PC_TO_RDR_XFR_BLOCK,
          Uint8Array.of(0xff, 0xff, 0xff, 0x01, response[1]),
        );
      }
    } catch (error) {
      console.warn('[ESTKme-RED2] protocol negotiation failed, continuing', error);
    }
  }

  private async powerOn(): Promise<Uint8Array> {
    return this.exchange(PC_TO_RDR_ICC_POWER_ON, Uint8Array.of(0x01));
  }

  async disconnect(): Promise<boolean> {
    try {
      await this.transmit(APDU_CLOSE_CHANNEL);
    } catch (error) {}
    await this.device.cancelConnection();
    this.available = false;
    return true;
  }

  /** One CCID request/response round trip. */
  private exchange(msgType: number, payload: Uint8Array): Promise<Uint8Array> {
    return this.transmitRaw(packCcid(msgType, payload));
  }

  transmitRaw(request: Uint8Array): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
      const assembler = new CcidAssembler();
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
          const payload = assembler.push(base64ToBytes(characteristic.value));
          if (payload) {
            finish(() => resolve(payload));
          }
        },
      );

      void (async () => {
        try {
          const mtu = this.device.mtu - MTU_HEADROOM;
          for (let i = 0; i < request.length; i += mtu) {
            await this.device.writeCharacteristicWithoutResponseForService(
              SERVICE_UUID,
              WRITE_UUID,
              bytesToBase64(request.subarray(i, Math.min(i + mtu, request.length))),
            );
          }
        } catch (error) {
          finish(() => reject(error));
        }
      })();
    });
  }

  async transmit(apdu: string): Promise<string> {
    return bytesToHex(await this.exchange(PC_TO_RDR_XFR_BLOCK, hexToBytes(apdu)));
  }
}
