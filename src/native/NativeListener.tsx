import {Platform} from "react-native";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {setupInternalDevices} from "@/native/Hybrid";
import {setInternalDevices} from "@/redux/stateStore";
import {Adapter} from "@/native/adapters/adapter";


export function NativeListener({ children }: { children?: React.ReactNode }) {
  const dispatch = useDispatch();

  // useEffect(() => {
  //   const listener = (props: any) => {
  //     for(const key of Object.keys(props)) {
  //       const value = JSON.parse(props[key]);
  //       console.log("Received", key, value);
  //       console.log("Received", key, props[key]);
  //       dispatch(setGlobalState({[key]: value}))
  //     }
  //   };
  //
  //   if (Platform.OS === 'android') {
  //     // replace `LiveDataExample` with the name of your native module
  //     const eventEmitter = new NativeEventEmitter(); // NativeModules.LPABridge
  //     // replace the `onDataUpdate` with your event name
  //     const eventListener = eventEmitter.addListener(
  //       'onDataUpdate',
  //       listener
  //     );
  //     return () => {
  //       eventListener.remove();
  //     };
  //   }
  //
  // }, []);

  useEffect(() => {
    setupInternalDevices().then(internalList => {
      for(const d of internalList) {
        new Adapter(d, dispatch).initialize();
      }
      console.log(internalList.map(d => d.deviceId));
      dispatch(setInternalDevices(internalList.map(d => d.deviceId)));
    });
  }, []);

  return (
    <>
      {children}
    </>
  );
}
