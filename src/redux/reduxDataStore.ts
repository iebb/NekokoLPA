import {configureStore} from '@reduxjs/toolkit';
import {appConfigStore} from "@/redux/configStore";
import {DeviceStateDataStore, globalDataStore} from "@/redux/stateStore";


export type RootState = ReturnType<typeof store.getState>;


export const store = configureStore({
    reducer: {
        LPA: globalDataStore.reducer,
        DeviceState: DeviceStateDataStore.reducer,
        AppConfig: appConfigStore.reducer,
    },
});

export const selectState = (state: RootState) => state.LPA;