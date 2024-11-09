import {NativeModules, Platform} from "react-native";
import {CCIDDevice} from "@/native/adapters/ccid_adapter";
import {OMAPIDevice} from "@/native/adapters/omapi_adapter";
import {Adapter, Device} from "@/native/adapters/adapter";

const { CCIDPlugin, OMAPIBridge, CustomHttp } = NativeModules;


export async function setupInternalDevices(): Promise<Device[]> {
  if (Platform.OS === 'android') {
    const devices = JSON.parse(await OMAPIBridge.listDevices());
    return devices.map((d: any) => {
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


export async function setupNative() {
  // if (Platform.OS === 'android') {
  //   const devices = JSON.parse(await OMAPIBridge.listDevices());
  //   const available_devices = devices.filter((d: any) => d.available === 'true');
  //   if (available_devices.length > 0) {
  //     const device = new OMAPIDevice(available_devices[0].name);
  //     const adapter = new Adapter(device);
  //     await adapter.connect();
  //
  //     console.log("eid2", await adapter.get_eid());
  //     console.log("get_profiles", await adapter.get_profiles());
  //
  //     await adapter.disconnect();
  //   }
  // }
  //

}
