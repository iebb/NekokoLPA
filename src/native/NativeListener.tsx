import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {setupDevices} from "@/native/Hybrid";
import {useTranslation} from 'react-i18next';


export function NativeListener({ children }: { children?: React.ReactNode }) {
  const dispatch = useDispatch();

  const { t } = useTranslation(['main']);
  useEffect(() => {
    setupDevices(dispatch).then(r => r);
  }, []);

  return (
    <>
      {children}
    </>
  );
}
