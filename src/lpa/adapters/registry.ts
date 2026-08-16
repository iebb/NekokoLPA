import {Adapter} from '@/lpa/adapters/Adapter';
import {Device as BLEDevice} from 'react-native-ble-plx';

export const Adapters: {[key: string]: Adapter} = {};

export const ConnectedBluetoothDevices: BLEDevice[] = [];
