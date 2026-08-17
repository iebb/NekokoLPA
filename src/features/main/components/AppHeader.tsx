import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Linking, Platform, TouchableOpacity} from 'react-native';
import {Text as TText, useTheme, XStack, YStack} from 'tamagui';

import {AppCheckForUpdates, AppTitle, AppVersion} from '@/shared/config/app';
import {fontFamily, fontSize, tracking} from '@/shared/theme/tokens';

/**
 * The app-name lockup in the home header.
 *
 * No logo mark: the design gives the header a single line of identity and
 * spends the rest of the strip on controls, so a 42px icon next to a 17px
 * title was the loudest thing on a screen that is meant to be about the card.
 * The version sits under it in mono, tertiary — it is a diagnostic detail, and
 * the only time it should draw the eye is when an update is available.
 */
export default function AppHeader({navigation}: {navigation: any}) {
  const theme = useTheme();
  const [release, setRelease] = useState({tag_name: `v${AppVersion}`});

  const isLatest = useMemo(() => {
    const getBuild = (versionStr: string) => {
      try {
        const s = versionStr.split('.');
        return Number(s[s.length - 1]);
      } catch (e) {
        return AppVersion;
      }
    };
    return getBuild(release.tag_name) <= getBuild(AppVersion);
  }, [release.tag_name]);

  const handlePress = useCallback(() => {
    if (Platform.OS === 'android' && !isLatest && (release as any).assets) {
      try {
        // @ts-ignore
        Linking.openURL(release.assets[0].browser_download_url);
      } catch (e) {
        // Handle error silently
      }
    } else {
      navigation.openDrawer?.();
    }
  }, [isLatest, release, navigation]);

  useEffect(() => {
    if (AppCheckForUpdates && Platform.OS === 'android') {
      const fetchLatestRelease = async () => {
        try {
          const response = await fetch(
            'https://api.github.com/repos/iebb/NekokoLPA/releases/latest',
          );
          const data = await response.json();
          setRelease(data);
        } catch (e) {
          // Handle error silently
        }
      };
      fetchLatestRelease();
    }
  }, []);

  return (
    <TouchableOpacity onPress={handlePress} style={{flexShrink: 1}}>
      <YStack gap={3}>
        <TText
          color="$textDefault"
          fontSize={fontSize.xxl}
          fontWeight={'600' as any}
          letterSpacing={tracking.title}
          numberOfLines={1}>
          {AppTitle}
        </TText>
        <XStack alignItems="center" gap={6}>
          <TText
            color={isLatest ? '$color9' : theme.backgroundDangerHeavy?.val}
            fontFamily={fontFamily.mono as any}
            fontSize={fontSize.xs}>
            v{AppVersion}
          </TText>
          {!isLatest && (
            <TText color={theme.backgroundDangerHeavy?.val} fontSize={fontSize.xs}>
              {release.tag_name} available
            </TText>
          )}
        </XStack>
      </YStack>
    </TouchableOpacity>
  );
}
