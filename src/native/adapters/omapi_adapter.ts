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
    return true;
  }

  async disconnect(): Promise<boolean> {
    return true;
  }

  async transmit(s: string): Promise<string> {
    const r = await OMAPIBridge.transceive(this.deviceName, s);
    return r;
  }
}