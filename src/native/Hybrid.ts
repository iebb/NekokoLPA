import {NativeModules, Platform} from "react-native";
import {CCIDDevice} from "@/native/adapters/ccid_adapter";
import {OMAPIDevice} from "@/native/adapters/omapi_adapter";
import {Adapter, Device} from "@/native/adapters/adapter";
import {Adapters} from "@/native/adapters/registry";
import {setInternalDevices} from "@/redux/stateStore";
import {Dispatch} from "@reduxjs/toolkit";
import {RemoteDevice} from "@/native/adapters/remote_adapter";
import {preferences} from "@/utils/mmkv";
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
      _devices.push(new CCIDDevice(r) as Device);
    }
  }

  const remoteDevice = preferences.getString("remoteDevice") ?? "";
  const useRemoteDevice = preferences.getString("useRemoteDevice") ?? "off";

  if (useRemoteDevice === "on" && (remoteDevice.startsWith("http://") || remoteDevice.startsWith("https://"))) {
    _devices.push(new RemoteDevice(remoteDevice));
  }

  resolver(_devices);
}

export async function setupDevices(dispatch: Dispatch) {
  const resolver = (internalList: Device[]) => {
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
    dispatch(setInternalDevices(internalList.map((d: Device) => d.deviceId)));
  };

  setupInternalDevices(resolver);
}

