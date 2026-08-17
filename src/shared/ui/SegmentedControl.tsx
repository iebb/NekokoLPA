import React from 'react';
import {TouchableOpacity} from 'react-native';
import {Text as TText, useTheme, XStack} from 'tamagui';

import {fontSize, radius} from '@/shared/theme/tokens';

export interface Segment {
  value: string;
  label: string;
}

/**
 * Inline choice between a small number of options.
 *
 * Settings used a sheet for every choice, including three-way ones: two taps
 * and a modal to answer a question whose options fit on one line. A segmented
 * control shows the alternatives and the current answer at once, so the value
 * is readable without opening anything.
 *
 * Reserved for up to three options whose labels are short enough to render in
 * full. A clipped label cannot be read at all, so anything longer belongs in a
 * sheet — see the fit check in SelectRow.
 */
export default function SegmentedControl({
  segments,
  value,
  onChange,
}: {
  segments: Segment[];
  value: string;
  onChange: (value: string) => void;
}) {
  const theme = useTheme();

  return (
    <XStack
      backgroundColor="$surfaceSpecial"
      borderRadius={radius.sm}
      padding={3}
      gap={3}
      alignSelf="stretch">
      {segments.map(segment => {
        const active = segment.value === value;
        return (
          <TouchableOpacity
            key={segment.value}
            accessibilityRole="button"
            accessibilityState={{selected: active}}
            activeOpacity={0.7}
            onPress={() => onChange(segment.value)}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: radius.xs,
              alignItems: 'center',
              backgroundColor: active ? theme.primaryColor?.val : 'transparent',
            }}>
            <TText
              numberOfLines={1}
              color={active ? theme.onFilled?.val : '$color6'}
              fontSize={fontSize.md}
              fontWeight={(active ? '600' : '500') as any}>
              {segment.label}
            </TText>
          </TouchableOpacity>
        );
      })}
    </XStack>
  );
}
