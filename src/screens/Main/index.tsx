import React, {useEffect, useState, useMemo, useCallback} from 'react';
import SafeScreen from '@/theme/SafeScreen';
import PageContainer from '@/components/common/PageContainer';
import { View, Image, Linking, PixelRatio, Platform, TouchableOpacity } from "react-native";
import SIMSelector from "@/screens/Main/SIMSelector";
import type {RootScreenProps} from "@/screens/navigation";
import {version} from '../../../package.json';
import {useDispatch} from "react-redux";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faCog, faFlag, faRefresh} from "@fortawesome/free-solid-svg-icons";
import {setupDevices} from "@/native/setup";
import {AppCheckForUpdates, AppLogo, AppTitle} from "@/screens/Main/config";
import { faBluetoothB } from '@fortawesome/free-brands-svg-icons';
import { XStack, YStack, Text as TText, useTheme } from 'tamagui';

// Extracted components
const AppHeader = React.memo(({ 
  navigation, 
  isLatest, 
  release, 
  onUpdatePress 
}: { 
  navigation: any; 
  isLatest: boolean; 
  release: any; 
  onUpdatePress: () => void; 
}) => {
  const theme = useTheme();
  return (
    <XStack alignItems="center" gap={10} flex={1}>
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Image source={AppLogo} style={{width: 42, height: 42}} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onUpdatePress} style={{flexShrink: 1}}>
        <TText fontSize={16 / PixelRatio.getFontScale()} fontWeight={'700' as any} color="$textDefault" numberOfLines={1}>
          {AppTitle}
        </TText>
        <TText fontSize={12 / PixelRatio.getFontScale()} color={isLatest ? (theme.color10?.val || '#999') : (theme.backgroundDangerHeavy?.val || '#d33')}>
          v{version} {!isLatest && "↑"}
        </TText>
        {!isLatest && (
          <TText fontSize={12 / PixelRatio.getFontScale()} color={theme.backgroundDangerHeavy?.val || '#d33'}>
            {release.tag_name} available
          </TText>
        )}
      </TouchableOpacity>
    </XStack>
  );
});

function ActionButtons({ 
  navigation, 
  onRefresh 
}: { 
  navigation: any; 
  onRefresh: () => void; 
}) {
  const theme = useTheme();
  const Btn = ({ icon, onPress }: { icon: any; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18, // Circular button - keep as is
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.accentColor?.val,
        backgroundColor: theme.accentColor?.val,
      }}
    >
      <FontAwesomeIcon icon={icon} style={{ color: theme.background?.val }} />
    </TouchableOpacity>
  );

  return (
    <XStack alignItems="center" gap={10}>
      <Btn icon={faBluetoothB as any} onPress={() => navigation.navigate('BluetoothScan', {})} />
      <Btn icon={faRefresh} onPress={onRefresh} />
      <Btn icon={faCog} onPress={() => navigation.navigate('Settings', {})} />
    </XStack>
  );
}

function Main({ navigation }: RootScreenProps<'Main'>) {
	const dispatch = useDispatch();
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

	// Memoize refresh handler
	const handleRefresh = useCallback(async () => {
		try {
			await setupDevices(dispatch);
		} catch (e) {
			// Handle error silently
		}
	}, [dispatch]);

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
		<SafeScreen>
			<PageContainer horizontalPadding={24} keyboardAvoiding={false} scrollViewProps={{ scrollEnabled: false }}>
				<YStack gap={10} flex={1} marginTop={12}>
					<XStack alignItems="center" justifyContent="space-between">
						<AppHeader 
							navigation={navigation} 
							isLatest={isLatest} 
							release={release} 
							onUpdatePress={handleUpdatePress}
						/>
						<ActionButtons navigation={navigation} onRefresh={handleRefresh} />
					</XStack>
					<View style={{ flex: 1 }}>
						<SIMSelector/>
					</View>
				</YStack>
			</PageContainer>
		</SafeScreen>
	);
}

export default Main;
