import React from 'react';
import {Platform} from 'react-native';
import {useTranslation} from 'react-i18next';
import Screen from '@/components/common/Screen';
import type {RootScreenProps} from "@/screens/navigation";
import {YStack} from 'tamagui';
import {preferences} from "@/utils/mmkv";
import {useColorScheme} from "@/theme/context";
import i18next from "i18next";
import PickerRow from "@/screens/Settings/components/PickerRow";
import SelectRow from "@/screens/Settings/components/SelectRow";
import AIDRow from "@/screens/Settings/components/AIDRow";

export type SettingDataType = {
  key: string;
  options?: string[];
  type: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  validate?: (value: string) => boolean;
}


export default function Settings({ route,  navigation }: RootScreenProps<'Settings'>) {

  const { t } = useTranslation(['main']);
  const {setTheme} = useColorScheme();

  const items: SettingDataType[] = [
    { key: 'language', options: ['en','ja','zh','es','ru','ar'], defaultValue: 'en', type: 'select', onChange: (value: string) => { preferences.set('language', value); void i18next.changeLanguage(value); } },
    { key: 'theme', options: ['default','dark','light'], defaultValue: 'default', type: 'select', onChange: (value: string) => { setTheme(value); } },
    { key: 'showSlots', options: ['all','possible','available'], defaultValue: 'all', type: 'select' },
    { key: 'redactMode', options: ['none','medium','hard'], defaultValue: 'none', type: 'select' },
    { key: 'unit', options: ['b','kb','kib','mb','mib','adaptive_si','adaptive_bi'], defaultValue: 'adaptive_si', type: 'select' },
    { key: 'displaySubtitle', options: ['provider','operator','country','code','iccid'], defaultValue: 'provider', type: 'select' },
    { key: 'aid', type: 'aid' },
    { key: 'themeColor', defaultValue: '#a575f6', type: 'color' },
  ];

  if (Platform.OS === 'android') {
    items.splice(items.length - 2, 0, { key: 'disableProtection', options: ['on', 'off'], defaultValue: 'on', type: 'select' });
  }

  const renderItem = ({item}: {item: SettingDataType}) => {
    if (item.type === 'color') return <PickerRow key={item.key} row={item} />;
    if (item.type === 'select') return <SelectRow key={item.key} row={item} />;
    if (item.type === 'aid') return <AIDRow key={item.key} row={item} />;
  };

  return (
    <Screen title={t('main:settings_settings')} subtitle={t('main:settings_subtitle')} keyboardAvoiding scrollViewProps={{ nestedScrollEnabled: true }}>
      <YStack gap={16}>
        {items.map((item: SettingDataType) => renderItem({item}))}
      </YStack>
    </Screen>
  );
}
