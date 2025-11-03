import React, {useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Adapt, Select, Text as TText} from 'tamagui';
import AppSheet from '@/components/common/AppSheet';
import {preferences} from '@/utils/mmkv';

export type SettingDataType = {
  key: string;
  options?: string[];
  type: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  validate?: (value: string) => boolean;
}

const SelectRow = React.memo(function SelectRow({row} : {row: SettingDataType}) {
  const { t } = useTranslation(['main']);
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

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={() => setOpen(true)}>
      <TText color="$textDefault" fontSize={14}>{t(`main:settings_title_${row.key}`)}</TText>
      <TText color="$color6" textAlign="right" fontSize={14}>{currentLabel} →</TText>
      {
        open && (
          <Select open={open} onOpenChange={setOpen} value={v}
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
                {options.map((opt, i) => (
                  <Select.Item padding={0} key={opt} value={opt} index={i} backgroundColor="transparent" pressStyle={{ backgroundColor: 'transparent' }}>
                    <Select.ItemText>{t(`main:settings_item_${row.key}_${opt}`)}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select>
        )
      }
    </TouchableOpacity>
  );
});

export default SelectRow;


