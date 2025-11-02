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

export default TurboModuleRegistry.getEnforcing<Spec>('NekokoLPA');

