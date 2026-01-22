import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Adapt, Select, Text as TText, XStack, YStack, useTheme } from 'tamagui';
import AppSheet from '@/components/common/AppSheet';
import { preferences } from '@/utils/mmkv';
import { ChevronRight } from '@tamagui/lucide-icons';

export type SettingDataType = {
  key: string;
  options?: string[];
  type: string;
  defaultValue?: string;
  icon: any;
  onChange?: (value: string) => void;
  validate?: (value: string) => boolean;
}

const SelectRow = React.memo(function SelectRow({ row }: { row: SettingDataType }) {
  const { t } = useTranslation(['main']);
  const theme = useTheme();
  const currentValue = preferences.getString(row.key) ?? (row.defaultValue ?? '');
  const [v, setV] = useState<string>(currentValue);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const newValue = preferences.getString(row.key) ?? (row.defaultValue ?? '');
    if (newValue !== v) setV(newValue);
  }, [row.key, row.defaultValue, v]);

  const options = row.options || [];
  const currentLabel = row.options?.find(opt => opt === v)
    ? t(`main:settings_item_${row.key}_${v}`)
    : v;

  const Icon = row.icon;

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={() => setOpen(true)}>
      <XStack alignItems="center" gap={16}>
        <YStack
          padding={8}
          borderRadius={10}
          position="relative"
          alignItems="center"
          justifyContent="center"
        >
          <YStack position="absolute" top={0} left={0} right={0} bottom={0} backgroundColor="$primaryColor" borderRadius={10} opacity={0.15} />
          <Icon size={20} color={theme.primaryColor?.val} />
        </YStack>

        <YStack flex={1}>
          <TText color="$textDefault" fontSize={16} fontWeight="500">
            {t(`main:settings_title_${row.key}`)}
          </TText>
          <TText color="$color6" fontSize={13}>
            {currentLabel}
          </TText>
        </YStack>

        <ChevronRight size={18} color="$color6" />
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
          }}
        >
          <Select.Trigger display="none">
            <Select.Value placeholder={currentLabel} />
          </Select.Trigger>
          <Adapt platform="touch">
            <AppSheet open={open} onOpenChange={setOpen} title={t(`main:settings_title_${row.key}`)}>
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
                    borderRadius={8}
                    paddingVertical={12}
                    paddingHorizontal={16}
                    backgroundColor={v === opt ? "$primaryColor" : "transparent"}
                    pressStyle={{ backgroundColor: '$color3' }}
                  >
                    <Select.ItemText color={v === opt ? "$background" : "$textDefault"}>
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
