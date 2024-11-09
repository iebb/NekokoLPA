import {NativeModules} from "react-native";
import {setupDevice} from "@/native/jsnative/setup";

const { CCIDPlugin } = NativeModules;


export class CCIDDevice implements Device {
  deviceName = "";
  explicitConnectionRequired = true;

  constructor(deviceName: string) {
    this.deviceName = deviceName;
  }

  async connect(): Promise<boolean> {
    await CCIDPlugin.connect(this.deviceName);
    await this.transmit("80AA00000AA9088100820101830107");
    await this.transmit("0070000001");
    await this.transmit("01A4040010A0000005591010FFFFFFFF8900000100");
    return true;
  }

  async disconnect(): Promise<boolean> {
    await this.transmit("007080FF00");
    await CCIDPlugin.disconnect(this.deviceName);
    return true;
  }

  async transmit(s: string): Promise<string> {
    console.log(this.deviceName, s);
    const r = await CCIDPlugin.transceive(this.deviceName, s);
    console.log("Ret:", r);
    return r;
  }

  async execute(s: string, args: any[]): Promise<any> {
    const exec = await setupDevice(this);
    return exec(s, args);
  }
}