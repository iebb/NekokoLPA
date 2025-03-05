import {AIDList} from "@/utils/aid";

import {BleError, Characteristic, Device as BLEDevice} from 'react-native-ble-plx';
import base64 from 'base64-js';
import {Device} from "@/native/adapters/adapter";


function hexToUint8Array(hexString: string) {
  // Convert hex string to a Uint8Array
  let byteArray = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    byteArray[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return byteArray;
}

function addHeaderToUint8Array(hexString: string) {
  // Step 1: Convert hex string to Uint8Array
  let byteArray = hexToUint8Array(hexString);
  let length = byteArray.length;
  let header = new Uint8Array([length % 255, Math.floor(length / 256)]);
  let result = new Uint8Array(header.length + byteArray.length);
  result.set(header);
  result.set(byteArray, header.length);

  return result;
}

function uint8ArrayToHex(uint8Array: Uint8Array): string {
  return Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

const mss = 15;

export class ESTKmeRED implements Device {
  type = "ble";
  displayName = "";
  deviceName = "";
  deviceId = "";
  channel = "1";
  available = false;
  description = "";
  explicitConnectionRequired = false;
  device: BLEDevice;

  constructor(device: BLEDevice) {
    this.deviceName = device.name!;
    this.displayName = device.name!;
    this.deviceId = "ble:" + device.id;
    this.device = device;
  }

  async refresh(): Promise<boolean> {
    await this.disconnect();
    return await this.connect();
  }

  async connect(): Promise<boolean> {
    try {
      if (!await this.device.isConnected()) {
        this.device = await this.device.connect({requestMTU: 233});
        this.device = await this.device.discoverAllServicesAndCharacteristics();
        console.log("connected, negotiated mtu of ", this.device.mtu);
        await this.transmitRaw(Uint8Array.of(2, 6, 0, 0x45, 0x53, 0x54, 0x4B, 0x6D, 0x65)); // claim
        await this.transmitRaw(Uint8Array.of(3, 2, 0, 1, 1)); // power on
      } else {
        console.log("already connected...");
      }

      await this.transmit("80AA00000AA9088100820101830107"); // APDU_TERMINAL_CAPABILITIES
      const channelResp = await this.transmit("0070000001");
      const channel = channelResp.substring(0, 2);
      this.channel = channel.substring(1);


      for(const aid of AIDList.split(",")) {
        try {
          const aidResp = await this.transmit(channel + "A4040010" + aid);
          if (aidResp === "6a82") {
          } else {
            this.available = true;
            return true;
          }
        } catch (e) {

        }
      }
      return false;
    } catch (error: any) {
      console.log("CCID Connect Err", error);
      this.description = error?.message;
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      await this.transmit("007080FF00");
    } catch (error) {
    }
    await this.transmitRaw(Uint8Array.of(3, 0, 0)); // power off
    await this.transmitRaw(Uint8Array.of(2, 0, 0)); // disclaim
    await this.device.cancelConnection();
    return true;
  }

  async transmitRaw(arr: Uint8Array): Promise<Uint8Array> {
    return new Promise<Uint8Array>(async (resolve, reject) => {
      let resultArray = Uint8Array.of();
      let resultKey = 0;
      let resultSize = -1;
      let currentSize = 0;
      const pending = this.device.monitorCharacteristicForService("4553", "544b", (error: BleError | null, characteristic: Characteristic | null) => {
        if (characteristic?.value) {
          const value = base64.toByteArray(characteristic?.value || "");
          if (resultSize === -1) {
            resultSize = value[1] + value[2] * 256;
            resultKey = value[0];
            resultArray = new Uint8Array(resultSize);
            resultArray.set(value.subarray(3));
            currentSize += value.length - 3;
          } else {
            resultArray.set(value, currentSize);
            currentSize += value.length;
          }
          if (currentSize === resultSize) {
            resolve(resultArray);
            pending.remove();
          }
        }
      });


      const mtu = this.device.mtu - 10;
      for(let i = 0; i < arr.length; i += mtu) {
        let subarray = arr.subarray(i, arr.length < i + mtu ? arr.length : i + mtu);
        await this.device.writeCharacteristicWithoutResponseForService(
          "4553", "6d65",
          base64.fromByteArray(subarray)
        );
      }

    })

  }
  async transmit(s: string): Promise<string> {
    const arr = addHeaderToUint8Array(s);
    const val = uint8ArrayToHex(await this.transmitRaw(Uint8Array.of(4, ...arr)));
    return val;
  }
}