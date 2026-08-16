import {configureStore} from '@reduxjs/toolkit';
import {useDispatch, useSelector} from 'react-redux';

import {deviceListSlice, deviceStateSlice, DeviceState} from '@/store/slices';

export const store = configureStore({
  reducer: {
    deviceList: deviceListSlice.reducer,
    deviceState: deviceStateSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/** Typed `useDispatch`, so thunks and actions keep their types at call sites. */
export const useAppDispatch = () => useDispatch<AppDispatch>();
/** Typed `useSelector`, so `state` is never `any`. */
export const useAppSelector = useSelector.withTypes<RootState>();

const EMPTY_DEVICE_STATE: DeviceState = {};

/**
 * Selects one device's state. Returns a shared frozen empty object when the
 * device is unknown, so callers can destructure without null checks and
 * without allocating a new object on every render (which would defeat
 * `useSelector`'s reference equality check and re-render forever).
 */
export const selectDeviceState = (deviceId: string) => (state: RootState) =>
  state.deviceState[deviceId] ?? EMPTY_DEVICE_STATE;

export const selectDeviceList = (state: RootState) => state.deviceList;
