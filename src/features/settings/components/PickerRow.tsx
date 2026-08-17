import React, {useCallback, useEffect, useState} from 'react';
import {Platform, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Check} from '@tamagui/lucide-icons';
import {Text as TText, useTheme, XStack, YStack} from 'tamagui';
import MaterialYou from 'react-native-material-you-colors';

import {preferences} from '@/shared/storage';
import AppSheet from '@/shared/ui/AppSheet';
import {fontSize, iconSize, radius} from '@/shared/theme/tokens';
import {
  DEFAULT_THEME_COLOR,
  isPresetColor,
  MATERIAL_YOU,
  PRESET_COLORS,
} from '@/shared/theme/presetColors';
import type {SettingRow} from '@/features/settings/types';

const SWATCH = 44;
const CELL = SWATCH + 20;
/**
 * Fixed columns rather than `flexWrap`: the sheet uses snapPointsMode="fit",
 * which measures the frame once and would size it for a single row, clipping
 * everything that wraps. Four cells fit the narrowest phone we support.
 */
const COLUMNS = 4;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function materialYouColor(): string {
  if (Platform.OS !== 'android') {
    return DEFAULT_THEME_COLOR;
  }
  return MaterialYou.getMaterialYouPalette()?.system_accent1[7] || DEFAULT_THEME_COLOR;
}

/** One tappable colour swatch. */
function Swatch({
  color,
  label,
  selected,
  onPress,
}: {
  color: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <YStack alignItems="center" gap={6} width={CELL}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{selected}}>
        <YStack
          width={SWATCH}
          height={SWATCH}
          borderRadius={radius.pill}
          backgroundColor={color}
          alignItems="center"
          justifyContent="center"
          borderWidth={selected ? 3 : 1}
          borderColor={selected ? theme.textDefault?.val : theme.outlineNeutral?.val}>
          {selected ? <Check size={iconSize.md} color="#ffffff" /> : null}
        </YStack>
      </TouchableOpacity>
      <TText color="$color6" fontSize={fontSize.xs} numberOfLines={1}>
        {label}
      </TText>
    </YStack>
  );
}

/**
 * Settings row for choosing the app's accent colour from a fixed palette.
 *
 * Replaces a free-form HSL picker. generateThemes derives foregrounds, tints
 * and button colours from this value, and an arbitrary hex could land somewhere
 * that reads poorly in one scheme. A colour already stored that is not in the
 * palette is preserved and shown as an extra "Current" swatch, so upgrading
 * never silently changes someone's theme.
 */
const PickerRow = React.memo(function PickerRow({row}: {row: SettingRow}) {
  const {t} = useTranslation(['main']);
  const theme = useTheme();

  const [value, setValue] = useState<string>(
    () => preferences.getString(row.key) ?? row.defaultValue ?? DEFAULT_THEME_COLOR,
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = preferences.getString(row.key) ?? row.defaultValue ?? DEFAULT_THEME_COLOR;
    setValue(prev => (stored === prev ? prev : stored));
  }, [row.key, row.defaultValue]);

  const commit = useCallback(
    (next: string) => {
      setValue(next);
      preferences.set(row.key, next);
      row.onChange?.(next);
      setOpen(false);
    },
    [row],
  );

  const myColor = materialYouColor();
  const isMaterialYou = value === MATERIAL_YOU;
  const swatchColor = isMaterialYou ? myColor : value;
  const label = isMaterialYou
    ? 'Material You'
    : PRESET_COLORS.find(c => c.value.toLowerCase() === value.toLowerCase())?.label ?? value;

  const swatches: {color: string; label: string; selected: boolean; next: string}[] = [
    ...PRESET_COLORS.map(preset => ({
      color: preset.value,
      label: preset.label,
      selected: !isMaterialYou && value.toLowerCase() === preset.value.toLowerCase(),
      next: preset.value,
    })),
  ];
  if (Platform.OS === 'android') {
    swatches.push({
      color: myColor,
      label: 'Material You',
      selected: isMaterialYou,
      next: MATERIAL_YOU,
    });
  }
  // Keep an unrecognised stored colour selectable rather than dropping it.
  if (!isMaterialYou && !isPresetColor(value)) {
    swatches.push({color: value, label: 'Current', selected: true, next: value});
  }
  const rows = chunk(swatches, COLUMNS);


  return (
    <View style={{width: '100%'}}>
      <TouchableOpacity activeOpacity={0.6} onPress={() => setOpen(true)}>
        <XStack alignItems="center" gap={12}>
          <TText flex={1} color="$textDefault" fontSize={fontSize.lg}>
            {t(`main:settings_title_${row.key}`)}
          </TText>
          <TText color="$color6" fontSize={fontSize.md}>
            {label}
          </TText>

          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: radius.pill,
              backgroundColor: swatchColor,
              borderWidth: 2,
              borderColor: theme.borderColor?.val,
            }}
          />
        </XStack>
      </TouchableOpacity>

      <AppSheet open={open} onOpenChange={setOpen} title={t(`main:settings_title_${row.key}`)}>
        <YStack gap={12} paddingBottom={12} alignItems="center">
          {rows.map(cells => (
            <XStack key={cells[0].next} gap={8} justifyContent="center">
              {cells.map(cell => (
                <Swatch
                  key={cell.next}
                  color={cell.color}
                  label={cell.label}
                  selected={cell.selected}
                  onPress={() => commit(cell.next)}
                />
              ))}
            </XStack>
          ))}
        </YStack>
      </AppSheet>
    </View>
  );
});

export default PickerRow;
