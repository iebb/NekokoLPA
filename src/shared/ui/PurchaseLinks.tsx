import React from 'react';
import {Linking} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text as TText, XStack} from 'tamagui';

import {
  AppBuyLink,
  AppBuyLinkEsimData,
  DisplayGithubLink,
  GithubLink,
  NekokoLPA2Link,
} from '@/shared/config/app';
import {fontSize} from '@/shared/theme/tokens';

/**
 * Footer links: buy a device, buy eSIM data, and the source repository.
 *
 * These sat behind the side menu, which is gone, and as large underlined
 * accent text, which made a secondary link the loudest thing under an empty
 * list. They are footnotes to the profile list now — grey, lower-case, laid
 * out in a row — so they are findable without competing with the profiles.
 * They stay secondary through colour and case, not through size: set small
 * enough to be unreadable they stop being links anyone can use.
 *
 * The eSIM-data link and the GitHub link are per-variant, hence the guards.
 */
export default function PurchaseLinks({topMargin = 24}: {topMargin?: number}) {
  const {t} = useTranslation(['main']);
  // Copied to a local so TypeScript can narrow it inside the onPress closure.
  const esimDataLink = AppBuyLinkEsimData;

  const link = (label: string, onPress: () => void) => (
    <TText
      key={label}
      color="$color9"
      fontSize={fontSize.lg}
      textDecorationLine="underline"
      onPress={onPress}>
      {label.toLowerCase()}
    </TText>
  );

  const links = [
    link(t('main:purchase_note'), () => Linking.openURL(AppBuyLink)),
    ...(esimDataLink ? [link(t('main:buy_esim_data'), () => Linking.openURL(esimDataLink))] : []),
    ...(DisplayGithubLink && GithubLink
      ? [link(t('main:github'), () => Linking.openURL(GithubLink))]
      : []),
    link(t('main:nekokolpa2'), () => Linking.openURL(NekokoLPA2Link)),
  ];

  return (
    <XStack
      flexWrap="wrap"
      justifyContent="center"
      alignItems="center"
      columnGap={18}
      rowGap={6}
      marginTop={topMargin}
      paddingBottom={20}>
      {links}
    </XStack>
  );
}
