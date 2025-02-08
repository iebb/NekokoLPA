import {configureStore, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {EuiccInfo2, ProfileMetadataMap} from "@/native/types";
import {EuiccConfiguredAddresses, Notification} from "@/native/types/LPA";


export type RootState = ReturnType<typeof store.getState>;

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
        setInternalDevices: (state, action: PayloadAction<object>) => {
            // @ts-ignore
            state.internalList = action.payload;
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

export const { setInternalDevices } = globalDataStore.actions;
export const { setDeviceState } = DeviceStateDataStore.actions;