import {NativeEventEmitter} from "react-native";
import {useEffect, useState} from "react";
import {setGlobalState, setState} from "@/redux/reduxDataStore";
import {useDispatch} from "react-redux";


export function NativeListener({ children }: { children?: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const listener = (props: any) => {
      for(const key of Object.keys(props)) {
        const value = JSON.parse(props[key]);
        dispatch(setGlobalState({[key]: value}))
      }
    };

    // replace `LiveDataExample` with the name of your native module
    const eventEmitter = new NativeEventEmitter(
      // NativeModules.LPABridge
      // only required on iOS but it's android-only
    );
    // replace the `onDataUpdate` with your event name
    const eventListener = eventEmitter.addListener(
      'onDataUpdate',
      listener
    );
    return () => {
      eventListener.remove();
    };
  }, []);
  return (
    <>
      {children}
    </>
  );
}
