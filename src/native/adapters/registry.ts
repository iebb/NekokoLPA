import {Adapter} from "@/native/adapters/adapter";
import {BleError, Characteristic, Device as BLEDevice} from 'react-native-ble-plx';

export const Adapters: {[key: string]: Adapter} = {};

export const ConnectedBluetoothDevices: BLEDevice[] = [];