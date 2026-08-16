import {Text as TText, YStack, XStack} from 'tamagui';
import React from 'react';
import {RemoteError} from '@/lpa/types/profile';
import {AlertCircle, Code, Info} from '@tamagui/lucide-icons';
import {fontSize} from '@/shared/theme/tokens';

export default function RemoteErrorView({remoteError}: {remoteError?: RemoteError}) {
  if (!remoteError) return null;

  return (
    <YStack gap={16}>
      {remoteError.message && (
        <YStack gap={8}>
          <XStack gap={8} alignItems="center">
            <AlertCircle size={18} color="$backgroundDangerHeavy" />
            <TText color="$textDefault" fontSize={fontSize.lg} fontWeight={'600' as any}>
              Error Message
            </TText>
          </XStack>
          <TText color="$textDefault" fontSize={fontSize.md} paddingLeft={26}>
            {remoteError.message}
          </TText>
        </YStack>
      )}

      <YStack gap={12}>
        {remoteError.status && (
          <XStack
            justifyContent="space-between"
            alignItems="center"
            paddingVertical={8}
            borderBottomWidth={1}
            borderBottomColor="$outlineNeutral">
            <XStack gap={8} alignItems="center">
              <Info size={16} color="$color6" />
              <TText color="$color6" fontSize={fontSize.sm} fontWeight={'500' as any}>
                Status
              </TText>
            </XStack>
            <TText color="$textDefault" fontSize={fontSize.md}>
              {remoteError.status}
            </TText>
          </XStack>
        )}

        {remoteError.reasonCode && (
          <XStack
            justifyContent="space-between"
            alignItems="center"
            paddingVertical={8}
            borderBottomWidth={1}
            borderBottomColor="$outlineNeutral">
            <XStack gap={8} alignItems="center">
              <Code size={16} color="$color6" />
              <TText color="$color6" fontSize={fontSize.sm} fontWeight={'500' as any}>
                Reason Code
              </TText>
            </XStack>
            <TText color="$textDefault" fontSize={fontSize.md}>
              {remoteError.reasonCode}
            </TText>
          </XStack>
        )}

        {remoteError.subjectCode && (
          <XStack justifyContent="space-between" alignItems="center" paddingVertical={8}>
            <XStack gap={8} alignItems="center">
              <Code size={16} color="$color6" />
              <TText color="$color6" fontSize={fontSize.sm} fontWeight={'500' as any}>
                Subject Code
              </TText>
            </XStack>
            <TText color="$textDefault" fontSize={fontSize.md}>
              {remoteError.subjectCode}
            </TText>
          </XStack>
        )}
      </YStack>
    </YStack>
  );
}
