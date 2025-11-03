import { View } from 'react-native';
import { Text as TText, YStack, XStack } from 'tamagui';
import React from "react";
import {RemoteError} from "@/native/types";
import {AlertCircle, Code, Info} from '@tamagui/lucide-icons';

export default function RemoteErrorView({ remoteError }: { remoteError?: RemoteError }) {

  if (!remoteError) return null;

  return (
    <YStack gap={16}>
      {remoteError.message && (
        <YStack gap={8}>
          <XStack gap={8} alignItems="center">
            <AlertCircle size={18} color="$backgroundDangerHeavy" />
            <TText color="$textDefault" fontSize={16} fontWeight={"600" as any}>
              Error Message
            </TText>
          </XStack>
          <TText color="$textDefault" fontSize={14} paddingLeft={26}>
            {remoteError.message}
          </TText>
        </YStack>
      )}
      
      <YStack gap={12}>
        {remoteError.status && (
          <XStack justifyContent="space-between" alignItems="center" paddingVertical={8} borderBottomWidth={1} borderBottomColor="$outlineNeutral">
            <XStack gap={8} alignItems="center">
              <Info size={16} color="$color10" />
              <TText color="$color11" fontSize={13} fontWeight={"500" as any}>
                Status
              </TText>
            </XStack>
            <TText color="$textDefault" fontSize={14}>
              {remoteError.status}
            </TText>
          </XStack>
        )}
        
        {remoteError.reasonCode && (
          <XStack justifyContent="space-between" alignItems="center" paddingVertical={8} borderBottomWidth={1} borderBottomColor="$outlineNeutral">
            <XStack gap={8} alignItems="center">
              <Code size={16} color="$color10" />
              <TText color="$color11" fontSize={13} fontWeight={"500" as any}>
                Reason Code
              </TText>
            </XStack>
            <TText color="$textDefault" fontSize={14} fontFamily="$mono">
              {remoteError.reasonCode}
            </TText>
          </XStack>
        )}
        
        {remoteError.subjectCode && (
          <XStack justifyContent="space-between" alignItems="center" paddingVertical={8}>
            <XStack gap={8} alignItems="center">
              <Code size={16} color="$color10" />
              <TText color="$color11" fontSize={13} fontWeight={"500" as any}>
                Subject Code
              </TText>
            </XStack>
            <TText color="$textDefault" fontSize={14} fontFamily="$mono">
              {remoteError.subjectCode}
            </TText>
          </XStack>
        )}
      </YStack>
    </YStack>
  )
}