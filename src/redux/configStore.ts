import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {MMKV} from "react-native-mmkv";
import {RootState} from "@/redux/reduxDataStore";


export const storage = new MMKV();

function getAppConfig(): AppConfig {
    return {
        nicknames: JSON.parse(storage.getString('nicknames') || '{}'),
    }
}

interface AppConfig {
    nicknames: { [key: string]: string };
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
    },
});


export const selectAppConfig = (state: RootState) => state.AppConfig;

export const { setValue, setNickname } = appConfigStore.actions;