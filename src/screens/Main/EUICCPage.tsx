import ProfileCardHeader from "@/screens/Main/ProfileCardHeader";
import ProfileSelector from "@/screens/Main/ProfileSelector";
import {Colors, LoaderScreen, View} from "react-native-ui-lib";
import React from "react";
import {useSelector} from "react-redux";
import {selectDeviceState} from "@/redux/stateStore";

export function EUICCPage({ deviceId } : { deviceId: string }) {
  if (!deviceId) return null;
  const DeviceState = useSelector(selectDeviceState(deviceId));

  if (!DeviceState) {
    return (
      <LoaderScreen
        color={Colors.$outlineGeneral}
        size="large"
        loaderColor={Colors.$outlineGeneral}
      />
    )
  }

  return (
    <View flex flexG style={{ gap: 10 }}>
      <ProfileCardHeader deviceId={deviceId} />
      <ProfileSelector deviceId={deviceId} />
    </View>
  )
}