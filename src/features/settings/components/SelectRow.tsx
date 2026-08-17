import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Text as TText, XStack, useTheme} from 'tamagui';
import {preferences} from '@/shared/storage';
import {ChevronDown} from '@tamagui/lucide-icons';
import type {SettingRow} from '@/features/settings/types';
import {fontSize, iconSize} from '@/shared/theme/tokens';
import Dropdown from '@/shared/ui/Dropdown';

const SelectRow = React.memo(function SelectRow({row}: {row: SettingRow}) {
  const {t} = useTranslation(['main']);
  const theme = useTheme();
  const currentValue = preferences.getString(row.key) ?? row.defaultValue ?? '';
  const [v, setV] = useState<string>(currentValue);

  useEffect(() => {
    const newValue = preferences.getString(row.key) ?? row.defaultValue ?? '';
    if (newValue !== v) setV(newValue);
  }, [row.key, row.defaultValue, v]);

  const options = row.options || [];
  const currentLabel = row.options?.find(opt => opt === v)
    ? t(`main:settings_item_${row.key}_${v}`)
    : v;


  const commit = (next: string) => {
    setV(next);
    preferences.set(row.key, next);
    row.onChange?.(next);
  };

  const optionLabels = options.map(opt => t(`main:settings_item_${row.key}_${opt}`));

  return (
    <Dropdown
      value={v}
      onChange={commit}
      options={options.map((opt, i) => ({value: opt, label: optionLabels[i]}))}>
      {/* Label left, current value right. No tinted icon tile: a column of
          accent squares made every row shout equally, and the accent belongs
          to state, not decoration. */}
      <XStack alignItems="center" gap={12}>
        <TText flex={1} color="$textDefault" fontSize={fontSize.lg}>
          {t(`main:settings_title_${row.key}`)}
        </TText>
        <TText color="$color6" fontSize={fontSize.md} numberOfLines={1} flexShrink={1}>
          {currentLabel}
        </TText>
        <ChevronDown size={iconSize.sm} color={theme.color9?.val} />
      </XStack>
    </Dropdown>
  );
});

export default SelectRow;
