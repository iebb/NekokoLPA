import {Action, configureStore, createSlice, PayloadAction, ThunkAction} from '@reduxjs/toolkit';
import {AuthenticateResult, DownloadResult, EuiccInfo2, ProfileMetadataMap, Profiles} from "@/native/types";
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {MMKV} from "react-native-mmkv";
import {appConfigStore} from "@/redux/configStore";
import {DeviceStateDataStore, globalDataStore} from "@/redux/stateStore";


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


export const store = configureStore({
    reducer: {
        LPA: globalDataStore.reducer,
        DeviceState: DeviceStateDataStore.reducer,
        AppConfig: appConfigStore.reducer,
    },
});

export const selectState = (state: RootState) => state.LPA;