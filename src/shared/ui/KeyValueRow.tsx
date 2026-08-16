import React from 'react';
import {Text as TText, XStack} from 'tamagui';
import {fontFamily, fontSize} from '@/shared/theme/tokens';

/**
 * Label on the left, value on the right in mono.
 *
 * Values here are identifiers — ICCID, EID, MCC/MNC, firmware — and the design
 * sets every one of them in mono so a 32-digit EID can be checked against a
 * card. `word-break` equivalent comes from letting the value wrap.
 */
export default function KeyValueRow({
  label,
  value,
  labelWidth = 96,
}: {
  label: string;
  value: string;
  labelWidth?: number;
}) {
  return (
    <XStack alignItems="baseline" gap={14}>
      <TText flexShrink={0} width={labelWidth} color="$color6" fontSize={fontSize.sm}>
        {label}
      </TText>
      <TText
        flex={1}
        textAlign="right"
        color="$textDefault"
        fontFamily={fontFamily.mono as any}
        fontSize={fontSize.sm}>
        {value}
      </TText>
    </XStack>
  );
}
