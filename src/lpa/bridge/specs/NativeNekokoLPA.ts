import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  // OMAPIBridge methods
  openSTK(device: string): void;
  listDevices(aidList: string): Promise<string>;
  transceiveOMAPI(device: string, apdu: string): Promise<string>;

  // CCIDPlugin methods
  listReaders(): Promise<string[]>;
  disconnectCCID(name: string): Promise<void>;
  transceiveCCID(name: string, capdu: string): Promise<string>;
  connectCCID(name: string): Promise<string>;

  // CustomHttp methods
  sendHttpRequest(url: string, body: string): Promise<string>;
}

/**
 * Only Android implements this TurboModule (ee.nekoko.nlpa.NekokoLPA). On iOS
 * and Mac Catalyst the same functionality is provided by the legacy bridge
 * modules CCIDPlugin and CustomHttp, and codegen emits only the spec header
 * with nothing registering a module under this name.
 *
 * So this must be `get`, not `getEnforcing`: getEnforcing throws when the
 * module is missing, which killed the app at import time on iOS before the
 * deliberate `NativeNekokoLPA || NativeModules.NekokoLPA` fallback in
 * ../nativeModules could ever run.
 */
export default TurboModuleRegistry.get<Spec>('NekokoLPA');
