import {NativeModules, Platform} from "react-native";
import {CCIDDevice} from "@/native/adapters/ccid_adapter";
import {OMAPIDevice} from "@/native/adapters/omapi_adapter";
import {Adapter, Device} from "@/native/adapters/adapter";

const { CCIDPlugin, OMAPIBridge, CustomHttp } = NativeModules;


export async function setupInternalDevices(): Promise<Device[]> {
  console.log("refreshing");
  if (Platform.OS === 'android') {
    const devices = JSON.parse(await OMAPIBridge.listDevices());
    return devices.filter((d: any) => d.available === 'true').map((d: any) => {
      if (d.available === 'true') {
        return new OMAPIDevice(d.name);
      } else {
        // which is unavailable
        return new OMAPIDevice(d.name);
      }
    })
  }

  if (Platform.OS === 'ios') {
    const readers = await CCIDPlugin.listReaders();
    return readers.map((r: string) => new CCIDDevice(r));
  }
  return [];
}

