import React from 'react';
import {Platform} from 'react-native';
import {useTranslation} from 'react-i18next';
import Screen from '@/shared/ui/Screen';
import type {RootScreenProps} from '@/app/navigation/types';
import {Card, H5, Separator, YStack} from 'tamagui';
import {
  Languages,
  Moon,
  Layers,
  EyeOff,
  Activity,
  Subtitles,
  ShieldCheck,
  Fingerprint,
  Palette,
} from '@tamagui/lucide-icons';
import {isSimplifiedMode} from '@/shared/config/features';
import {preferences} from '@/shared/storage';
import {useColorScheme, type ThemePreference} from '@/app/providers/ThemeProvider';
import i18next from 'i18next';
import PickerRow from '@/features/settings/components/PickerRow';
import SelectRow from '@/features/settings/components/SelectRow';
import AIDRow from '@/features/settings/components/AIDRow';
import type {SettingRow} from '@/features/settings/types';

/** Which rows belong to which section, in display order. */
const SECTIONS = [
  {titleKey: 'main:settings_group_general', keys: ['language', 'theme', 'showSlots']},
  {
    titleKey: 'main:settings_group_display',
    keys: ['redactMode', 'unit', 'displaySubtitle', 'themeColor'],
  },
  {titleKey: 'main:settings_group_advanced', keys: ['disableProtection', 'aid']},
] as const;

/** Rows hidden when the app is built in simplified mode. */
const SIMPLIFIED_HIDDEN_KEYS = [
  'displaySubtitle',
  'unit',
  'disableProtection',
  'aid',
  'themeColor',
];

const SettingsSection = ({
  title,
  items,
  renderItem,
}: {
  title: string;
  items: SettingRow[];
  renderItem: (props: {item: SettingRow}) => React.ReactNode;
}) => {
  if (items.length === 0) return null;
  return (
    <YStack gap={12} marginBottom={20}>
      <H5
        paddingHorizontal={12}
        color="$color8"
        fontSize={13}
        textTransform="uppercase"
        letterSpacing={1}>
        {title}
      </H5>
      <Card backgroundColor="$surfaceSpecial" borderRadius={16} overflow="hidden" elevation={2}>
        <YStack>
          {items.map((item, index) => (
            <React.Fragment key={item.key}>
              {index > 0 && (
                <Separator borderColor="$borderColor" opacity={0.5} marginHorizontal={16} />
              )}
              <YStack padding={16}>{renderItem({item})}</YStack>
            </React.Fragment>
          ))}
        </YStack>
      </Card>
    </YStack>
  );
};

export default function Settings(_props: RootScreenProps<'Settings'>) {
  const {t} = useTranslation(['main']);
  const {setTheme} = useColorScheme();

  const keysToHide = isSimplifiedMode() ? SIMPLIFIED_HIDDEN_KEYS : [];

  const allItems: SettingRow[] = [
    {
      key: 'language',
      icon: Languages,
      options: ['en', 'ja', 'zh', 'es', 'ru', 'ar'],
      defaultValue: 'en',
      type: 'select',
      onChange: (value: string) => {
        preferences.set('language', value);
        void i18next.changeLanguage(value);
      },
    },
    {
      key: 'theme',
      icon: Moon,
      options: ['default', 'dark', 'light'],
      defaultValue: 'default',
      type: 'select',
      onChange: (value: string) => {
        setTheme(value as ThemePreference);
      },
    },
    {
      key: 'showSlots',
      icon: Layers,
      options: ['all', 'possible', 'available'],
      defaultValue: 'all',
      type: 'select',
    },
    {
      key: 'redactMode',
      icon: EyeOff,
      options: ['none', 'medium', 'hard'],
      defaultValue: 'none',
      type: 'select',
    },
    {
      key: 'unit',
      icon: Activity,
      options: ['b', 'kb', 'kib', 'mb', 'mib', 'adaptive_si', 'adaptive_bi'],
      defaultValue: 'adaptive_si',
      type: 'select',
    },
    {
      key: 'displaySubtitle',
      icon: Subtitles,
      options: ['provider', 'operator', 'country', 'code', 'iccid'],
      defaultValue: 'provider',
      type: 'select',
    },
    {
      key: 'disableProtection',
      icon: ShieldCheck,
      options: ['on', 'off'],
      defaultValue: 'on',
      type: 'select',
      androidOnly: true,
    },
    {key: 'aid', icon: Fingerprint, type: 'aid'},
    {key: 'themeColor', icon: Palette, defaultValue: '#813ff3', type: 'color'},
  ];

  const filteredItems = allItems.filter(item => {
    if (keysToHide.includes(item.key)) return false;
    if (item.androidOnly && Platform.OS !== 'android') return false;
    return true;
  });

  const renderItem = ({item}: {item: SettingRow}) => {
    switch (item.type) {
      case 'color':
        return <PickerRow key={item.key} row={item} />;
      case 'select':
        return <SelectRow key={item.key} row={item} />;
      case 'aid':
        return <AIDRow key={item.key} row={item} />;
      default:
        return null;
    }
  };

  return (
    <Screen
      title={t('main:settings_settings')}
      subtitle={t('main:settings_subtitle')}
      keyboardAvoiding
      scrollViewProps={{nestedScrollEnabled: true}}>
      <YStack paddingTop={10}>
        {SECTIONS.map(section => (
          <SettingsSection
            key={section.titleKey}
            title={t(section.titleKey)}
            items={filteredItems.filter(i => (section.keys as readonly string[]).includes(i.key))}
            renderItem={renderItem}
          />
        ))}
      </YStack>
    </Screen>
  );
}
