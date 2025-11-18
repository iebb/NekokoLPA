import {NativeModules} from "react-native";
import NativeNekokoLPA from "@/native/specs/NativeNekokoLPA";

const NekokoLPA = NativeNekokoLPA || NativeModules.NekokoLPA;

if (!NekokoLPA) {
  console.warn("NekokoLPA TurboModule not found, falling back to legacy modules");
}

export const OMAPIBridge = {
  openSTK: (device: string) => {
    if (NekokoLPA) {
      return NekokoLPA.openSTK(device);
    }
    return NativeModules.OMAPIBridge?.openSTK?.(device);
  },
  listDevices: (aidList: string) => {
    if (NekokoLPA) {
      return NekokoLPA.listDevices(aidList);
    }
    return NativeModules.OMAPIBridge?.listDevices?.(aidList);
  },
  transceive: (device: string, apdu: string) => {
    if (NekokoLPA) {
      return NekokoLPA.transceiveOMAPI(device, apdu);
    }
    return NativeModules.OMAPIBridge?.transceive?.(device, apdu);
  },
};

export const CCIDPlugin = {
  listReaders: () => {
    if (NekokoLPA) {
      return NekokoLPA.listReaders();
    }
    return NativeModules.CCIDPlugin?.listReaders?.();
  },
  disconnect: (name: string) => {
    if (NekokoLPA) {
      return NekokoLPA.disconnectCCID(name);
    }
    return NativeModules.CCIDPlugin?.disconnect?.(name);
  },
  transceive: (name: string, capdu: string) => {
    if (NekokoLPA) {
      return NekokoLPA.transceiveCCID(name, capdu);
    }
    return NativeModules.CCIDPlugin?.transceive?.(name, capdu);
  },
  connect: (name: string) => {
    if (NekokoLPA) {
      return NekokoLPA.connectCCID(name);
    }
    return NativeModules.CCIDPlugin?.connect?.(name);
  },
};

export const CustomHttp = {
  sendHttpRequest: (url: string, body: string) => {
    if (NekokoLPA) {
      return NekokoLPA.sendHttpRequest(url, body);
    }
    return NativeModules.CustomHttp?.sendHttpRequest?.(url, body);
  },
};

