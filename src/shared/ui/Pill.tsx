import React from 'react';
import {Text as TText, YStack} from 'tamagui';
import {fontFamily, fontSize, radius, tracking} from '@/shared/theme/tokens';

export type PillTone = 'accent' | 'neutral' | 'danger';

const TONES: Record<PillTone, {bg: string; fg: string}> = {
  accent: {bg: '$colorFocus', fg: '$primaryColor'},
  neutral: {bg: '$surfaceSpecial', fg: '$color6'},
  danger: {bg: '$surfaceSpecial', fg: '$backgroundDangerHeavy'},
};

/**
 * Small uppercase mono badge: "Active" on a profile, the operation on a
 * queued notification, "Connected" on a reader.
 */
export default function Pill({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: PillTone;
}) {
  const {bg, fg} = TONES[tone];
  return (
    <YStack
      backgroundColor={bg}
      borderRadius={radius.xs}
      paddingHorizontal={6}
      paddingVertical={2}
      alignSelf="flex-start">
      <TText
        color={fg}
        fontFamily={fontFamily.mono as any}
        fontSize={fontSize.xs}
        fontWeight={'500' as any}
        letterSpacing={tracking.label / 2}
        textTransform="uppercase">
        {children}
      </TText>
    </YStack>
  );
}
