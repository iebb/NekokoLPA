import {NativeModules, Platform} from "react-native";
import {CCIDDevice} from "@/native/adapters/ccid_adapter";
import {OMAPIDevice} from "@/native/adapters/omapi_adapter";
import {Adapter, Device} from "@/native/adapters/adapter";
import {Adapters, ConnectedBluetoothDevices} from "@/native/adapters/registry";
import {setInternalDevices, setTargetDevice} from "@/redux/stateStore";
import {Dispatch} from "@reduxjs/toolkit";
import {AIDList} from "@/utils/aid";
import {ESTKmeRED} from "@/native/adapters/estk_red_adapter";
import {SimLinkAdapter} from "@/native/adapters/9esim_adapter";

const { CCIDPlugin, OMAPIBridge } = NativeModules;


export async function setupDevices(dispatch: Dispatch, targetDevice: string | null = null) {

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
      _devices.push(d);
    }
  }


  for(const r of ConnectedBluetoothDevices) {
    if (r.name) {
      const d = r.name.startsWith("ESTKme-RED") ?
        new ESTKmeRED(r) :
        r.name.startsWith("eSIM_Writer") ?
          new SimLinkAdapter(r) :
          null;
      if (d) _devices.push(d);
    }
  }



  for(const f of Object.keys(Adapters)) {
    if (!_devices.map(d => d.deviceId).includes(f)) {
      try {
        Adapters[f].device.disconnect();
      } catch (e) {}
      delete Adapters[f];
    }
  }

  for(const d of _devices) {
    if (!Object.keys(Adapters).includes(d.deviceId)) {
      await (new Adapter(d, dispatch)).initialize();
    }
  }

  dispatch(setInternalDevices(_devices.map((d: Device) => d.deviceId)));
  if (targetDevice) {
    dispatch(setTargetDevice(targetDevice));
  }
}

