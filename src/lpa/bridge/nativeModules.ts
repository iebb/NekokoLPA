import {NativeModules} from 'react-native';
import NativeNekokoLPA from '@/lpa/bridge/specs/NativeNekokoLPA';
import {devLog} from '@/shared/utils/devLog';

const NekokoLPA = NativeNekokoLPA || NativeModules.NekokoLPA;

if (!NekokoLPA) {
  // Mac Catalyst does not register the TurboModule, but the legacy bridge
  // modules are present and work, so that is an expected fallback rather than
  // a problem. Only the case where neither exists is worth warning about —
  // otherwise every Catalyst launch raises a LogBox warning for a healthy app.
  const hasLegacyModules = !!(
    NativeModules.OMAPIBridge ||
    NativeModules.CCIDPlugin ||
    NativeModules.CustomHttp
  );
  if (hasLegacyModules) {
    devLog('NekokoLPA TurboModule not registered; using the legacy bridge modules');
  } else {
    console.warn('No NekokoLPA native modules found: card access will not work');
  }
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
