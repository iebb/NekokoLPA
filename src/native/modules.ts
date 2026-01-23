import { NativeModules } from "react-native";
import NativeNekokoLPA from "@/native/specs/NativeNekokoLPA";

// Use a getter for NekokoLPA to handle late registration or missing modules gracefully
const getNekokoLPA = () => NativeNekokoLPA || NativeModules.NekokoLPA;

export const OMAPIBridge = {
  openSTK: (device: string) => {
    const NekokoLPA = getNekokoLPA();
    if (NekokoLPA) {
      return NekokoLPA.openSTK(device);
    }
    return NativeModules.OMAPIBridge?.openSTK?.(device);
  },
  listDevices: (aidList: string) => {
    const NekokoLPA = getNekokoLPA();
    if (NekokoLPA) {
      return NekokoLPA.listDevices(aidList);
    }
    return NativeModules.OMAPIBridge?.listDevices?.(aidList);
  },
  transceive: (device: string, apdu: string) => {
    const NekokoLPA = getNekokoLPA();
    if (NekokoLPA) {
      return NekokoLPA.transceiveOMAPI(device, apdu);
    }
    return NativeModules.OMAPIBridge?.transceive?.(device, apdu);
  },
};

export const CCIDPlugin = {
  listReaders: () => {
    const NekokoLPA = getNekokoLPA();
    if (NekokoLPA) {
      return NekokoLPA.listReaders();
    }
    return NativeModules.CCIDPlugin?.listReaders?.();
  },
  disconnect: (name: string) => {
    const NekokoLPA = getNekokoLPA();
    if (NekokoLPA) {
      return NekokoLPA.disconnectCCID(name);
    }
    return NativeModules.CCIDPlugin?.disconnect?.(name);
  },
  transceive: (name: string, capdu: string) => {
    const NekokoLPA = getNekokoLPA();
    if (NekokoLPA) {
      return NekokoLPA.transceiveCCID(name, capdu);
    }
    return NativeModules.CCIDPlugin?.transceive?.(name, capdu);
  },
  connect: (name: string) => {
    const NekokoLPA = getNekokoLPA();
    if (NekokoLPA) {
      return NekokoLPA.connectCCID(name);
    }
    return NativeModules.CCIDPlugin?.connect?.(name);
  },
};

export const CustomHttp = {
  sendHttpRequest: (url: string, body: string) => {
    const NekokoLPA = getNekokoLPA();
    if (NekokoLPA) {
      return NekokoLPA.sendHttpRequest(url, body);
    }
    return NativeModules.CustomHttp?.sendHttpRequest?.(url, body);
  },
};
