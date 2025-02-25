import {NativeModules, Platform} from "react-native";
import {CCIDDevice} from "@/native/adapters/ccid_adapter";
import {OMAPIDevice} from "@/native/adapters/omapi_adapter";
import {Adapter, Device} from "@/native/adapters/adapter";
import {Adapters} from "@/native/adapters/registry";
import {setInternalDevices} from "@/redux/stateStore";
import {Dispatch} from "@reduxjs/toolkit";
import {AIDList} from "@/utils/aid";

const { CCIDPlugin, OMAPIBridge, CustomHttp } = NativeModules;


export async function setupInternalDevices(resolver: any) {
  const _devices = [];
  if (Platform.OS === 'android') {
    const devices = JSON.parse(await OMAPIBridge.listDevices(AIDList));
    for(const d of devices) {
      if (d.available === 'true') {
        _devices.push(new OMAPIDevice(d.name, true) as Device);
      } else {
        const dv = new OMAPIDevice(d.name, false) as Device;
        dv.slotAvailable = d.slotAvailable === 'true';
        dv.description = d.description;
        dv.signatures = d.signatures;
        _devices.push(dv);
      }
    }

  }

  if (CCIDPlugin) {
    const readers = await CCIDPlugin.listReaders();
    for(const r of readers) {
      const d = new CCIDDevice(r, (Platform.OS === 'ios' || readers.length > 1) ? r : "USB");
      await d.connect();
      _devices.push(d);
    }
  }

  resolver(_devices);
}

export async function setupDevices(dispatch: Dispatch) {
  const resolver = (deviceList: Device[]) => {
    for(const f of Object.keys(Adapters)) {
      try {
        Adapters[f].device.disconnect();
        delete Adapters[f];
      } catch (e) {

      }
    }
    for(const f of Object.keys(Adapters)) Adapters[f].obsolete = true;
    for(const d of deviceList) (new Adapter(d, dispatch)).initialize();
    for(const f of Object.keys(Adapters)) if (Adapters[f].obsolete) {
      Adapters[f].device.disconnect();
      delete Adapters[f];
    }
    dispatch(setInternalDevices(deviceList.map((d: Device) => d.deviceId)));
  };

  setupInternalDevices(resolver);
}

