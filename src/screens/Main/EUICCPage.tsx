import ProfileCardHeader from "@/screens/Main/ProfileCardHeader";
import ProfileSelector from "@/screens/Main/ProfileSelector";
import UnifiedLoader from "@/components/common/UnifiedLoader";
import { YStack } from 'tamagui';
import {useTheme} from 'tamagui';
import React from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/reduxDataStore";

export function EUICCPage({ deviceId } : { deviceId: string }) {
  const theme = useTheme();
  if (!deviceId) return null;
  const DeviceState = useSelector((state: RootState) => state.DeviceState[deviceId]);

  if (!DeviceState) {
    return (
      <UnifiedLoader overlay variant="circular" />
    )
  }

  return (
    <YStack flex={1} gap={10}>
      <ProfileCardHeader deviceId={deviceId} />
      <ProfileSelector deviceId={deviceId} />
    </YStack>
  )
}