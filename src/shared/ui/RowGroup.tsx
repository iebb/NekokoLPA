import React from 'react';
import {YStack} from 'tamagui';
import {radius} from '@/shared/theme/tokens';

/**
 * A group of rows separated by hairlines.
 *
 * The group is a single surface-coloured block with a hairline *between* its
 * rows — not a tinted container with gaps showing through, which read as an
 * inset well around the content rather than as the content itself.
 *
 * The separator is applied here rather than by each row so the last row never
 * carries one: a rule hanging above a rounded bottom corner is the giveaway of
 * a list assembled row by row.
 */
export default function RowGroup({children}: {children: React.ReactNode}) {
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <YStack backgroundColor="$surfaceRow" borderRadius={radius.lg} overflow="hidden">
      {items.map((child, index) => (
        <YStack
          key={index}
          borderBottomWidth={index === items.length - 1 ? 0 : 1}
          borderBottomColor="$borderColor">
          {child}
        </YStack>
      ))}
    </YStack>
  );
}

/** One row inside a {@link RowGroup}. */
export function Row({
  children,
  paddingVertical = 14,
  paddingHorizontal = 14,
}: {
  children: React.ReactNode;
  paddingVertical?: number;
  paddingHorizontal?: number;
}) {
  return (
    <YStack paddingVertical={paddingVertical} paddingHorizontal={paddingHorizontal}>
      {children}
    </YStack>
  );
}
