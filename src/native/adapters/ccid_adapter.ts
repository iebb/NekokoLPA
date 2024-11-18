import {NativeModules} from "react-native";
import {Device} from "@/native/adapters/adapter";
const { CCIDPlugin } = NativeModules;


export class CCIDDevice implements Device {
  type = "ccid";
  deviceName = "";
  deviceId = "";
  available = true;
  explicitConnectionRequired = true;

  constructor(deviceName: string) {
    this.deviceName = deviceName;
    this.deviceId = "ccid:" + deviceName;
  }

  async connect(): Promise<boolean> {
    await CCIDPlugin.connect(this.deviceName);
    await this.transmit("80AA00000AA9088100820101830107");
    await this.transmit("0070000001");
    await this.transmit("01A4040010A0000005591010FFFFFFFF8900000100");
    return true;
  }

  async disconnect(): Promise<boolean> {
    try {
      await this.transmit("007080FF00");
    } catch (error) {
    }
    await CCIDPlugin.disconnect(this.deviceName);
    return true;
  }

  async transmit(s: string): Promise<string> {
    return await CCIDPlugin.transceive(this.deviceName, s);
  }

}