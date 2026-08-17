import React, {useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Adapt, Select, Text as TText, XStack, YStack, useTheme} from 'tamagui';
import AppSheet from '@/shared/ui/AppSheet';
import {preferences} from '@/shared/storage';
import {ChevronRight} from '@tamagui/lucide-icons';
import type {SettingRow} from '@/features/settings/types';
import {fontSize, iconSize, radius} from '@/shared/theme/tokens';

const SelectRow = React.memo(function SelectRow({row}: {row: SettingRow}) {
  const {t} = useTranslation(['main']);
  const theme = useTheme();
  const currentValue = preferences.getString(row.key) ?? row.defaultValue ?? '';
  const [v, setV] = useState<string>(currentValue);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const newValue = preferences.getString(row.key) ?? row.defaultValue ?? '';
    if (newValue !== v) setV(newValue);
  }, [row.key, row.defaultValue, v]);

  const options = row.options || [];
  const currentLabel = row.options?.find(opt => opt === v)
    ? t(`main:settings_item_${row.key}_${v}`)
    : v;


  return (
    <TouchableOpacity activeOpacity={0.6} onPress={() => setOpen(true)}>
      {/* Label left, current value right. No tinted icon tile: a column of
          accent squares made every row shout equally, and the accent belongs
          to state, not to decoration. */}
      <XStack alignItems="center" gap={12}>
        <TText flex={1} color="$textDefault" fontSize={fontSize.lg}>
          {t(`main:settings_title_${row.key}`)}
        </TText>
        <TText color="$color6" fontSize={fontSize.md} numberOfLines={1} flexShrink={1}>
          {currentLabel}
        </TText>
        <ChevronRight size={iconSize.sm} color={theme.color9?.val} />
      </XStack>

      {open && (
        <Select
          open={open}
          onOpenChange={setOpen}
          value={v}
          onValueChange={(opt: string) => {
            setV(opt);
            preferences.set(row.key, opt);
            row.onChange?.(opt);
          }}>
          <Select.Trigger display="none">
            <Select.Value placeholder={currentLabel} />
          </Select.Trigger>
          <Adapt platform="touch">
            <AppSheet
              open={open}
              onOpenChange={setOpen}
              title={t(`main:settings_title_${row.key}`)}>
              <Adapt.Contents />
            </AppSheet>
          </Adapt>
          <Select.Content zIndex={200000}>
            <Select.Viewport>
              <YStack padding={8} gap={4}>
                {options.map((opt, i) => (
                  <Select.Item
                    key={opt}
                    value={opt}
                    index={i}
                    borderRadius={radius.sm}
                    paddingVertical={12}
                    paddingHorizontal={16}
                    backgroundColor={v === opt ? '$primaryColor' : 'transparent'}
                    pressStyle={{backgroundColor: '$color3'}}>
                    <Select.ItemText color={v === opt ? '$background' : '$textDefault'}>
                      {t(`main:settings_item_${row.key}_${opt}`)}
                    </Select.ItemText>
                  </Select.Item>
                ))}
              </YStack>
            </Select.Viewport>
          </Select.Content>
        </Select>
      )}
    </TouchableOpacity>
  );
});

export default SelectRow;
