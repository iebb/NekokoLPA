import React, {useEffect, useState, useMemo, useCallback} from 'react';
import SafeScreen from '@/theme/SafeScreen';
import {Button, Colors, Text, View} from "react-native-ui-lib";
import SIMSelector from "@/screens/Main/SIMSelector";
import type {RootScreenProps} from "@/screens/navigation";
import {Image, Linking, PixelRatio, Platform, TouchableOpacity} from "react-native";
import {version} from '../../../package.json';
import {useDispatch} from "react-redux";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faCog, faFlag, faRefresh} from "@fortawesome/free-solid-svg-icons";
import {setupDevices} from "@/native/setup";
import {AppCheckForUpdates, AppLogo, AppTitle} from "@/screens/Main/config";
import { faBluetoothB } from '@fortawesome/free-brands-svg-icons';

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
}) => (
  <View row flexG>
    <View row gap-5 flexG>
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Image source={AppLogo} style={{width: 42, height: 42}} />
      </TouchableOpacity>
      <View onTouchStart={onUpdatePress}>
        <Text style={{fontSize: 16 / PixelRatio.getFontScale(), fontWeight: 'bold'}} $textDefault>
          {AppTitle}
        </Text>
        <Text style={{
          fontSize: 12 / PixelRatio.getFontScale(),
          color: isLatest ? Colors.$textNeutralLight : Colors.red40
        }}>
          v{version} {!isLatest && "↑"}
        </Text>
        {!isLatest && (
          <Text style={{
            fontSize: 12 / PixelRatio.getFontScale(),
            color: isLatest ? Colors.$textNeutralLight : Colors.red40
          }}>
            {release.tag_name} available
          </Text>
        )}
      </View>
    </View>
  </View>
));

const ActionButtons = React.memo(({ 
  navigation, 
  onRefresh 
}: { 
  navigation: any; 
  onRefresh: () => void; 
}) => (
  <View row gap-10>
    <Button
      size={'small'}
      padding-10
      iconSource={style => (
        <FontAwesomeIcon 
          icon={faBluetoothB as any} 
          style={{color: (style as any)[0].tintColor}}
        />
      )}
      onPress={() => navigation.navigate('BluetoothScan', {})}
      iconOnRight
      animateLayout
      animateTo={'left'}
    />
    <Button
      size={'small'}
      padding-10
      iconSource={style => (
        <FontAwesomeIcon 
          icon={faRefresh} 
          style={{color: (style as any)[0].tintColor}}
        />
      )}
      onPress={onRefresh}
      iconOnRight
      animateLayout
      animateTo={'left'}
    />
    <Button
      size={'small'}
      padding-10
      iconSource={style => (
        <FontAwesomeIcon 
          icon={faCog} 
          style={{color: (style as any)[0].tintColor}}
        />
      )}
      onPress={() => navigation.navigate('Settings', {})}
      iconOnRight
      animateLayout
      animateTo={'left'}
    />
  </View>
));

function Main({ navigation }: RootScreenProps<'Main'>) {
	const dispatch = useDispatch();
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
			<View paddingH-24 marginT-12>
				<View style={{flexDirection: 'column', display: 'flex', height: '100%', gap: 10}}>
					<View row>
						<AppHeader 
							navigation={navigation} 
							isLatest={isLatest} 
							release={release} 
							onUpdatePress={handleUpdatePress}
						/>
						<ActionButtons navigation={navigation} onRefresh={handleRefresh} />
					</View>
					<SIMSelector/>
				</View>
			</View>
		</SafeScreen>
	);
}

export default Main;
