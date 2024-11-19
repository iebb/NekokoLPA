import {NativeModules} from "react-native";
import {Device} from "@/native/adapters/adapter";
const { CCIDPlugin } = NativeModules;


export class RemoteDevice implements Device {
  type = "remote";
  deviceName = "";
  deviceId = "";
  url = "";
  available = true;
  explicitConnectionRequired = true;

  constructor(url: string) {
    this.deviceName = "Remote Device";
    this.url = url;
    this.deviceId = "remote:" + url;
  }

  async connect(): Promise<boolean> {
    // await CCIDPlugin.connect(this.deviceName);
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
    // await CCIDPlugin.disconnect(this.deviceName);
    return true;
  }

  async transmit(s: string): Promise<string> {
    try {
      // Prepare the payload
      const payload = {
        apdu: s
      };

      // Send the POST request
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Handle the response
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from server:', errorData);
        return "";
      }

      const data = await response.json();
      return data.response_apdu;
    } catch (error) {
      console.error('Error during fetch:', error);
    }
    return  "";
  }

}