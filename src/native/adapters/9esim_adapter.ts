import {AIDList} from "@/utils/aid";

import {BleError, Characteristic, Device as BLEDevice} from 'react-native-ble-plx';
import {Device} from "@/native/adapters/adapter";


export class SimLinkAdapter implements Device {
  type = "ble_9el";
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

  async reconnect(): Promise<boolean> {
    await this.disconnect();
    return await this.connect();
  }

  async refresh(): Promise<boolean> {
    return (await this.device.isConnected()) ? true : await this.connect();
  }

  async connect(): Promise<boolean> {
    try {
      if (!await this.device.isConnected()) {
        this.device = await this.device.connect({requestMTU: 185});
        this.device = await this.device.discoverAllServicesAndCharacteristics();
        console.log("connected, negotiated mtu of", this.device.mtu);
      } else {
        console.log("already connected...");
      }
      await this.transmitRaw({cmd: "APDU", action: 2});
      await this.transmitRaw({cmd: "APDU", action: 0});
      await this.transmit("80AA00000AA9088100820101830107"); // APDU_TERMINAL_CAPABILITIES
      const channelResp = await this.transmit("0070000001");
      const channel = channelResp.substring(0, 2);
      this.channel = channel[1];
      if (channelResp[0] == "6" && channelResp[1] != "1") {
        this.description = `Failed to open channel`;
        this.available = false;
        return false;
      }
      if (parseInt(channel, 10) > 3) {
        this.description = `Too many opened channels, ${channel}`;
        this.available = false;
        return false;
      }

      for(const aid of AIDList.split(",")) {
        try {
          const aidResp = await this.transmit(channel + "A4040010" + aid);
          if (aidResp.startsWith("61") || aidResp.startsWith("90")) {
            this.available = true;
            return true;
          } else {
          }
        } catch (e) {

        }
      }
      this.description = "No supported AID found";
      return false;
    } catch (error: any) {
      console.log("CCID Connect Err", error);
      this.description = error?.message;
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      await this.transmitRaw({cmd: "APDU", action: 2});
      await this.device.cancelConnection();
    } catch (error) {}
    return true;
  }

  async transmitRaw(obj: object | string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      let resultArray = "";
      const pending = this.device.monitorCharacteristicForService(
        "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
        "6E400003-B5A3-F393-E0A9-E50E24DCCA9E",
        (error: BleError | null, characteristic: Characteristic | null) => {
        if (characteristic?.value) {
          const value = atob(characteristic?.value || "");
          resultArray += value;
          try {
            const ua = JSON.parse(resultArray);
            if (ua.error) {
             if (ua.error === "APDU channel not open!") {
               pending.remove();
               this.transmitRaw({cmd: "APDU", action: 0}).then(
                 async f => resolve(await this.transmitRaw(obj))
               )
             } else {
               pending.remove();
               resolve("");
             }
            } else {
              pending.remove();
              console.log("rx: ", ua);
              resolve(ua.data);
            }
          } catch (e) {
            console.log(resultArray, "cannot be parsed");
          }
        } else {
          if (error && (error?.errorCode !== 2)) {
            console.log("what", error);
            reject(error);
          }
        }
      });


      const mtu = this.device.mtu - 10;
      const text = typeof obj === "string" ? obj : JSON.stringify(obj);
      for(let i = 0; i < text.length; i += mtu) {
        let subarray = text.substring(i, text.length < i + mtu ? text.length : i + mtu);
        let resp = await this.device.writeCharacteristicWithResponseForService(
          "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
          "6E400002-B5A3-F393-E0A9-E50E24DCCA9E",
          btoa(subarray)
        );
      }



    })

  }
  async transmit(s: string): Promise<string> {

    if (s.substring(2).startsWith('c00000') && s.length == 10 && (parseInt(s.substring(8), 16) > 0x4f || parseInt(s.substring(8), 16) === 0)) {
      return await this.transmitRaw({cmd: "APDU", data: s.substring(0, 2) + "c000004f", action: 1});
    } else {
      return await this.transmitRaw({cmd: "APDU", data: s, action: 1});
    }
  }
}