import {Platform} from "react-native";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {setupInternalDevices} from "@/native/Hybrid";
import {setInternalDevices} from "@/redux/stateStore";
import {Adapter} from "@/native/adapters/adapter";
import {Adapters} from "@/native/adapters/registry";


export function NativeListener({ children }: { children?: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    setupInternalDevices().then(internalList => {
      for(const f of Object.keys(Adapters)) Adapters[f].obsolete = true;
      for(const d of internalList) (new Adapter(d, dispatch)).initialize();
      for(const f of Object.keys(Adapters)) if (Adapters[f].obsolete) {
        Adapters[f].device.disconnect();
        delete Adapters[f];
      }
      dispatch(setInternalDevices(internalList.map(d => d.deviceId)));
    });
  }, []);

  return (
    <>
      {children}
    </>
  );
}
