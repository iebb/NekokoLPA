import ProfileMenu from "@/screens/Main/MainUI/ProfileMenu";
import ProfileSelector from "@/screens/Main/MainUI/ProfileList/ProfileSelector";
import {LoaderScreen, View} from "react-native-ui-lib";
import React from "react";
import {useSelector} from "react-redux";
import {useTheme} from "@/theme";
import {selectDeviceState} from "@/redux/stateStore";

export function EUICCPage({ deviceId } : { deviceId: string }) {
  const { colors } = useTheme();
  if (!deviceId) return null;
  const DeviceState = useSelector(selectDeviceState(deviceId));

  if (!DeviceState) {
    return (
      <LoaderScreen
        color={colors.blue500}
        size="large"
        loaderColor={colors.std200}
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