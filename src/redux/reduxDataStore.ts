import {Action, configureStore, createSlice, PayloadAction, ThunkAction} from '@reduxjs/toolkit';
import {AuthenticateResult, DownloadResult, EuiccInfo2, ProfileMetadataMap, Profiles} from "@/native/types";
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
    profiles: ProfileMetadataMap[];
    message: string;
    name: string;
}


interface LPAState {
    euiccList?: EuiccList[];
    // euiccReaders: { available: boolean, name: string }[];
    currentEuicc: string;
    error?: ErrorBodyHeader;
}
const initialState: LPAState = {
    euiccList: [/*{
        "available":true,"bytesFree":12074,"eid":"89086030202200000024000059147583","message":"ok",
        "name":"USB Smartcard Reader",
        "profiles":[
            {"profileName":"128LTE.U5","ICCID":"980503042002172027F1","profileState":"0","MCC_MNC":"07F640","iccid":"8950304002207102721","PROFILE_SIZE":"0","profileOwnerMccMnc":"70604","serviceProviderName":"Movistar"},
            {"profileName":"Tigo","ICCID":"980503030349996864F6","profileState":"0","MCC_MNC":"07F630","iccid":"8950303030949986466","PROFILE_SIZE":"0","profileOwnerMccMnc":"70603","serviceProviderName":"Tigo"},
            {"profileName":"GO eSIM","ICCID":"98532601000700724606","profileState":"0","MCC_MNC":"72F812","iccid":"89356210007000276460","PROFILE_SIZE":"0","profileOwnerMccMnc":"27821","serviceProviderName":"gomobile"},
            {"profileName":"BetterRoaming","ICCID":"984474680000449413F1","profileState":"1","MCC_MNC":"02F480","iccid":"8944478600004449311","PROFILE_SIZE":"0","profileOwnerMccMnc":"20408","serviceProviderName":"Speedtest Travel"},
            {"profileName":"BetterRoaming","ICCID":"984474680000449423F9","profileState":"0","MCC_MNC":"02F480","iccid":"8944478600004449329","PROFILE_SIZE":"0","profileOwnerMccMnc":"20408","serviceProviderName":"BetterRoaming"},
            {"profileName":"Tigo","ICCID":"980503030319099627F3","profileState":"0","MCC_MNC":"07F630","iccid":"8950303030919069723","PROFILE_SIZE":"0","profileNickname":"Tigo","profileOwnerMccMnc":"70603","serviceProviderName":"Tigo"},
            {"profileName":"Tigo","ICCID":"980503030319099679F0","profileState":"0","MCC_MNC":"07F630","iccid":"8950303030919069970","PROFILE_SIZE":"0","profileNickname":"Tigo","profileOwnerMccMnc":"70603","serviceProviderName":"Tigo"},
            {"profileName":"GO eSIM","ICCID":"98532601000700033732","profileState":"0","MCC_MNC":"72F812","iccid":"89356210007000307323","PROFILE_SIZE":"0","profileOwnerMccMnc":"27821","serviceProviderName":"gomobile"}
        ],
        "version":"2.2.2",
        // "volatileFree":14342
    },{
        "available":true,"bytesFree":78028,"eid":"89049032005008882600041760486779","message":"ok",
        "name":"Bluetooth",
        "profiles":[
            {"profileName":"Tele2_TK_eSIM_test03","ICCID":"98997797000069365177","profileState":"0","MCC_MNC":"04F177","iccid":"89997779000096631577","PROFILE_SIZE":"0","profileNickname":"Tele2 +7 707 7123789 d:250911 t:保号卡","profileOwnerMccMnc":"40177","serviceProviderName":"Tele2"},
            {"profileName":"Tele2_TK_eSIM_test03","ICCID":"98997797000069568556","profileState":"0","MCC_MNC":"04F177","iccid":"89997779000096655865","PROFILE_SIZE":"0","profileNickname":"Tele2 +7 707 0605047 d:260202","profileOwnerMccMnc":"40177","serviceProviderName":"Tele2"},
            {"profileName":"Tele2_TK_eSIM_test03","ICCID":"98997797000069079374","profileState":"0","MCC_MNC":"04F177","iccid":"89997779000096703947","PROFILE_SIZE":"0","profileNickname":"Tele2 +7 707 9913337","profileOwnerMccMnc":"40177","serviceProviderName":"Tele2"},
            {"profileName":"Tele2_TK_eSIM_test03","ICCID":"98997797000069071306","profileState":"0","MCC_MNC":"04F177","iccid":"89997779000096703160","PROFILE_SIZE":"0","profileNickname":"Tele2 +7 707 9912339","profileOwnerMccMnc":"40177","serviceProviderName":"Tele2"},
            {"profileName":"Tele2_TK_eSIM_test03","ICCID":"98997797000069070222","profileState":"1","MCC_MNC":"04F177","iccid":"89997779000096702022","PROFILE_SIZE":"0","profileNickname":"Tele2 +7 747 7744744","profileOwnerMccMnc":"40177","serviceProviderName":"Tele2"},
            {"profileName":"Tele2_TK_eSIM_test03","ICCID":"98997797000069076813","profileState":"0","MCC_MNC":"04F177","iccid":"89997779000096708631","PROFILE_SIZE":"0","profileNickname":"Tele2 +7 707 7414514","profileOwnerMccMnc":"40177","serviceProviderName":"Tele2"},
            {"profileName":"Tele2_TK_eSIM_test03","ICCID":"98997797000069173102","profileState":"0","MCC_MNC":"04F177","iccid":"89997779000096711320","PROFILE_SIZE":"0","profileNickname":"Tele2 +7 700 1240123","profileOwnerMccMnc":"40177","serviceProviderName":"Tele2"},
            {"profileName":"Tele2_TK_eSIM_test03","ICCID":"98997797000069868913","profileState":"0","MCC_MNC":"04F177","iccid":"89997779000096689831","PROFILE_SIZE":"0","profileNickname":"Tele2 +7 700 7766550","profileOwnerMccMnc":"40177","serviceProviderName":"Tele2"},
            {"profileName":"Tele2_TK_eSIM_E01_2","ICCID":"98997797000079725080","profileState":"0","MCC_MNC":"04F177","iccid":"89997779000097270508","PROFILE_SIZE":"0","profileNickname":"Tele2 +7 7076543277","profileOwnerMccMnc":"40177","serviceProviderName":"Tele2"}
        ],
        "version":"2.2.0",
        // "volatileFree":6434
    }*/],
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
        nicknames: JSON.parse(storage.getString('nicknames') || '{}'),
    }
}

interface AppConfig {
    stealthMode: string;
    language: string;
    theme: string;
    nicknames: { [key: string]: string };
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
        setNickname: (state, action: PayloadAction<object>) => {
            for(const k of Object.keys(action.payload)) {
                // @ts-ignore
                state.nicknames[k] = action.payload[k];
                // @ts-ignore
                storage.set('nicknames', JSON.stringify(state.nicknames));
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
export const { nextValue, setNickname } = appConfigStore.actions;