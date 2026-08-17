import React from 'react';
import {TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text as TText, useTheme, XStack, YStack} from 'tamagui';

import {fontFamily, fontSize, radius, tracking} from '@/shared/theme/tokens';
import SectionLabel from '@/shared/ui/SectionLabel';
import {percentFor, phaseForMessage, phasesFor} from '@/features/download/downloadPhases';

/**
 * Full-screen download progress.
 *
 * Replaces a spinner with an indeterminate caption. A profile install takes
 * long enough that "something is happening" is not enough — the screen states
 * which of the three phases is running, and the percentage gives the one thing
 * a spinner cannot: whether it is still moving.
 */
export default function DownloadProgress({
  target,
  profileName,
  progress,
  onCancel,
}: {
  /** Where the profile is being installed — the reader or slot name. */
  target: string;
  /** Profile being installed, if the metadata is known yet. */
  profileName?: string;
  /** Raw progress payload from the LPA: `{message, progress, total}`. */
  progress: {message?: string; progress?: number; total?: number};
  onCancel?: () => void;
}) {
  const {t} = useTranslation(['main']);
  const theme = useTheme();

  const active = phaseForMessage(progress?.message);
  const phases = phasesFor(active);
  const percent = percentFor(active, progress?.progress, progress?.total);

  const dotColor = (state: string) =>
    state === 'done'
      ? theme.backgroundSuccessHeavy?.val
      : state === 'current'
      ? theme.primaryColor?.val
      : theme.surfaceSpecial?.val;

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="$background"
      justifyContent="center"
      gap={26}
      paddingHorizontal={26}>
      <YStack gap={8}>
        <SectionLabel>{t('main:download_installing_on', {target})}</SectionLabel>
        {!!profileName && (
          <TText
            color="$textDefault"
            fontSize={fontSize.xxl}
            fontWeight={'600' as any}
            letterSpacing={tracking.title}>
            {profileName}
          </TText>
        )}
      </YStack>

      <YStack gap={14}>
        <TText
          color="$textDefault"
          fontFamily={fontFamily.mono as any}
          fontSize={fontSize.hero}
          fontWeight={'600' as any}>
          {percent}%
        </TText>
        <YStack height={4} borderRadius={radius.pill} backgroundColor="$surfaceSpecial" overflow="hidden">
          <YStack height="100%" width={`${percent}%`} backgroundColor="$primaryColor" />
        </YStack>
      </YStack>

      <YStack gap={11}>
        {phases.map(phase => (
          <XStack key={phase.labelKey} alignItems="center" gap={10}>
            <YStack width={7} height={7} borderRadius={2} backgroundColor={dotColor(phase.state)} />
            <TText
              color={phase.state === 'pending' ? '$color9' : '$textDefault'}
              fontSize={fontSize.md}>
              {t(phase.labelKey)}
            </TText>
          </XStack>
        ))}
      </YStack>

      {onCancel && (
        <TouchableOpacity onPress={onCancel} style={{alignSelf: 'flex-start'}}>
          <TText color="$color6" fontSize={fontSize.lg}>
            {t('main:download_cancel')}
          </TText>
        </TouchableOpacity>
      )}
    </YStack>
  );
}
