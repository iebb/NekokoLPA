import {Alert, NativeModules} from "react-native";
import {Device} from "@/native/adapters/adapter";
import {version} from '../../../package.json';
import prompt from "react-native-prompt-android";
import {preferences} from "@/storage/mmkv";
import {MMKV} from "react-native-mmkv";
const { CCIDPlugin } = NativeModules;


export const remoteTokens = new MMKV({id: 'remoteTokens'});

export class RemoteDevice implements Device {
  type = "remote";
  deviceName = "";
  deviceId = "";
  url = "";
  pin = "";
  available = true;
  explicitConnectionRequired = true;

  constructor(url: string) {
    this.deviceName = "Remote Device";
    this.url = url;
    this.deviceId = "remote:" + url;
  }

  async connect(): Promise<boolean> {

    if (remoteTokens.getString(this.url)) {
      await this.transmit("80AA00000AA9088100820101830107");
      await this.transmit("0070000001");
      await this.transmit("01A4040010A0000005591010FFFFFFFF8900000100");
      return true;
    } else {
      prompt(
        'Connect to remote device',
        `Remote Endpoint\n${this.url}\nrequires a PIN to connect to.`,
        [
          {
            text: 'Cancel',
            onPress: () => {
              this.available = false;
            },
            style: 'cancel'
          },
          {
            text: 'OK',
            onPress: async (pin: string) => {
              console.log("POST: " + this.url + "/authorization");
              const response = await fetch(this.url + "/authorization", {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Version': version,
                },
                body: JSON.stringify({ pin })
              });

              if (!response.ok) {
                const errorData = await response.json();
                console.error('Error from server:', errorData);
                Alert.alert('Authentication failed', errorData.message, [
                  {text: 'OK', onPress: () => console.log('OK Pressed')},
                ]);
                this.available = false;
              } else {
                const data = await response.json();
                console.error('R-Device Response:', data);
                remoteTokens.set(this.url, data.token);
                this.connect();
              }

            }},
        ],
        {
          cancelable: true,
          defaultValue: '',
          placeholder: 'placeholder'
        }
      );
      return false;
    }

    /*


    // await CCIDPlugin.connect(this.deviceName);
     */
  }

  async disconnect(): Promise<boolean> {
    // try {
    //   await this.transmit("007080FF00");
    // } catch (error) {
    // }
    // // await CCIDPlugin.disconnect(this.deviceName);
    // return true;
  }

  async transmit(request: string): Promise<string> {
    if (!remoteTokens.getString(this.url)) {
      throw Error("Unauthorized");
    }
    try {
      const response = await fetch(this.url + "/send_apdu", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Version': version,
        },
        body: JSON.stringify({
          request: request,
          token: remoteTokens.getString(this.url)
        })
      });

      // Handle the response
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status >= 400 && response.status < 500) {
          remoteTokens.delete(this.url);
          this.connect();
        }
        console.error('Error during fetch:', errorData);
      }

      const data = await response.json();
      console.error('R-Device Response:', data.response);
      return data.response;
    } catch (error) {
      console.error('Error during fetch:', error);
    }
    return  "";
  }

}