import {NativeModules, Platform} from "react-native";
import {CCIDDevice} from "@/native/adapters/ccid_adapter";
import {OMAPIDevice} from "@/native/adapters/omapi_adapter";
import {Adapter, Device} from "@/native/adapters/adapter";
import {Adapters} from "@/native/adapters/registry";
import {setInternalDevices} from "@/redux/stateStore";
import {Dispatch} from "@reduxjs/toolkit";

const { CCIDPlugin, OMAPIBridge, CustomHttp } = NativeModules;


export async function setupInternalDevices(): Promise<Device[]> {
  const _devices = [];
  if (Platform.OS === 'android') {
    const devices = JSON.parse(await OMAPIBridge.listDevices());
    for(const d of devices) {
      if (d.available === 'true') {
        _devices.push(new OMAPIDevice(d.name, true) as Device);
      } else {
        const dv = new OMAPIDevice(d.name, false) as Device;
        dv.description = d.description;
        dv.signatures = d.signatures;
        _devices.push(dv);
      }
    }

  }

  if (CCIDPlugin) {
    const readers = await CCIDPlugin.listReaders();
    for(const r of readers) {
      _devices.push(new CCIDDevice(r) as Device);
    }
  }
  return _devices;
}

export async function setupDevices(dispatch: Dispatch) {
  setupInternalDevices().then(internalList => {
    for(const f of Object.keys(Adapters)) {
      try {
        Adapters[f].device.disconnect();
        delete Adapters[f];
      } catch (e) {

      }
    }
    for(const f of Object.keys(Adapters)) Adapters[f].obsolete = true;
    for(const d of internalList) (new Adapter(d, dispatch)).initialize();
    for(const f of Object.keys(Adapters)) if (Adapters[f].obsolete) {
      Adapters[f].device.disconnect();
      delete Adapters[f];
    }
    dispatch(setInternalDevices(internalList.map(d => d.deviceId)));
  }).catch(e => console.error(e));
}

