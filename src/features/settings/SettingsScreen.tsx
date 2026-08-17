import React from 'react';
import {Linking, Platform, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import Screen from '@/shared/ui/Screen';
import type {RootScreenProps} from '@/app/navigation/types';
import {Text as TText, useTheme, XStack, YStack} from 'tamagui';
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
import {DEFAULT_THEME_COLOR} from '@/shared/theme/presetColors';
import SectionLabel from '@/shared/ui/SectionLabel';
import RowGroup, {Row} from '@/shared/ui/RowGroup';
import {AppBuyLink, AppVersion, DisplayGithubLink, GithubLink} from '@/shared/config/app';
import {fontFamily, fontSize, iconSize} from '@/shared/theme/tokens';
import {ExternalLink} from '@tamagui/lucide-icons';

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
  // A mono micro-label over a hairline-separated group: the separators come
  // from RowGroup's 1px gaps, so there is no rule under the final row.
  return (
    <YStack gap={8} marginBottom={18}>
      <YStack paddingLeft={4}>
        <SectionLabel>{title}</SectionLabel>
      </YStack>
      <RowGroup>
        {items.map(item => (
          <Row key={item.key} paddingVertical={14}>
            {renderItem({item})}
          </Row>
        ))}
      </RowGroup>
    </YStack>
  );
};

/**
 * Outbound links, kept together under About.
 *
 * These used to live in the side menu, which is gone. Settings is where people
 * look for "where do I report this" and "where is the source", so they belong
 * here rather than only as footnotes under the profile list.
 */
const ABOUT_LINKS = [
  ...(DisplayGithubLink && GithubLink
    ? [
        {key: 'main:settings_report_bug', onPress: () => Linking.openURL(`${GithubLink}/issues`)},
        {key: 'main:settings_source', onPress: () => Linking.openURL(GithubLink)},
      ]
    : []),
  {key: 'main:settings_buy_device', onPress: () => Linking.openURL(AppBuyLink)},
];

export default function Settings(_props: RootScreenProps<'Settings'>) {
  const {t} = useTranslation(['main']);
  const theme = useTheme();
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
    {key: 'themeColor', icon: Palette, defaultValue: DEFAULT_THEME_COLOR, type: 'color'},
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

        <YStack gap={8} marginBottom={18}>
          <YStack paddingLeft={4}>
            <SectionLabel>{t('main:settings_group_about')}</SectionLabel>
          </YStack>
          <RowGroup>
            <Row>
              <XStack alignItems="center" justifyContent="space-between" gap={12}>
                <TText color="$textDefault" fontSize={fontSize.lg}>
                  {t('main:settings_version')}
                </TText>
                <TText color="$color6" fontFamily={fontFamily.mono as any} fontSize={fontSize.md}>
                  {AppVersion}
                </TText>
              </XStack>
            </Row>
            {ABOUT_LINKS.map(item => (
              <TouchableOpacity key={item.key} activeOpacity={0.6} onPress={item.onPress}>
                <Row>
                  <XStack alignItems="center" gap={12}>
                    <TText flex={1} color="$textDefault" fontSize={fontSize.lg}>
                      {t(item.key)}
                    </TText>
                    <ExternalLink size={iconSize.sm} color={theme.color9?.val as string} />
                  </XStack>
                </Row>
              </TouchableOpacity>
            ))}
          </RowGroup>
        </YStack>
      </YStack>
    </Screen>
  );
}
