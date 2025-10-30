import React, {useState} from 'react';
import {Alert, StyleSheet,} from 'react-native';
import {useTranslation} from 'react-i18next';
import { View } from 'react-native';
import { Button as TButton, Text as TText, Input, XStack, YStack, useTheme } from 'tamagui';
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faCancel, faDownload} from "@fortawesome/free-solid-svg-icons";
import BlockingLoader from "@/components/common/BlockingLoader";
import RemoteErrorView from "@/screens/Download/RemoteErrorView";
import MetadataView from "@/components/common/MetadataView";
import Title from "@/components/common/Title";
import {makeLoading} from "@/components/utils/loading";
import {Adapters} from "@/native/adapters/registry";
import sizeFile, {ProfileSizes} from "@/data/sizes";
import {useSelector} from "react-redux";
import {selectDeviceState} from "@/redux/stateStore";
import {formatSize} from "@/utils/size";
import PageContainer from "@/components/common/PageContainer";
import SafeScreen from "@/theme/SafeScreen";


export function ScannerAuthentication(
  {
    authenticateResult,
    deviceId,
    goBack,
    confirmDownload,
    initialConfirmationCode
  }: any
) {
  const theme = useTheme();
  const { t } = useTranslation(['main']);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({} as any);
  const [confirmationCode, setConfirmationCode] = useState(initialConfirmationCode);
  const DeviceState = useSelector(selectDeviceState(deviceId));

  const adapter = Adapters[deviceId];
  const { eid, euiccInfo2 } = DeviceState;

  const profileTag = `${authenticateResult?.profile?.profileOwnerMccMnc}|${authenticateResult?.profile?.serviceProviderName}`;
  // @ts-ignore
  const sizeDelta = (sizeFile as ProfileSizes).offset[eid.substring(0, 8)] ?? 0;
  // @ts-ignore
  const sizeValue = (sizeFile as ProfileSizes).sizes[profileTag] ?? null;
  const sizeData = sizeValue ? sizeValue.map((d: number) => d + sizeDelta) : null;
  const maxSizeData = sizeData ? sizeData[2]: 10000;
  const freeSpace = Math.round((euiccInfo2?.extCardResource?.freeNonVolatileMemory || 0));


  return (
    <SafeScreen>
      <Title>{t('main:profile_title_confirm_profile')}</Title>
      <PageContainer keyboardAvoiding={false} scrollViewProps={{ nestedScrollEnabled: true }}>
      {
        loading && (
          <BlockingLoader
            message={
              ((progress?.progress > 0) ? (
                t('main:progress_' + progress.message, progress)
              ) : (
                t('main:profile_loading_download_profile')
              )) as string
            }
          />
        )
      }
      {
        (authenticateResult?.success) ? (
          <YStack gap={10}>
            <MetadataView metadata={authenticateResult.profile} />
            <YStack alignItems="flex-start" gap={10} marginTop={20}>
              {
              (authenticateResult.isCcRequired || confirmationCode) && (
                <XStack style={styles.tableRow} flex={1} gap={12} alignItems="center">
                  <TText color="$textDefault" style={styles.tableHeader}>
                    {t('main:profile_conf_code')}:
                  </TText>
                  <View style={styles.tableColumn}>
                    <Input
                      placeholder="Confirmation Code"
                      value={confirmationCode}
                      onChangeText={c => setConfirmationCode(c)}
                      borderWidth={1}
                      borderBottomWidth={1}
                      borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
                      backgroundColor="transparent"
                      color={theme.textDefault?.val}
                      placeholderTextColor={theme.color10?.val}
                      fontSize={17}
                      padding={0}
                      paddingBottom={8}
                    />
                  </View>
                </XStack>
              )
            }
            {
              sizeData && (
                <>
                  <XStack style={styles.tableRow} flex={1} gap={12} alignItems="center">
                    <TText color="$textDefault" style={styles.tableHeader}>
                      {t('main:profile_size')}:
                    </TText>
                    <View style={styles.tableColumn}>
                      <TText color="$textDefault" flex={1} fontSize={14}>
                        {formatSize(sizeData[1])} ({formatSize(sizeData[0])} ~ {formatSize(sizeData[2])})
                      </TText>
                    </View>
                  </XStack>
                  <XStack style={styles.tableRow} flex={1} gap={12} alignItems="center">
                    <TText color="$textDefault" style={styles.tableHeader}>
                      {t('main:profile_available_space')}:
                    </TText>
                    <View style={styles.tableColumn}>
                      <TText color="$textDefault" flex={1} fontSize={14} style={freeSpace <= maxSizeData ? { color: theme.backgroundDangerHeavy?.val || '#dc2626' } : undefined}>
                        {formatSize(freeSpace)}
                      </TText>
                    </View>
                  </XStack>
                </>
              )
            }
          </YStack>
          <YStack flex={1}>
            <XStack flex={1} gap={10}>
              <TButton
                flex={1}
                borderRadius={100}
                marginVertical={12}
                backgroundColor={theme.backgroundDangerHeavy?.val || '#dc2626'}
                onPress={() => {
                  makeLoading(
                    setLoading,
                    async () => {
                      await adapter.cancelSession(authenticateResult._internal);
                      goBack();
                    }
                  )
                }}
              >
                <XStack alignItems="center" gap={10}>
                  <FontAwesomeIcon
                    icon={faCancel}
                    style={{ color: theme.background?.val || '#fff' }}
                  />
                  <TText color={theme.background?.val || '#fff'} fontSize={16}>
                    {t('main:profile_ui_cancel')}
                  </TText>
                </XStack>
              </TButton>
              <TButton
                flex={3}
                borderRadius={100}
                marginVertical={12}
                backgroundColor={theme.accentColor?.val || theme.color?.val || '#6c5ce7'}
                onPress={() => {
                  if (freeSpace <= maxSizeData) {
                    Alert.alert(
                      t('main:profile_title_confirm_profile'),
                      t('main:profile_available_space_alert', { space: formatSize(freeSpace) }), [
                        {
                          text: t('main:profile_delete_tag_cancel'),
                          onPress: () => {},
                          style: 'cancel',
                        },
                        {
                          text: t('main:profile_delete_tag_ok'),
                          style: 'destructive',
                          onPress: () => {
                            makeLoading(
                              setLoading,
                              async () => {
                                const downloadResult = await adapter.downloadProfile(authenticateResult._internal, confirmationCode, setProgress);
                                await adapter.processNotifications(authenticateResult.profile.iccid);
                                // InfiLPA.refreshProfileList(device);
                                confirmDownload({
                                  downloadResult
                                });
                              }
                            )
                          }
                        },
                      ]);
                  } else {
                    makeLoading(
                      setLoading,
                      async () => {
                        const downloadResult = await adapter.downloadProfile(authenticateResult._internal, confirmationCode, setProgress);
                        await adapter.processNotifications(authenticateResult.profile.iccid);
                        // InfiLPA.refreshProfileList(device);
                        confirmDownload({
                          downloadResult
                        });
                      }
                    )
                  }
                }}
              >
                <XStack alignItems="center" gap={10}>
                  <FontAwesomeIcon
                    icon={faDownload}
                    style={{ color: theme.background?.val || '#fff' }}
                  />
                  <TText color={theme.background?.val || '#fff'} fontSize={16}>
                    {t('main:profile_ui_download')}
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
          <RemoteErrorView remoteError={authenticateResult} />
          <YStack flex={1}>
            <XStack flex={1} gap={10}>
              <TButton
                flex={1}
                marginVertical={12}
                borderRadius={100}
                backgroundColor={theme.color10?.val || '#888'}
                onPress={() => {
                  goBack();
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
      </PageContainer>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  tableHeader:{ width: 100, flexGrow: 0, flexShrink: 0, fontSize: 17 },
  tableColumn:{ flexGrow: 1, flexShrink: 0, fontSize: 17 },
  tableRow:{ flexDirection: "row", flex: 1, gap: 10 },
})
