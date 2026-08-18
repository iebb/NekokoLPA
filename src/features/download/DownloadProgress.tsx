import React, {useEffect, useRef} from 'react';
import {Modal, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text as TText, useTheme, XStack, YStack} from 'tamagui';

import {fontFamily, fontSize, radius, tracking} from '@/shared/theme/tokens';
import SectionLabel from '@/shared/ui/SectionLabel';
import {
  percentForStep,
  phaseForMessage,
  phasesFor,
  reportsBytes,
} from '@/features/download/downloadPhases';
import {useFormatSize} from '@/shared/hooks/useFormatSize';

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

  const formatSize = useFormatSize();

  // The highest percentage reported so far. The byte-reporting step
  // interpolates towards 90% and the step after it starts lower, so without a
  // floor the bar jumps backwards the moment the package finishes loading.
  const floor = useRef(0);
  const active = phaseForMessage(progress?.message);
  const phases = phasesFor(active);
  const percent = percentForStep(
    progress?.message,
    progress?.progress,
    progress?.total,
    floor.current,
  );
  floor.current = percent;

  // A fresh install starts from zero, not from where the last one ended.
  useEffect(() => {
    return () => {
      floor.current = 0;
    };
  }, []);

  const showBytes =
    reportsBytes(progress?.message) && !!progress?.total && progress.total > 0;

  const dotColor = (state: string) =>
    state === 'done'
      ? theme.backgroundSuccessHeavy?.val
      : state === 'current'
      ? theme.primaryColor?.val
      : theme.surfaceSpecial?.val;

  // A Modal, not an absolutely-positioned overlay. Rendered inside the
  // confirm screen's scroll content, `position: absolute` is positioned
  // against that content rather than the window: the percentage collided with
  // the buttons underneath and the phase list bled out below the fold.
  return (
    <Modal visible animationType="fade" presentationStyle="overFullScreen" transparent>
      <YStack
        flex={1}
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
          <YStack
            height={4}
            borderRadius={radius.pill}
            backgroundColor="$surfaceSpecial"
            overflow="hidden">
            <YStack height="100%" width={`${percent}%`} backgroundColor="$primaryColor" />
          </YStack>
          {showBytes && (
            <TText color="$color9" fontFamily={fontFamily.mono as any} fontSize={fontSize.md}>
              {formatSize(progress?.progress ?? 0)} / {formatSize(progress?.total ?? 0)}
            </TText>
          )}
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
    </Modal>
  );
}
