import {NativeModules} from "react-native";
import {setupDevice} from "@/native/jsnative/setup";
import {Device} from "@/native/adapters/adapter";
import {Adapters} from "@/native/adapters/registry";

const { OMAPIBridge } = NativeModules;


export class OMAPIDevice implements Device {
  type = "omapi";
  deviceName = "";
  deviceId = "";
  explicitConnectionRequired = true;

  constructor(deviceName: string) {
    this.deviceName = deviceName;
    this.deviceId = "oampi:" + deviceName;
  }

  async connect(): Promise<boolean> {
    console.log("connecting ", this.deviceName);
    // await OMAPIBridge.connect(this.deviceName);
    // await this.transmit("80AA00000AA9088100820101830107");
    // await this.transmit("0070000001");
    // await this.transmit("01A4040010A0000005591010FFFFFFFF8900000100");
    return true;
  }

  async disconnect(): Promise<boolean> {
    // await this.transmit("007080FF00");
    // await CCIDPlugin.disconnect(this.deviceName);
    return true;
  }

  async transmit(s: string): Promise<string> {
    console.log(this.deviceName, s);
    const r = await OMAPIBridge.transceive(this.deviceName, s);
    console.log("Ret:", r);
    return r;
  }
}