import React, {useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Button as TButton, Text as TText, Input, XStack, YStack, useTheme, Card} from 'tamagui';
import {X} from '@tamagui/lucide-icons';
import RemoteErrorView from '@/features/download/RemoteErrorView';
import MetadataView from '@/shared/ui/MetadataView';
import DownloadProgress from '@/features/download/DownloadProgress';
import Screen from '@/shared/ui/Screen';
import {makeLoading} from '@/shared/utils/loading';
import {Adapters} from '@/lpa/adapters/registry';
import {useSelector} from 'react-redux';
import {selectDeviceState} from '@/store';
import {formatSize} from '@/shared/utils/size';
import {fontFamily, fontSize, radius} from '@/shared/theme/tokens';
import SectionLabel from '@/shared/ui/SectionLabel';

export function ScannerAuthentication({
  authenticateResult,
  deviceId,
  goBack,
  confirmDownload,
  initialConfirmationCode,
}: any) {
  const theme = useTheme();
  const {t} = useTranslation(['main']);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({} as any);
  const [confirmationCode, setConfirmationCode] = useState(initialConfirmationCode);
  const DeviceState = useSelector(selectDeviceState(deviceId));

  const adapter = Adapters[deviceId];
  const {euiccInfo2} = DeviceState;

  const freeSpace = Math.round(euiccInfo2?.extCardResource?.freeNonVolatileMemory || 0);

  return (
    <Screen
      title={t('main:profile_title_confirm_profile')}
      keyboardAvoiding={false}
      scrollViewProps={{nestedScrollEnabled: true}}>
      {loading && (
        <DownloadProgress
          target={adapter?.device?.displayName ?? ''}
          profileName={
            authenticateResult?.profile?.serviceProviderName ??
            authenticateResult?.profile?.profileName
          }
          progress={progress}
        />
      )}
      {authenticateResult?.success ? (
        <YStack gap={20}>
          <YStack gap={8}>
            <YStack paddingLeft={4}>
              <SectionLabel>{t('main:profile_information')}</SectionLabel>
            </YStack>
            <YStack
              backgroundColor="$surfaceRow"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius={radius.lg}
              padding={14}>
              <MetadataView metadata={authenticateResult.profile} />
            </YStack>
          </YStack>

          {/* Confirmation Code Card */}
          {(authenticateResult.isCcRequired || confirmationCode) && (
            <Card
              backgroundColor="$surfaceRow"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius={radius.lg}
              padding={14}>
              <YStack gap={8}>
                <SectionLabel>{t('main:profile_conf_code')}</SectionLabel>
                <Input
                  placeholder="Enter confirmation code"
                  value={confirmationCode}
                  onChangeText={c => setConfirmationCode(c)}
                  borderWidth={1}
                  borderColor={theme.outlineNeutral?.val || theme.borderColor?.val}
                  backgroundColor="$background"
                  color={theme.textDefault?.val}
                  placeholderTextColor={theme.color6?.val}
                  fontSize={fontSize.lg}
                  borderRadius={radius.md}
                />
              </YStack>
            </Card>
          )}

          <YStack
            backgroundColor="$surfaceRow"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius={radius.lg}
            paddingVertical={13}
            paddingHorizontal={14}>
            <XStack justifyContent="space-between" alignItems="baseline" gap={12}>
              <TText color="$color6" fontSize={fontSize.md}>
                {t('main:profile_available_space')}
              </TText>
              <TText
                color="$textDefault"
                fontFamily={fontFamily.mono as any}
                fontSize={fontSize.xl}
                fontWeight={'600' as any}>
                {formatSize(freeSpace)}
              </TText>
            </XStack>
          </YStack>

          {/* One full-width primary action, with Cancel as plain text beneath.
              Two filled buttons side by side gave cancelling the same weight
              as the thing the user came here to do. */}
          <YStack gap={14} marginTop={4}>
            <TouchableOpacity
              onPress={() => {
                makeLoading(setLoading, async () => {
                  const downloadResult = await adapter.downloadProfile(
                    authenticateResult._internal,
                    confirmationCode,
                    setProgress,
                  );
                  await adapter.processNotifications(authenticateResult.profile.iccid);
                  confirmDownload({downloadResult});
                });
              }}
              style={{
                backgroundColor: theme.primaryColor?.val,
                borderRadius: radius.md,
                paddingVertical: 14,
                alignItems: 'center',
              }}>
              <TText
                color={theme.onFilled?.val}
                fontSize={fontSize.xl}
                fontWeight={'600' as any}>
                {t('main:profile_ui_download')}
              </TText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                makeLoading(setLoading, async () => {
                  await adapter.cancelSession(authenticateResult._internal);
                  goBack();
                });
              }}
              style={{alignSelf: 'center', paddingVertical: 4}}>
              <TText color="$color6" fontSize={fontSize.lg}>
                {t('main:profile_ui_cancel')}
              </TText>
            </TouchableOpacity>
          </YStack>
        </YStack>
      ) : (
        <YStack gap={24} flex={1}>
          <Card
            backgroundColor="$surfaceSpecial"
            borderRadius={radius.lg}
            padding={24}
            borderWidth={0}>
            <YStack gap={16} alignItems="center">
              <TText
                textAlign="center"
                fontSize={fontSize.xxl}
                color="$textDefault"
                fontWeight={'600' as any}>
                {t('main:profile_download_failure')}
              </TText>
              <RemoteErrorView remoteError={authenticateResult} />
            </YStack>
          </Card>
          <TButton
            height={52}
            borderRadius={radius.lg}
            backgroundColor="$color6"
            onPress={() => {
              goBack();
            }}>
            <XStack alignItems="center" gap={10}>
              <X size={18} color="$btnForeground" />
              <TText color="$btnForeground" fontSize={fontSize.lg} fontWeight={'500' as any}>
                {t('main:profile_ui_back')}
              </TText>
            </XStack>
          </TButton>
        </YStack>
      )}
    </Screen>
  );
}
