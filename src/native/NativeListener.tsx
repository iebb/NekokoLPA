import {NativeEventEmitter, NativeModules, Platform} from "react-native";
import {useEffect, useState} from "react";
import {setGlobalState, setState} from "@/redux/reduxDataStore";
import {useDispatch} from "react-redux";


export function NativeListener({ children }: { children?: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const listener = (props: any) => {
      for(const key of Object.keys(props)) {
        const value = JSON.parse(props[key]);
        console.log("Received", key, value);
        console.log("Received", key, props[key]);
        dispatch(setGlobalState({[key]: value}))
      }
    };

    if (Platform.OS === 'android') {
      // replace `LiveDataExample` with the name of your native module
      const eventEmitter = new NativeEventEmitter(); // NativeModules.LPABridge
      // replace the `onDataUpdate` with your event name
      const eventListener = eventEmitter.addListener(
        'onDataUpdate',
        listener
      );
      return () => {
        eventListener.remove();
      };
    }

  }, []);


  return (
    <>
      {children}
    </>
  );
}
