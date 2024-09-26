import {Action, configureStore, createSlice, PayloadAction, ThunkAction} from '@reduxjs/toolkit';
import {AuthenticateResult, DownloadResult, EuiccInfo2, Profiles} from "@/native/types";
import {ActionStatus} from "@/native/consts";
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {MMKV} from "react-native-mmkv";


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

interface ErrorBodyHeader {
    body: string;
    header: string;
    timestamp: number;
}

interface EUICCState {
    profileList?: Profiles;
    // euiccInfo2?: EuiccInfo2;
    status?: ActionStatus;
    authenticateResult?: AuthenticateResult;
    downloadResult?: DownloadResult;
    eid?: string;
}

export interface EuiccList {
    available: boolean;
    eid?: string;
    bytesFree?: number;
    version?: string;
    // euiccInfo2?: EuiccInfo2;
    profiles?: Profiles;
    message: string;
    name: string;
}


interface LPAState {
    euiccList: EuiccList[];
    // euiccReaders: { available: boolean, name: string }[];
    currentEuicc: string;
    error?: ErrorBodyHeader;
}
const initialState: LPAState = {
    euiccList: [],
    currentEuicc: "NONE",
    // euiccReaders: [],
};

interface EUICCStateMap {
    [key: string]: EUICCState;
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
    },
});

export const eUICCDataStore = createSlice({
    name: 'eUICC',
    initialState: eUICCInitialState,
    reducers: {
        setState: (state, action: PayloadAction<[value: object, eUICC: string]>) => {
            const [value, eUICC] = action.payload;
            if (!state[eUICC]) state[eUICC] = {};
            for(const k of Object.keys(value)) {
                // @ts-ignore
                state[eUICC][k] = value[k];
            }
        },
    },
});




export const storage = new MMKV();

function getAppConfig(): AppConfig {
    return {
        stealthMode: storage.getString('stealthMode') || 'none',
        language: storage.getString('language') || 'en',
        theme: storage.getString('theme') || 'default',
    }
}

interface AppConfig {
    stealthMode: string;
    language: string;
    theme: string;
}

const nextValues = {
    stealthMode: ["none", "medium", "hard"],
    language: ["en", "zh"],
    theme: ["default", "dark"],
}

export const appConfigStore = createSlice({
    name: 'AppConfig',
    initialState: getAppConfig(),
    reducers: {
        setValue: (state, action: PayloadAction<object>) => {
            for(const k of Object.keys(action.payload)) {
                // @ts-ignore
                state[k] = action.payload[k];
                // @ts-ignore
                storage.set(k, action.payload[k]);
            }
        },
        nextValue: (state, action: PayloadAction<string>) => {
            // @ts-ignore
            const v = nextValues[action.payload];
            // @ts-ignore
            state[action.payload] = v[(v.indexOf(state[action.payload]) + 1) % v.length];
            // @ts-ignore
            storage.set(action.payload, state[action.payload]);
        },
    },
});


export const store = configureStore({
    reducer: {
        LPA: globalDataStore.reducer,
        eUICC: eUICCDataStore.reducer,
        AppConfig: appConfigStore.reducer,
    },
});

export const selectState = (state: RootState) => state.LPA;
export const selectEuicc = (e: string) => (state: RootState) => state.eUICC[e] || {};
export const selectAppConfig = (state: RootState) => state.AppConfig;

export const { setGlobalState } = globalDataStore.actions;
export const { setState } = eUICCDataStore.actions;
export const { nextValue } = appConfigStore.actions;