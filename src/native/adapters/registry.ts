import {Adapter} from "@/native/adapters/adapter";
import {Device as BLEDevice} from 'react-native-ble-plx';

export const Adapters: {[key: string]: Adapter} = {};

export const ConnectedBluetoothDevices: BLEDevice[] = [];