import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button as TButton, Text as TText, Input, XStack, YStack, useTheme, Card} from 'tamagui';
import {X, Download} from '@tamagui/lucide-icons';
import RemoteErrorView from '@/features/download/RemoteErrorView';
import MetadataView from '@/shared/ui/MetadataView';
import DownloadProgress from '@/features/download/DownloadProgress';
import Screen from '@/shared/ui/Screen';
import {makeLoading} from '@/shared/utils/loading';
import {Adapters} from '@/lpa/adapters/registry';
import {useSelector} from 'react-redux';
import {selectDeviceState} from '@/store';
import {formatSize} from '@/shared/utils/size';
import {fontSize, radius} from '@/shared/theme/tokens';

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
          {/* Profile Metadata Card */}
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

          {/* Confirmation Code Card */}
          {(authenticateResult.isCcRequired || confirmationCode) && (
            <Card
              backgroundColor="$surfaceSpecial"
              borderRadius={radius.lg}
              padding={20}
              borderWidth={0}>
              <YStack gap={12}>
                <TText color="$textDefault" fontSize={fontSize.lg} fontWeight={'600' as any}>
                  {t('main:profile_conf_code')}
                </TText>
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

          {/* Storage Info Card */}
          <Card
            backgroundColor="$surfaceSpecial"
            borderRadius={radius.lg}
            padding={20}
            borderWidth={0}>
            <YStack gap={16}>
              <TText color="$textDefault" fontSize={fontSize.lg} fontWeight={'600' as any}>
                Storage Information
              </TText>
              <XStack justifyContent="space-between" alignItems="center">
                <TText color="$color6" fontSize={fontSize.md} fontWeight={'500' as any}>
                  {t('main:profile_available_space')}
                </TText>
                <TText color="$textDefault" fontSize={fontSize.md} fontWeight={'500' as any}>
                  {formatSize(freeSpace)}
                </TText>
              </XStack>
            </YStack>
          </Card>

          {/* Action Buttons */}
          <YStack gap={12} marginTop={8}>
            <XStack gap={12}>
              <TButton
                flex={1}
                height={52}
                borderRadius={radius.lg}
                backgroundColor="$color6"
                onPress={() => {
                  makeLoading(setLoading, async () => {
                    await adapter.cancelSession(authenticateResult._internal);
                    goBack();
                  });
                }}>
                <XStack alignItems="center" gap={10}>
                  <X size={18} color="$btnForeground" />
                  <TText color="$btnForeground" fontSize={fontSize.lg} fontWeight={'500' as any}>
                    {t('main:profile_ui_cancel')}
                  </TText>
                </XStack>
              </TButton>
              <TButton
                flex={2}
                height={52}
                borderRadius={radius.lg}
                backgroundColor="$btnBackground"
                onPress={() => {
                  makeLoading(setLoading, async () => {
                    const downloadResult = await adapter.downloadProfile(
                      authenticateResult._internal,
                      confirmationCode,
                      setProgress,
                    );
                    await adapter.processNotifications(authenticateResult.profile.iccid);
                    confirmDownload({
                      downloadResult,
                    });
                  });
                }}>
                <XStack alignItems="center" gap={12}>
                  <Download size={20} color="$btnForeground" />
                  <TText color="$btnForeground" fontSize={fontSize.lg} fontWeight={'600' as any}>
                    {t('main:profile_ui_download')}
                  </TText>
                </XStack>
              </TButton>
            </XStack>
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
