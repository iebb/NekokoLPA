import { View } from 'react-native';
import { Text as TText, YStack } from 'tamagui';
import React from "react";
import {RemoteError} from "@/native/types";

export default function RemoteErrorView({ remoteError }: { remoteError?: RemoteError }) {

  if (!remoteError) return null;

  return (
    <YStack flex={1} gap={5}>
      <TText color="$textDefault" textAlign="center" fontSize={14}>
        Status: {remoteError.status}
      </TText>
      <TText color="$textDefault" textAlign="center" fontSize={14}>
        {remoteError.message}
      </TText>
      <TText color="$textDefault" textAlign="center" fontSize={12}>
        Reason: {remoteError.reasonCode}
      </TText>
      <TText color="$textDefault" textAlign="center" fontSize={12}>
        Subject: {remoteError.subjectCode}
      </TText>
    </YStack>
  )
}