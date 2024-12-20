import {NativeModules} from "react-native";
import {setupDevice} from "@/native/jsnative/setup";
import {Device} from "@/native/adapters/adapter";
import {Adapters} from "@/native/adapters/registry";

const { OMAPIBridge } = NativeModules;


export class OMAPIDevice implements Device {
  type = "omapi";
  deviceName = "";
  deviceId = "";
  explicitConnectionRequired = false;
  available = true;
  signatures = "";
  channel = "1";
  description = "";
  slotAvailable = false;

  constructor(deviceName: string, available: boolean = false) {
    this.deviceName = deviceName;
    this.deviceId = "omapi:" + deviceName;
    this.available = available;
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