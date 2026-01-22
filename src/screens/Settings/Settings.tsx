import React from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import Screen from '@/components/common/Screen';
import type { RootScreenProps } from "@/screens/navigation";
import { Card, H5, Separator, Text, XStack, YStack } from 'tamagui';
import {
  Languages,
  Moon,
  Layers,
  EyeOff,
  Activity,
  Subtitles,
  ShieldCheck,
  Fingerprint,
  Palette
} from '@tamagui/lucide-icons';
import { isSimplifiedMode } from "@/utils/featureConfig";
import { preferences } from "@/utils/mmkv";
import { useColorScheme } from "@/theme/context";
import i18next from "i18next";
import PickerRow from "@/screens/Settings/components/PickerRow";
import SelectRow from "@/screens/Settings/components/SelectRow";
import AIDRow from "@/screens/Settings/components/AIDRow";

export type SettingDataType = {
  key: string;
  options?: string[];
  type: string;
  defaultValue?: string;
  icon: any;
  onChange?: (value: string) => void;
  validate?: (value: string) => boolean;
  androidOnly?: boolean;
}

const SettingsSection = ({ title, items, renderItem }: { title: string, items: SettingDataType[], renderItem: any }) => {
  if (items.length === 0) return null;
  return (
    <YStack gap={12} marginBottom={20}>
      <H5 paddingHorizontal={12} color="$color8" fontSize={13} textTransform="uppercase" letterSpacing={1}>
        {title}
      </H5>
      <Card backgroundColor="$surfaceSpecial" borderRadius={16} overflow="hidden" elevation={2}>
        <YStack>
          {items.map((item, index) => (
            <React.Fragment key={item.key}>
              {index > 0 && <Separator borderColor="$borderColor" opacity={0.5} marginHorizontal={16} />}
              <YStack padding={16}>
                {renderItem({ item })}
              </YStack>
            </React.Fragment>
          ))}
        </YStack>
      </Card>
    </YStack>
  );
};

export default function Settings({ route, navigation }: RootScreenProps<'Settings'>) {
  const { t } = useTranslation(['main']);
  const { setTheme } = useColorScheme();

  const isSimplified = isSimplifiedMode();
  const keysToHide = isSimplified ? ['displaySubtitle', 'unit', 'disableProtection', 'aid', 'themeColor'] : [];

  const allItems: SettingDataType[] = [
    { key: 'language', icon: Languages, options: ['en', 'ja', 'zh', 'es', 'ru', 'ar'], defaultValue: 'en', type: 'select', onChange: (value: string) => { preferences.set('language', value); void i18next.changeLanguage(value); } },
    { key: 'theme', icon: Moon, options: ['default', 'dark', 'light'], defaultValue: 'default', type: 'select', onChange: (value: string) => { setTheme(value); } },
    { key: 'showSlots', icon: Layers, options: ['all', 'possible', 'available'], defaultValue: 'all', type: 'select' },
    { key: 'redactMode', icon: EyeOff, options: ['none', 'medium', 'hard'], defaultValue: 'none', type: 'select' },
    { key: 'unit', icon: Activity, options: ['b', 'kb', 'kib', 'mb', 'mib', 'adaptive_si', 'adaptive_bi'], defaultValue: 'adaptive_si', type: 'select' },
    { key: 'displaySubtitle', icon: Subtitles, options: ['provider', 'operator', 'country', 'code', 'iccid'], defaultValue: 'provider', type: 'select' },
    { key: 'disableProtection', icon: ShieldCheck, options: ['on', 'off'], defaultValue: 'on', type: 'select', androidOnly: true },
    { key: 'aid', icon: Fingerprint, type: 'aid' },
    { key: 'themeColor', icon: Palette, defaultValue: '#813ff3', type: 'color' },
  ];

  const filteredItems = allItems.filter(item => {
    if (keysToHide.includes(item.key)) return false;
    if (item.androidOnly && Platform.OS !== 'android') return false;
    return true;
  });

  const generalItems = filteredItems.filter(i => ['language', 'theme', 'showSlots'].includes(i.key));
  const displayItems = filteredItems.filter(i => ['redactMode', 'unit', 'displaySubtitle', 'themeColor'].includes(i.key));
  const advancedItems = filteredItems.filter(i => ['disableProtection', 'aid'].includes(i.key));

  const renderItem = ({ item }: { item: SettingDataType }) => {
    if (item.type === 'color') return <PickerRow key={item.key} row={item} />;
    if (item.type === 'select') return <SelectRow key={item.key} row={item} />;
    if (item.type === 'aid') return <AIDRow key={item.key} row={item} />;
  };

  return (
    <Screen title={t('main:settings_settings')} subtitle={t('main:settings_subtitle')} keyboardAvoiding scrollViewProps={{ nestedScrollEnabled: true }}>
      <YStack paddingTop={10}>
        <SettingsSection title={t('main:settings_group_general')} items={generalItems} renderItem={renderItem} />
        <SettingsSection title={t('main:settings_group_display')} items={displayItems} renderItem={renderItem} />
        <SettingsSection title={t('main:settings_group_advanced')} items={advancedItems} renderItem={renderItem} />
      </YStack>
    </Screen>
  );
}
