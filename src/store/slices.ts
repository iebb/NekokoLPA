import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {ProfileMetadataMap} from '@/lpa/types/profile';
import {EuiccConfiguredAddresses, EuiccInfo2, Notification} from '@/lpa/types/euicc';

/** Everything we know about a single eUICC, keyed by device id. */
export interface DeviceState {
  available?: boolean;
  eid?: string;
  bytesFree?: number;
  version?: string;
  euiccInfo2?: EuiccInfo2;
  notifications?: Notification[];
  euiccAddress?: EuiccConfiguredAddresses;
  profiles?: ProfileMetadataMap[];
  message?: string;
  name?: string;
}

export type DeviceStateMap = Record<string, DeviceState>;

interface DeviceListState {
  deviceList: string[];
  /** Device the UI should switch to once it appears in `deviceList`. */
  targetDevice?: string | null;
}

const deviceListInitialState: DeviceListState = {
  deviceList: [],
};

const deviceStateInitialState: DeviceStateMap = {};

export const deviceListSlice = createSlice({
  name: 'deviceList',
  initialState: deviceListInitialState,
  reducers: {
    setInternalDevices: (state, action: PayloadAction<string[]>) => {
      state.deviceList = action.payload;
    },
    setTargetDevice: (state, action: PayloadAction<string | null>) => {
      state.targetDevice = action.payload;
    },
  },
});

export const deviceStateSlice = createSlice({
  name: 'deviceState',
  initialState: deviceStateInitialState,
  reducers: {
    /** Shallow-merges a partial update into one device's state. */
    setDeviceState: (state, action: PayloadAction<[value: DeviceState, deviceId: string]>) => {
      const [value, deviceId] = action.payload;
      state[deviceId] = {...(state[deviceId] ?? {}), ...value};
    },
  },
});

export const {setInternalDevices, setTargetDevice} = deviceListSlice.actions;
export const {setDeviceState} = deviceStateSlice.actions;
