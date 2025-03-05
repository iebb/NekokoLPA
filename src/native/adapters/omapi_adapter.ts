import {NativeModules} from "react-native";
import {setupDevice} from "@/native/jsnative/setup";
import {Device} from "@/native/adapters/adapter";
import {Adapters} from "@/native/adapters/registry";

const { OMAPIBridge } = NativeModules;


export class OMAPIDevice implements Device {
  type = "omapi";
  deviceName = "";
  displayName = "";
  deviceId = "";
  explicitConnectionRequired = false;
  available = true;
  signatures = "";
  channel = "1";
  description = "";
  slotAvailable = false;

  constructor(deviceName: string, available: boolean = false) {
    this.deviceName = deviceName;
    this.displayName = deviceName;
    this.deviceId = "omapi:" + deviceName;
    this.available = available;
  }

  async reconnect(): Promise<boolean> {
    return this.available;
  }

  async refresh(): Promise<boolean> {
    return this.available;
  }

  async connect(): Promise<boolean> {
    return this.available;
  }

  async disconnect(): Promise<boolean> {
    return this.available;
  }

  async transmit(s: string): Promise<string> {
    if (this.available) {
      return await OMAPIBridge.transceive(this.deviceName, s);
    }
    return "6a00";
  }
}