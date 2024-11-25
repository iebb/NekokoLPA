import {Action, configureStore, createSlice, PayloadAction, ThunkAction} from '@reduxjs/toolkit';
import {AuthenticateResult, DownloadResult, EuiccInfo2, ProfileMetadataMap, Profiles} from "@/native/types";
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {MMKV} from "react-native-mmkv";
import {Adapter, Device} from "@/native/adapters/adapter";
import {EuiccConfiguredAddresses, Notification} from "@/native/types/LPA";


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export interface EuiccList {
    available: boolean;
    eid?: string;
    bytesFree?: number;
    version?: string;
    euiccInfo2?: EuiccInfo2;
    notifications: Notification[];
    euiccAddress?: EuiccConfiguredAddresses;
    profiles: ProfileMetadataMap[];
    message: string;
    name: string;
}


interface LPAState {
    internalList: string[];
    externalList: string[];
}

const initialState: LPAState = {
    internalList: [],
    externalList: [],
};

interface EUICCStateMap {
    [key: string]: EuiccList;
}

const eUICCInitialState: EUICCStateMap = {};

export const globalDataStore = createSlice({
    name: 'LPA',
    initialState,
    reducers: {
        setGlobalState: (state, action: PayloadAction<object>) => {
            for(const k of Object.keys(action.payload)) {
                // @ts-ignore
                state[k] = action.payload[k];
            }
        },
        setInternalDevices: (state, action: PayloadAction<object>) => {
            // @ts-ignore
            state.internalList = action.payload;
        },
        setExternalDevices: (state, action: PayloadAction<object>) => {
            // @ts-ignore
            state.externalList = action.payload;
        },
    },
});

export const DeviceStateDataStore = createSlice({
    name: 'DeviceState',
    initialState: eUICCInitialState,
    reducers: {
        setDeviceState: (state, action: PayloadAction<[value: object, eUICC: string]>) => {
            const [value, eUICC] = action.payload;
            // @ts-ignore
            if (!state[eUICC]) state[eUICC] = {};
            for(const k of Object.keys(value)) {
                // @ts-ignore
                state[eUICC][k] = value[k];
            }
        },
    },
});


export const store = configureStore({
    reducer: {
        GlobalState: globalDataStore.reducer,
        DeviceState: DeviceStateDataStore.reducer,
    },
});

export const selectState = (state: RootState) => state.GlobalState;
export const selectDeviceState = (e: string) => (state: RootState) => state.DeviceState[e] || {};
export const selectDeviceStates = (state: RootState) => state.DeviceState;

export const { setGlobalState, setInternalDevices } = globalDataStore.actions;
export const { setDeviceState } = DeviceStateDataStore.actions;