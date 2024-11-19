import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {MMKV} from "react-native-mmkv";
import {RootState} from "@/redux/reduxDataStore";


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

            console.log("setting", action, action.payload);
            for(const k of Object.keys(action.payload)) {
                // @ts-ignore
                state[k] = action.payload[k];
                // @ts-ignore
                storage.set(k, action.payload[k]);
                console.log("setting", k, action.payload[k]);
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


export const selectAppConfig = (state: RootState) => state.AppConfig;

export const { setValue, nextValue, setNickname } = appConfigStore.actions;