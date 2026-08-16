import {Dispatch} from '@reduxjs/toolkit';
import {Platform} from 'react-native';

import {Adapter, Device} from '@/lpa/adapters/Adapter';
import {Adapters, ConnectedBluetoothDevices} from '@/lpa/adapters/registry';
import {CcidDevice} from '@/lpa/adapters/CcidDevice';
import {OmapiDevice} from '@/lpa/adapters/OmapiDevice';
import {EstkMeRed} from '@/lpa/adapters/EstkMeRedDevice';
import {SimLinkDevice} from '@/lpa/adapters/SimLinkDevice';
import {CCIDPlugin, OMAPIBridge} from '@/lpa/bridge/nativeModules';
import {setInternalDevices, setTargetDevice} from '@/store/slices';
import {getAIDList} from '@/shared/utils/aid';

/** Shape of one entry in OMAPIBridge.listDevices' JSON payload. */
interface OmapiSlot {
  name: string;
  available: string;
  slotAvailable?: string;
  description?: string;
  signatures?: string;
}

/** Bluetooth device-name prefixes we know how to drive. */
const BLE_ADAPTERS: {prefix: string; create: (device: any) => Device}[] = [
  {prefix: 'ESTKme-RED', create: d => new EstkMeRed(d)},
  {prefix: 'eSIM_Writer', create: d => new SimLinkDevice(d)},
];

async function discoverOmapiDevices(): Promise<Device[]> {
  if (Platform.OS !== 'android') {
    return [];
  }
  const slots: OmapiSlot[] = JSON.parse(await OMAPIBridge.listDevices(getAIDList()));
  return slots.map(slot => {
    const device = new OmapiDevice(slot.name, slot.available === 'true');
    if (slot.available !== 'true') {
      device.slotAvailable = slot.slotAvailable === 'true';
      device.description = slot.description ?? '';
      device.signatures = slot.signatures ?? '';
    }
    return device;
  });
}

async function discoverCcidDevices(): Promise<Device[]> {
  try {
    const readers: string[] = (await CCIDPlugin.listReaders()) ?? [];
    return readers.map(
      reader =>
        new CcidDevice(reader, Platform.OS === 'ios' || readers.length > 1 ? reader : 'USB'),
    );
  } catch (error) {
    console.error('[LPA] Failed to list CCID readers', error);
    return [];
  }
}

function discoverBluetoothDevices(): Device[] {
  const devices: Device[] = [];
  for (const bleDevice of ConnectedBluetoothDevices) {
    const name = bleDevice.name;
    if (!name) {
      continue;
    }
    const match = BLE_ADAPTERS.find(a => name.startsWith(a.prefix));
    if (match) {
      devices.push(match.create(bleDevice));
    }
  }
  return devices;
}

/**
 * Enumerates every reachable eUICC carrier, reconciles the adapter registry
 * against it, and publishes the resulting device ids to Redux.
 *
 * @param targetDevice device id the UI should switch to once it appears.
 */
export async function setupDevices(
  dispatch: Dispatch,
  targetDevice: string | null = null,
): Promise<void> {
  const devices: Device[] = [
    ...(await discoverOmapiDevices()),
    ...(await discoverCcidDevices()),
    ...discoverBluetoothDevices(),
  ];

  const liveIds = new Set(devices.map(d => d.deviceId));

  // Drop adapters whose device has gone away.
  for (const deviceId of Object.keys(Adapters)) {
    if (!liveIds.has(deviceId)) {
      try {
        await Adapters[deviceId].device.disconnect();
      } catch {
        // The device is already gone; nothing to clean up.
      }
      delete Adapters[deviceId];
    }
  }

  for (const device of devices) {
    const existing = Adapters[device.deviceId];
    if (existing) {
      await existing.device.refresh();
    } else {
      await new Adapter(device, dispatch).initialize();
    }
  }

  dispatch(setInternalDevices(devices.map(d => d.deviceId)));
  if (targetDevice) {
    dispatch(setTargetDevice(targetDevice));
  }
}
