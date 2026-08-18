import {Dispatch} from '@reduxjs/toolkit';
import {Device} from 'react-native-ble-plx';

import {Adapters, ConnectedBluetoothDevices} from '@/lpa/adapters/registry';
import {setupDevices} from '@/lpa/deviceManager';

/** Device id as the adapter registry keys it. */
function adapterIdFor(bleId: string): string {
  return 'ble:' + bleId;
}

export async function connectDevice(device: Device) {
  if (!ConnectedBluetoothDevices.map(d => d.id).includes(device.id)) {
    ConnectedBluetoothDevices.push(device);
  }
}

/**
 * Drops a Bluetooth reader.
 *
 * Removing it from the registry is the part that matters: `setupDevices`
 * rebuilds the device list from that array, so a reader left in it comes
 * straight back as a tab on the next refresh however cleanly the link was
 * closed. The adapter's own disconnect is attempted first, and its failure is
 * not fatal — a reader that has already gone out of range cannot be closed
 * politely, and the user still wants it gone.
 */
export async function disconnectDevice(bleId: string, dispatch: Dispatch): Promise<void> {
  const adapter = Adapters[adapterIdFor(bleId)];
  try {
    await adapter?.device.disconnect();
  } catch (error) {
    console.warn('[BLE] disconnect failed, dropping the reader anyway', error);
  }

  const index = ConnectedBluetoothDevices.findIndex(d => d.id === bleId);
  if (index >= 0) {
    ConnectedBluetoothDevices.splice(index, 1);
  }

  await setupDevices(dispatch);
}

/**
 * Re-establishes a reader that is still known but no longer answering.
 *
 * BLE links drop for ordinary reasons — range, the reader sleeping, a radio
 * reset — and the adapter is left in place but unavailable. This tears the
 * link down and brings it back up rather than making the user forget the
 * reader and scan for it again.
 */
export async function reconnectDevice(bleId: string, dispatch: Dispatch): Promise<boolean> {
  const adapter = Adapters[adapterIdFor(bleId)];
  if (!adapter) {
    return false;
  }
  const ok = await adapter.device.reconnect();
  await setupDevices(dispatch);
  return ok;
}
