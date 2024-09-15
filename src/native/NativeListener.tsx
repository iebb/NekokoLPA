import {NativeEventEmitter} from "react-native";
import {useEffect, useState} from "react";
import {setGlobalState, setState} from "@/redux/reduxDataStore";
import {useDispatch} from "react-redux";


export function NativeListener({ children }: { children?: React.ReactNode }) {
  const [data, setData] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const listener = (props: any) => {
      if (props.currentEuicc) {
        dispatch(setGlobalState({currentEuicc: props.currentEuicc}))
        for(const key of Object.keys(props)) {
          if (key !== "currentEuicc") {
            console.log("listener", props.currentEuicc, props);
            const value = JSON.parse(props[key]);
            dispatch(setState([{[key]: value}, props.currentEuicc]))
          }
        }
      } else {
        // global state
        console.log("Global", props);
        for(const key of Object.keys(props)) {
          const value = JSON.parse(props[key]);
          dispatch(setGlobalState({[key]: value}))
        }
      }
      // setData(JSON.parse(data));
    };

    // replace `LiveDataExample` with the name of your native module
    const eventEmitter = new NativeEventEmitter(
      // NativeModules.InfineonDataModel
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
