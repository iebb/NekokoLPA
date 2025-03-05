import {Device} from 'react-native-ble-plx';
import {ConnectedBluetoothDevices} from "@/native/adapters/registry";

export async function connectDevice(device: Device) {
  if (!ConnectedBluetoothDevices.map(d => d.id).includes(device.id)) {
    ConnectedBluetoothDevices.push(device);
  }
}