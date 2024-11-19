import {Colors, Toast} from "react-native-ui-lib";
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {selectState} from "@/redux/reduxDataStore";

const errorDisplayTime = 5000;

export default function ErrorToast({ eUICC = "SIM1" }) {
  const [show, setShow] = useState<boolean>(false);
  const {error} = useSelector(selectState);

  useEffect(() => {
    if (error) {
      setShow(+new Date() - error.timestamp < errorDisplayTime);
    }
  }, [error]);

  if (!error) return null;

  return (
    <Toast
      // renderAttachment={this.renderBelowToast}
      visible={show}
      position={'bottom'}
      backgroundColor={Colors.$backgroundDangerHeavy}
      message={`${error.header}

${error.body}`}
      onDismiss={() => setShow(false)}
      autoDismiss={errorDisplayTime}
      showDismiss={true}
      // // action={{iconSource: Assets.icons.x, onPress: () => console.log('dismiss')}}
      // showLoader={showLoader}
    />
  )
}