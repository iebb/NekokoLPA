import {PermissionsAndroid, Platform} from 'react-native';
import {BleManager} from 'react-native-ble-plx';

let managerInstance: BleManager | null = null;

/**
 * Creates the BleManager on first use rather than at import time.
 *
 * Constructing it installs native event emitters. This module is pulled in
 * eagerly (RootNavigator imports BluetoothScreen, which imports this), so at
 * module scope that ran during startup — before RCTEventEmitter was registered
 * as callable under the new architecture. The result was an uncaught
 * "Module has not been registered as callable" error that killed the app
 * before it rendered anything. Deferring until the Bluetooth screen actually
 * mounts avoids that, and means builds that never open it (e.g. Mac Catalyst,
 * where the BLE readers aren't usable anyway) never spin BLE up at all.
 */
export function getBleManager(): BleManager {
  if (!managerInstance) {
    managerInstance = new BleManager();
  }
  return managerInstance;
}

export const requestBluetoothPermission = async () => {
  if (Platform.OS === 'ios') {
    return true;
  }
  if (Platform.OS === 'android' && PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) {
    const apiLevel = parseInt(Platform.Version.toString(), 10);

    if (apiLevel < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    if (
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
    ) {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      return (
        result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
        result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
        result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
      );
    }
  }

  // this.showErrorToast('Permission have not been granted')

  return false;
};
