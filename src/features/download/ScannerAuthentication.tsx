import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button as TButton, Text as TText, Input, XStack, YStack, useTheme, Card} from 'tamagui';
import {X, Download} from '@tamagui/lucide-icons';
import BlockingLoader from '@/shared/ui/BlockingLoader';
import RemoteErrorView from '@/features/download/RemoteErrorView';
import MetadataView from '@/shared/ui/MetadataView';
import Screen from '@/shared/ui/Screen';
import {makeLoading} from '@/shared/utils/loading';
import {Adapters} from '@/lpa/adapters/registry';
import {useSelector} from 'react-redux';
import {selectDeviceState} from '@/store';
import {formatSize} from '@/shared/utils/size';

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
        <BlockingLoader
          message={
            (progress?.progress > 0
              ? t('main:progress_' + progress.message, progress)
              : t('main:profile_loading_download_profile')) as string
          }
        />
      )}
      {authenticateResult?.success ? (
        <YStack gap={20}>
          {/* Profile Metadata Card */}
          <Card backgroundColor="$surfaceSpecial" borderRadius={16} padding={20} borderWidth={0}>
            <YStack gap={16}>
              <TText color="$textDefault" fontSize={18} fontWeight={'600' as any} marginBottom={4}>
                Profile Information
              </TText>
              <MetadataView metadata={authenticateResult.profile} />
            </YStack>
          </Card>

          {/* Confirmation Code Card */}
          {(authenticateResult.isCcRequired || confirmationCode) && (
            <Card backgroundColor="$surfaceSpecial" borderRadius={16} padding={20} borderWidth={0}>
              <YStack gap={12}>
                <TText color="$textDefault" fontSize={16} fontWeight={'600' as any}>
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
                  fontSize={16}
                  borderRadius={12}
                />
              </YStack>
            </Card>
          )}

          {/* Storage Info Card */}
          <Card backgroundColor="$surfaceSpecial" borderRadius={16} padding={20} borderWidth={0}>
            <YStack gap={16}>
              <TText color="$textDefault" fontSize={16} fontWeight={'600' as any}>
                Storage Information
              </TText>
              <XStack justifyContent="space-between" alignItems="center">
                <TText color="$color6" fontSize={14} fontWeight={'500' as any}>
                  {t('main:profile_available_space')}
                </TText>
                <TText color="$textDefault" fontSize={14} fontWeight={'500' as any}>
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
                borderRadius={16}
                backgroundColor="$color6"
                onPress={() => {
                  makeLoading(setLoading, async () => {
                    await adapter.cancelSession(authenticateResult._internal);
                    goBack();
                  });
                }}>
                <XStack alignItems="center" gap={10}>
                  <X size={18} color="$btnForeground" />
                  <TText color="$btnForeground" fontSize={16} fontWeight={'500' as any}>
                    {t('main:profile_ui_cancel')}
                  </TText>
                </XStack>
              </TButton>
              <TButton
                flex={2}
                height={52}
                borderRadius={16}
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
                  <TText color="$btnForeground" fontSize={17} fontWeight={'600' as any}>
                    {t('main:profile_ui_download')}
                  </TText>
                </XStack>
              </TButton>
            </XStack>
          </YStack>
        </YStack>
      ) : (
        <YStack gap={24} flex={1}>
          <Card backgroundColor="$surfaceSpecial" borderRadius={16} padding={24} borderWidth={0}>
            <YStack gap={16} alignItems="center">
              <TText
                textAlign="center"
                fontSize={20}
                color="$textDefault"
                fontWeight={'600' as any}>
                {t('main:profile_download_failure')}
              </TText>
              <RemoteErrorView remoteError={authenticateResult} />
            </YStack>
          </Card>
          <TButton
            height={52}
            borderRadius={16}
            backgroundColor="$color6"
            onPress={() => {
              goBack();
            }}>
            <XStack alignItems="center" gap={10}>
              <X size={18} color="$btnForeground" />
              <TText color="$btnForeground" fontSize={16} fontWeight={'500' as any}>
                {t('main:profile_ui_back')}
              </TText>
            </XStack>
          </TButton>
        </YStack>
      )}
    </Screen>
  );
}
