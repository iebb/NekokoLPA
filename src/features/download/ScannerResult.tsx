import React from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {Button as TButton, Text as TText, XStack, YStack, useTheme, Card} from 'tamagui';
import {ArrowLeft, X, Check, CheckCircle, AlertCircle} from '@tamagui/lucide-icons';
import RemoteErrorView from '@/features/download/RemoteErrorView';
import MetadataView from '@/shared/ui/MetadataView';
import Screen from '@/shared/ui/Screen';
import {makeLoading} from '@/shared/utils/loading';
import {Adapters} from '@/lpa/adapters/registry';
import {useLoading} from '@/app/providers/LoadingProvider';
import {fontSize, radius} from '@/shared/theme/tokens';

export function ScannerResult({authenticateResult, downloadResult, deviceId, goBack}: any) {
  const {t} = useTranslation(['main']);
  const theme = useTheme();
  const {setLoading} = useLoading();
  const adapter = Adapters[deviceId];

  return (
    <Screen
      title={t('main:profile_title_download_profile')}
      keyboardAvoiding={false}
      scrollViewProps={{nestedScrollEnabled: true}}>
      {downloadResult?.success ? (
        <YStack gap={24}>
          {/* Success State */}
          <Card
            backgroundColor="$surfaceSpecial"
            borderRadius={radius.lg}
            padding={32}
            borderWidth={0}>
            <YStack gap={20} alignItems="center">
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: radius.pill,
                  backgroundColor: theme.backgroundSuccess?.val,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <CheckCircle size={56} color={theme.backgroundSuccessHeavy?.val} />
              </View>
              <YStack gap={8} alignItems="center">
                <TText
                  textAlign="center"
                  fontSize={fontSize.xxl}
                  color="$textDefault"
                  fontWeight={'600' as any}>
                  {t('main:profile_download_success')}
                </TText>
                <TText textAlign="center" fontSize={fontSize.md} color="$color6">
                  Profile has been successfully downloaded to your device
                </TText>
              </YStack>
            </YStack>
          </Card>

          {/* Profile Metadata */}
          <Card
            backgroundColor="$surfaceSpecial"
            borderRadius={radius.lg}
            padding={20}
            borderWidth={0}>
            <YStack gap={16}>
              <TText
                color="$textDefault"
                fontSize={fontSize.xl}
                fontWeight={'600' as any}
                marginBottom={4}>
                Profile Information
              </TText>
              <MetadataView metadata={authenticateResult.profile} />
            </YStack>
          </Card>

          {/* Action Buttons */}
          <YStack gap={12}>
            <XStack gap={12}>
              <TButton
                flex={1}
                height={52}
                borderRadius={radius.lg}
                backgroundColor="$color6"
                onPress={() => {
                  goBack();
                }}>
                <XStack alignItems="center" gap={10}>
                  <ArrowLeft size={18} color="$btnForeground" />
                  <TText color="$btnForeground" fontSize={fontSize.lg} fontWeight={'500' as any}>
                    {t('main:profile_ui_back')}
                  </TText>
                </XStack>
              </TButton>
              <TButton
                flex={1}
                height={52}
                borderRadius={radius.lg}
                backgroundColor={theme.backgroundSuccessHeavy?.val}
                onPress={() => {
                  makeLoading(setLoading, async () => {
                    await adapter.enableProfileByIccId(authenticateResult.profile.iccid);
                    goBack();
                  });
                }}>
                <XStack alignItems="center" gap={12}>
                  <Check size={20} color="#ffffff" />
                  <TText color="#ffffff" fontSize={fontSize.lg} fontWeight={'600' as any}>
                    {t('main:profile_ui_enable')}
                  </TText>
                </XStack>
              </TButton>
            </XStack>
          </YStack>
        </YStack>
      ) : (
        <YStack gap={24}>
          {/* Failure State */}
          <Card
            backgroundColor="$surfaceSpecial"
            borderRadius={radius.lg}
            padding={32}
            borderWidth={0}>
            <YStack gap={20} alignItems="center">
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: radius.pill,
                  backgroundColor: theme.backgroundDangerLight?.val,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <AlertCircle size={56} color={theme.backgroundDangerHeavy?.val} />
              </View>
              <YStack gap={8} alignItems="center">
                <TText
                  textAlign="center"
                  fontSize={fontSize.xxl}
                  color="$textDefault"
                  fontWeight={'600' as any}>
                  {t('main:profile_download_failure')}
                </TText>
                <TText textAlign="center" fontSize={fontSize.md} color="$color6">
                  Unable to download the profile. Please try again.
                </TText>
              </YStack>
            </YStack>
          </Card>

          {/* Error Details */}
          <Card
            backgroundColor="$surfaceSpecial"
            borderRadius={radius.lg}
            padding={20}
            borderWidth={0}>
            <RemoteErrorView remoteError={downloadResult} />
          </Card>

          {/* Back Button */}
          <TButton
            height={52}
            borderRadius={radius.lg}
            backgroundColor="$backgroundDangerHeavy"
            onPress={() => {
              makeLoading(setLoading, async () => {
                await adapter.getProfiles();
                goBack();
              });
            }}>
            <XStack alignItems="center" gap={10}>
              <X size={18} color="#ffffff" />
              <TText color="#ffffff" fontSize={fontSize.lg} fontWeight={'500' as any}>
                {t('main:profile_ui_back')}
              </TText>
            </XStack>
          </TButton>
        </YStack>
      )}
    </Screen>
  );
}
