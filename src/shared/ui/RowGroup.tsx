import React from 'react';
import {YStack} from 'tamagui';
import {radius} from '@/shared/theme/tokens';

/**
 * A group of rows separated by hairlines.
 *
 * The separator is not a border on each row: the container is painted in the
 * line colour and the rows in the surface colour with a 1px gap, so the line
 * shows through. That is how the design gets exact 1px dividers that stop at
 * the group's rounded corners, without a trailing rule under the last row.
 *
 * Children are expected to set their own `backgroundColor="$surfaceRow"`; use
 * {@link Row} unless a child needs a different fill.
 */
export default function RowGroup({children}: {children: React.ReactNode}) {
  return (
    <YStack
      backgroundColor="$borderColor"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius={radius.lg}
      overflow="hidden"
      gap={1}>
      {children}
    </YStack>
  );
}

/** One row inside a {@link RowGroup}. */
export function Row({
  children,
  paddingVertical = 13,
  paddingHorizontal = 14,
}: {
  children: React.ReactNode;
  paddingVertical?: number;
  paddingHorizontal?: number;
}) {
  return (
    <YStack
      backgroundColor="$surfaceRow"
      paddingVertical={paddingVertical}
      paddingHorizontal={paddingHorizontal}>
      {children}
    </YStack>
  );
}
