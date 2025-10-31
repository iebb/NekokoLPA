import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Linking, PixelRatio, Platform, TouchableOpacity } from 'react-native';
import { Text as TText, useTheme, XStack } from 'tamagui';
import { version } from '../../../../package.json';
import { AppCheckForUpdates, AppLogo, AppTitle } from '@/screens/Main/config';

export default function AppHeader({ navigation }: {
  navigation: any;
}) {
  const theme = useTheme();
  const [release, setRelease] = useState({
    tag_name: `v${version}`,
  });

  // Memoize version comparison logic
  const isLatest = useMemo(() => {
    const getBuild = (versionStr: string) => {
      try {
        const s = versionStr.split(".");
        return Number(s[s.length - 1]);
      } catch (e) {
        return version;
      }
    };
    return getBuild(release.tag_name) <= getBuild(version);
  }, [release.tag_name]);

  // Memoize update press handler
  const handleUpdatePress = useCallback(() => {
    if (Platform.OS === 'android' && !isLatest && (release as any).assets) {
      try {
        // @ts-ignore
        Linking.openURL(release.assets[0].browser_download_url);
      } catch (e) {
        // Handle error silently
      }
    }
  }, [isLatest, release]);

  // Fetch latest release on mount
  useEffect(() => {
    if (AppCheckForUpdates && Platform.OS === 'android') {
      const fetchLatestRelease = async () => {
        try {
          const response = await fetch('https://api.github.com/repos/iebb/NekokoLPA/releases/latest');
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
    <XStack alignItems="center" gap={10} flex={1}>
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Image source={AppLogo} style={{width: 42, height: 42}} />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleUpdatePress} style={{flexShrink: 1}}>
        <TText fontSize={16 / PixelRatio.getFontScale()} fontWeight={'700' as any} color="$textDefault" numberOfLines={1}>
          {AppTitle}
        </TText>
        <TText fontSize={12 / PixelRatio.getFontScale()} color={isLatest ? (theme.color10?.val || '#999') : (theme.backgroundDangerHeavy?.val || '#d33')}>
          v{version} {!isLatest && '↑'}
        </TText>
        {!isLatest && (
          <TText fontSize={12 / PixelRatio.getFontScale()} color={theme.backgroundDangerHeavy?.val || '#d33'}>
            {release.tag_name} available
          </TText>
        )}
      </TouchableOpacity>
    </XStack>
  );
}
