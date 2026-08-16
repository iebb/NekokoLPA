import React from 'react';
import {Text as TText} from 'tamagui';
import {fontFamily, fontSize, tracking} from '@/shared/theme/tokens';

/**
 * The uppercase mono micro-label that heads every section and card.
 *
 * It carries structure rather than emphasis, so it is deliberately small,
 * tertiary in colour, and tracked out — set tight it reads as shouting.
 */
export default function SectionLabel({
  children,
  color = '$color9',
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <TText
      color={color}
      fontFamily={fontFamily.mono as any}
      fontSize={fontSize.xs}
      fontWeight={'500' as any}
      letterSpacing={tracking.label}
      textTransform="uppercase">
      {children}
    </TText>
  );
}
