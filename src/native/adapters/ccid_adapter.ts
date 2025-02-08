import {NativeModules} from "react-native";
import {Device} from "@/native/adapters/adapter";
import {preferences} from "@/utils/mmkv";
import {AIDList} from "@/utils/aid";
const { CCIDPlugin } = NativeModules;


export class CCIDDevice implements Device {
  type = "ccid";
  deviceName = "";
  deviceId = "";
  channel = "1";
  available = false;
  description = "";
  explicitConnectionRequired = false;

  constructor(deviceName: string, altName: string) {
    this.deviceName = altName;
    this.deviceId = "ccid:" + deviceName;
  }

  async connect(): Promise<boolean> {
    // TODO: try
    try {
      const resp = await CCIDPlugin.connect(this.deviceName);
      this.available = true;
      await this.transmit("80AA00000AA9088100820101830107");
      const channelResp = await this.transmit("0070000001");
      const channel = channelResp.substring(0, 2);
      this.channel = channel.substring(1);


      for(const aid of AIDList.split(",")) {
        const aidResp = await this.transmit(channel + "A4040010" + aid);
        if (aidResp === "6a82") {
        } else {
          return true;
        }
      }
      return false;
    } catch (error: any) {
      console.log("CCID Connect Err", error);
      this.description = error?.message;
      return false;
    }
  }

  async accessRule(): Promise<boolean> {
    await this.transmitP("00a40004023f00");
    await this.transmitP("00c000001f");
    await this.transmitP("00a40004027f10");
    await this.transmitP("00c000001f");
    await this.transmitP("00a40004026f40");
    await this.transmitP("00c0000020");
    await this.transmitP("00b201040e");
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

  async transmitP(s: string): Promise<string> {
    console.log("P<", s);
    const ret = await CCIDPlugin.transceive(this.deviceName, s);
    console.log("P>", ret);
    return ret;
  }

}