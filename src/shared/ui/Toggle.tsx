import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useTheme} from 'tamagui';
import {radius} from '@/shared/theme/tokens';

const TRACK_W = 46;
const TRACK_H = 27;
const THUMB = 22;

/**
 * The platform-style switch used for profile enable/disable and settings.
 *
 * Hand-rolled rather than Tamagui's Switch so the track and thumb match the
 * design's exact geometry, and so the disabled state can dim without the
 * component swallowing the press.
 */
export default function Toggle({
  value,
  onPress,
  disabled = false,
}: {
  value: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      accessibilityRole="switch"
      accessibilityState={{checked: value, disabled}}
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={{
        width: TRACK_W,
        height: TRACK_H,
        borderRadius: radius.pill,
        padding: 3,
        opacity: disabled ? 0.5 : 1,
        justifyContent: 'center',
        alignItems: value ? 'flex-end' : 'flex-start',
        backgroundColor: value ? theme.primaryColor?.val : theme.surfaceSpecial?.val,
      }}>
      <View
        style={{
          width: THUMB,
          height: THUMB,
          borderRadius: radius.pill,
          backgroundColor: theme.onFilled?.val ?? '#ffffff',
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 2,
          shadowOffset: {width: 0, height: 1},
          elevation: 2,
        }}
      />
    </TouchableOpacity>
  );
}
