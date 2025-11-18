import React from 'react';
import {useTranslation} from 'react-i18next';
import { View } from 'react-native';
import { Button as TButton, Text as TText, XStack, YStack, useTheme, Card } from 'tamagui';
import {ArrowLeft, X, Check, CheckCircle, AlertCircle} from '@tamagui/lucide-icons';
import RemoteErrorView from "@/screens/Download/RemoteErrorView";
import MetadataView from "@/components/common/MetadataView";
import Screen from "@/components/common/Screen";
import {makeLoading} from "@/components/utils/loading";
import {Adapters} from "@/native/adapters/registry";
import {useLoading} from "@/components/common/LoadingProvider";


export function ScannerResult(
  {
    authenticateResult,
    downloadResult,
    deviceId,
    goBack,
  }: any
) {
  const { t } = useTranslation(['main']);
  const theme = useTheme();
  const { setLoading } = useLoading();
  const adapter = Adapters[deviceId];

  return (
    <Screen title={t('main:profile_title_download_profile')} keyboardAvoiding={false} scrollViewProps={{ nestedScrollEnabled: true }}>
      {
        (downloadResult?.success) ?
          (
            <YStack gap={24}>
              {/* Success State */}
              <Card backgroundColor="$surfaceSpecial" borderRadius={16} padding={32} borderWidth={0}>
                <YStack gap={20} alignItems="center">
                  <View style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    backgroundColor: theme.backgroundSuccess?.val || '#dcfce7',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <CheckCircle size={56} color={theme.backgroundSuccessHeavy?.val || '#22c55e'} />
                  </View>
                  <YStack gap={8} alignItems="center">
                    <TText textAlign="center" fontSize={22} color="$textDefault" fontWeight={"600" as any}>
                      {t('main:profile_download_success')}
                    </TText>
                    <TText textAlign="center" fontSize={14} color="$color6">
                      Profile has been successfully downloaded to your device
                    </TText>
                  </YStack>
                </YStack>
              </Card>

              {/* Profile Metadata */}
              <Card backgroundColor="$surfaceSpecial" borderRadius={16} padding={20} borderWidth={0}>
                <YStack gap={16}>
                  <TText color="$textDefault" fontSize={18} fontWeight={"600" as any} marginBottom={4}>
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
                    borderRadius={16}
                    backgroundColor="$color6"
                    onPress={() => {
                      goBack();
                    }}
                  >
                    <XStack alignItems="center" gap={10}>
                      <ArrowLeft size={18} color="$btnForeground" />
                      <TText color="$btnForeground" fontSize={16} fontWeight={"500" as any}>
                        {t('main:profile_ui_back')}
                      </TText>
                    </XStack>
                  </TButton>
                  <TButton
                    flex={1}
                    height={52}
                    borderRadius={16}
                    backgroundColor={theme.backgroundSuccessHeavy?.val || '#22c55e'}
                    onPress={() => {
                      makeLoading(
                        setLoading,
                        async () => {
                          await adapter.enableProfileByIccId(authenticateResult.profile.iccid);
                          goBack();
                        }
                      )
                    }}
                  >
                    <XStack alignItems="center" gap={12}>
                      <Check size={20} color="#ffffff" />
                      <TText color="#ffffff" fontSize={17} fontWeight={"600" as any}>
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
              <Card backgroundColor="$surfaceSpecial" borderRadius={16} padding={32} borderWidth={0}>
                <YStack gap={20} alignItems="center">
                  <View style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    backgroundColor: theme.backgroundDangerLight?.val || '#fee2e2',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <AlertCircle size={56} color={theme.backgroundDangerHeavy?.val || '#dc2626'} />
                  </View>
                  <YStack gap={8} alignItems="center">
                    <TText textAlign="center" fontSize={22} color="$textDefault" fontWeight={"600" as any}>
                      {t('main:profile_download_failure')}
                    </TText>
                    <TText textAlign="center" fontSize={14} color="$color6">
                      Unable to download the profile. Please try again.
                    </TText>
                  </YStack>
                </YStack>
              </Card>

              {/* Error Details */}
              <Card backgroundColor="$surfaceSpecial" borderRadius={16} padding={20} borderWidth={0}>
                <RemoteErrorView remoteError={downloadResult} />
              </Card>

              {/* Back Button */}
              <TButton
                height={52}
                borderRadius={16}
                backgroundColor="$backgroundDangerHeavy"
                onPress={() => {
                  makeLoading(setLoading,
                    async () => {
                      await adapter.getProfiles();
                      goBack();
                    });
                }}
              >
                <XStack alignItems="center" gap={10}>
                  <X size={18} color="#ffffff" />
                  <TText color="#ffffff" fontSize={16} fontWeight={"500" as any}>
                    {t('main:profile_ui_back')}
                  </TText>
                </XStack>
              </TButton>
            </YStack>
          )
      }
    </Screen>
  );
}
