import React from 'react';
import {useTranslation} from 'react-i18next';
import { View } from 'react-native';
import { Button as TButton, Text as TText, XStack, YStack, useTheme } from 'tamagui';
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faArrowLeftLong, faCancel, faCheck, faCheckCircle} from "@fortawesome/free-solid-svg-icons";
import RemoteErrorView from "@/screens/Download/RemoteErrorView";
import MetadataView from "@/components/common/MetadataView";
import Title from "@/components/common/Title";
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
    <View>
      <Title>{t('main:profile_title_download_profile')}</Title>
      {
        (downloadResult?.success) ?
          (
            <YStack gap={10}>
              <View style={{ alignItems: 'center', marginVertical: 20 }}>
                <FontAwesomeIcon icon={faCheckCircle} size={80} color={theme.backgroundSuccessHeavy?.val || '#22c55e'} />
              </View>
              <TText textAlign="center" fontSize={18} color="$textDefault">
                {t('main:profile_download_success')}
              </TText>
              <MetadataView metadata={authenticateResult.profile} />
              <YStack flex={1}>
                <XStack gap={10} flex={1}>
                  <TButton
                    flex={1}
                    marginVertical={12}
                    backgroundColor={theme.color2?.val || theme.accentColor?.val || '#444'}
                    onPress={() => {
                      goBack();
                    }}
                  >
                    <XStack alignItems="center" gap={10}>
                      <FontAwesomeIcon
                        icon={faArrowLeftLong}
                        style={{ color: theme.background?.val || '#fff' }}
                      />
                      <TText color={theme.background?.val || '#fff'} fontSize={16}>
                        {t('main:profile_ui_back')}
                      </TText>
                    </XStack>
                  </TButton>
                  <TButton
                    flex={1}
                    marginVertical={12}
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
                    <XStack alignItems="center" gap={10}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        style={{ color: theme.background?.val || '#fff' }}
                      />
                      <TText color={theme.background?.val || '#fff'} fontSize={16}>
                        {t('main:profile_ui_enable')}
                      </TText>
                    </XStack>
                  </TButton>
                </XStack>
              </YStack>
            </YStack>
          ) : (
            <YStack gap={20} flex={1}>
              <TText textAlign="center" fontSize={18} color="$textDefault">
                {t('main:profile_download_failure')}
              </TText>
              <RemoteErrorView remoteError={downloadResult} />
              <YStack flex={1}>
                <XStack flex={1} gap={10}>
                  <TButton
                    flex={1}
                    marginVertical={12}
                    backgroundColor={theme.backgroundDangerHeavy?.val || '#dc2626'}
                    onPress={() => {
                      makeLoading(setLoading,
                        async () => {
                          await adapter.getProfiles();
                          goBack();
                        });
                    }}
                  >
                    <XStack alignItems="center" gap={10}>
                      <FontAwesomeIcon
                        icon={faCancel}
                        style={{ color: theme.background?.val || '#fff' }}
                      />
                      <TText color={theme.background?.val || '#fff'} fontSize={16}>
                        {t('main:profile_ui_back')}
                      </TText>
                    </XStack>
                  </TButton>
                </XStack>
              </YStack>
            </YStack>
          )
      }
    </View>
  );
}
