import React from 'react';
import {Spinner, Text as TText, useTheme, YStack} from 'tamagui';

export interface LoaderProps {
  /** Optional caption rendered under the spinner. */
  text?: string;
  /** Renders at a smaller size, for use inline within a list or card. */
  compact?: boolean;
}

/**
 * Inline activity indicator. For a modal, interaction-blocking spinner use
 * {@link ../ui/BlockingLoader} via the `useLoading()` provider instead.
 */
export default function Loader({text, compact = false}: LoaderProps) {
  const theme = useTheme();
  const color = theme.primaryColor?.val || theme.color?.val;

  return (
    <YStack alignItems="center" justifyContent="center" gap={compact ? 6 : 10}>
      <Spinner size={compact ? 'small' : 'large'} color={color} />
      {text ? (
        <TText color="$textDefault" fontSize={compact ? 12 : 14}>
          {text}
        </TText>
      ) : null}
    </YStack>
  );
}
