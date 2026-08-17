import React, {useCallback, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {Eye, EyeOff, RefreshCcw, Settings} from '@tamagui/lucide-icons';
import {useTheme, XStack, YStack} from 'tamagui';

import {preferences} from '@/shared/storage';
import {isRedactMode, RedactMode} from '@/shared/utils/redact';

/**
 * The home header's controls.
 *
 * Plain glyphs separated by hairlines, not filled accent circles: three
 * saturated pills in the corner competed with the accent's real job, which in
 * this design is to mark the active profile. Bluetooth is not here — it lives
 * in the tab strip, next to the readers it applies to.
 */
export default function ActionButtons({
  navigation,
  onRefresh,
}: {
  navigation: any;
  onRefresh: () => void;
}) {
  const theme = useTheme();
  const [redact, setRedact] = useState<RedactMode>(() => {
    const stored = preferences.getString('redactMode');
    return isRedactMode(stored) ? stored : 'none';
  });

  /**
   * Toggles between showing identifiers and masking them.
   *
   * A two-state control on purpose: this is the one you hit before handing the
   * phone over or taking a screenshot, so it has to be one tap. `hard` stays
   * reachable from Settings for anyone who wants it.
   */
  const toggleRedact = useCallback(() => {
    const next: RedactMode = redact === 'none' ? 'medium' : 'none';
    preferences.set('redactMode', next);
    setRedact(next);
  }, [redact]);

  const Divider = () => <YStack width={1} height={14} backgroundColor="$borderColor" />;

  const iconButton = (
    label: string,
    onPress: () => void,
    Icon: typeof Settings,
    active: boolean,
  ) => (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{paddingHorizontal: 8, paddingVertical: 10}}>
      <Icon size={16} color={(active ? theme.primaryColor?.val : theme.color9?.val) as string} />
    </TouchableOpacity>
  );

  return (
    <XStack alignItems="center" gap={8}>
      {iconButton(
        redact === 'none' ? 'Hide identifiers' : 'Show identifiers',
        toggleRedact,
        redact === 'none' ? Eye : EyeOff,
        redact !== 'none',
      )}
      <Divider />
      {iconButton('Refresh', onRefresh, RefreshCcw, true)}
      <Divider />
      {iconButton('Settings', () => navigation.navigate('Settings', {}), Settings, false)}
    </XStack>
  );
}
