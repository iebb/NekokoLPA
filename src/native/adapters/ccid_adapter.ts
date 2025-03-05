import {NativeModules} from "react-native";
import {Device} from "@/native/adapters/adapter";
import {preferences} from "@/utils/mmkv";
import {AIDList} from "@/utils/aid";
const { CCIDPlugin } = NativeModules;


export class CCIDDevice implements Device {
  type = "ccid";
  displayName = "";
  deviceName = "";
  deviceId = "";
  channel = "1";
  available = false;
  description = "";
  explicitConnectionRequired = false;

  constructor(deviceName: string, altName: string) {
    this.deviceName = deviceName;
    this.displayName = altName;
    this.deviceId = "ccid:" + deviceName;
  }

  async connect(): Promise<boolean> {
    // TODO: try
    try {
      await CCIDPlugin.connect(this.deviceName);
      await this.transmit("80AA00000AA9088100820101830107");
      const channelResp = await this.transmit("0070000001");
      const channel = channelResp.substring(0, 2);
      this.channel = channel.substring(1);

      if (channelResp.startsWith("6a")) {
        this.description = "Channel cannot be opened";
        return false;
      }

      for(const aid of AIDList.split(",")) {
        const aidResp = await this.transmit(channel + "A4040010" + aid);
        if (aidResp === "6a82") {
        } else {
          this.available = true;
          return true;
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
      await this.transmit("007080FF00");
    } catch (error) {
    }
    await CCIDPlugin.disconnect(this.deviceName);
    return true;
  }

  async transmit(s: string): Promise<string> {
    return await CCIDPlugin.transceive(this.deviceName, s);
  }

  async refresh(): Promise<boolean> {
    await this.disconnect();
    return await this.connect();
  }


}