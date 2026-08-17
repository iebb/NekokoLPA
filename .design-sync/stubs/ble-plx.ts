// Browser stub for react-native-ble-plx. Its published entry is untranspiled
// TypeScript source; the harness never talks to a radio, so the types it
// exports are all the screens need at build time.
export class BleManager {
  onStateChange(_cb: (s: string) => void) {
    return {remove: () => {}};
  }
  startDeviceScan() {}
  stopDeviceScan() {}
  destroy() {}
}
export type Device = any;
export type Characteristic = any;
export type BleError = any;
export const State = {PoweredOn: 'PoweredOn', PoweredOff: 'PoweredOff'};
