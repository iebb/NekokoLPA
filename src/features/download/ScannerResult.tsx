import React from 'react';
import {useTranslation} from 'react-i18next';
import {TouchableOpacity, View} from 'react-native';
import {Button as TButton, Text as TText, XStack, YStack, useTheme, Card} from 'tamagui';
import {AlertCircle, CheckCircle, X} from '@tamagui/lucide-icons';
import RemoteErrorView from '@/features/download/RemoteErrorView';
import MetadataView from '@/shared/ui/MetadataView';
import Screen from '@/shared/ui/Screen';
import {makeLoading} from '@/shared/utils/loading';
import {Adapters} from '@/lpa/adapters/registry';
import {useLoading} from '@/app/providers/LoadingProvider';
import {fontSize, iconSize, radius, tracking} from '@/shared/theme/tokens';
import SectionLabel from '@/shared/ui/SectionLabel';

export function ScannerResult({authenticateResult, downloadResult, deviceId, goBack}: any) {
  const {t} = useTranslation(['main']);
  const theme = useTheme();
  const {setLoading} = useLoading();
  const adapter = Adapters[deviceId];

  return (
    <Screen
      keyboardAvoiding={false}
      scrollViewProps={{nestedScrollEnabled: true}}>
      {downloadResult?.success ? (
        <YStack gap={24}>
          {/* The green disc was 96px of decoration around a 56px icon that
              already said "success". A line of text and a modest mark carry
              it, and the profile itself gets the space instead. */}
          <YStack gap={10}>
            <XStack alignItems="center" gap={10}>
              <CheckCircle size={iconSize.lg} color={theme.backgroundSuccessHeavy?.val} />
              <TText
                color="$textDefault"
                fontSize={fontSize.display}
                fontWeight={'700' as any}
                letterSpacing={tracking.title}
                flexShrink={1}>
                {t('main:profile_download_success')}
              </TText>
            </XStack>
            <TText color="$color6" fontSize={fontSize.md}>
              {t('main:profile_download_success_body')}
            </TText>
          </YStack>

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

          {/* Enabling is what the user came for; going back is the way out.
              Two filled buttons side by side made them look like a choice
              between equals, and the green pair competed with the success
              mark above. */}
          <YStack gap={14} marginTop={4}>
            <TouchableOpacity
              onPress={() => {
                makeLoading(setLoading, async () => {
                  await adapter.enableProfileByIccId(authenticateResult.profile.iccid);
                  goBack();
                });
              }}
              style={{
                backgroundColor: theme.primaryColor?.val,
                borderRadius: radius.md,
                paddingVertical: 14,
                alignItems: 'center',
              }}>
              <TText color={theme.onFilled?.val} fontSize={fontSize.xl} fontWeight={'600' as any}>
                {t('main:profile_ui_enable')}
              </TText>
            </TouchableOpacity>
            <TouchableOpacity onPress={goBack} style={{alignSelf: 'center', paddingVertical: 4}}>
              <TText color="$color6" fontSize={fontSize.lg}>
                {t('main:profile_ui_back')}
              </TText>
            </TouchableOpacity>
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
