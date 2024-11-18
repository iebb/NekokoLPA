import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {setupDevices} from "@/native/Hybrid";


export function NativeListener({ children }: { children?: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    setupDevices(dispatch).then(r => r);
  }, []);

  return (
    <>
      {children}
    </>
  );
}
