import {Colors, LoaderScreen, Text, View} from "react-native-ui-lib";
import React from "react";
import {useTheme} from "../../theme_legacy";
import {RemoteError} from "@/native/types";

export default function RemoteErrorView({ remoteError }: { remoteError?: RemoteError }) {
  const { colors} = useTheme();

  if (!remoteError) return null;

  return (
    <View flex style={{ gap: 5 }}>
      <Text center text70 color={colors.std200}>
        Status: {remoteError.status}
      </Text>
      <Text center text70 color={colors.std200}>
        {remoteError.message}
      </Text>
      <Text center text80 color={colors.std200}>
        Reason: {remoteError.reasonCode}
      </Text>
      <Text center text80 color={colors.std200}>
        Subject: {remoteError.subjectCode}
      </Text>
    </View>
  )
}