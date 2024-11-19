import ProfileMenu from "@/screens/Main/MainUI/ProfileMenu";
import ProfileSelector from "@/screens/Main/MainUI/ProfileSelector";
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
      <ProfileMenu deviceId={deviceId} />
      <ProfileSelector deviceId={deviceId} />
    </View>
  )
}