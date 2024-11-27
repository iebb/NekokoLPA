import {NativeModules} from "react-native";
import {Device} from "@/native/adapters/adapter";
import {preferences} from "@/storage/mmkv";
const { CCIDPlugin } = NativeModules;


export class CCIDDevice implements Device {
  type = "ccid";
  deviceName = "";
  deviceId = "";
  channel = "1";
  available = true;
  explicitConnectionRequired = false;

  constructor(deviceName: string) {
    this.deviceName = deviceName;
    this.deviceId = "ccid:" + deviceName;
  }

  async connect(): Promise<boolean> {
    // TODO: try
    await CCIDPlugin.connect(this.deviceName);
    await this.transmit("80AA00000AA9088100820101830107");
    const channelResp = await this.transmit("0070000001");
    const channel = channelResp.substring(0, 2);
    this.channel = channel.substring(1);
    const aidResp = await this.transmit(channel + "A4040010A0000005591010FFFFFFFF8900000100");
    if (aidResp === "6a82") {
      if (preferences.getString("customAidCompat") === "5ber") {
        await this.transmit(channel + "A4040010A0000005591010FFFFFFFF8900050500");
      }
    }
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