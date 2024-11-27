import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import SafeScreen from '@/theme/SafeScreen';
import CatImage from '@/assets/images/shiroya.png';
import {Button, Colors, Text, View} from "react-native-ui-lib";
import SIMSelector from "@/screens/Main/SIMSelector";
import type {RootScreenProps} from "@/screens/navigation";
import {Image, Linking, PixelRatio, Platform, TouchableOpacity} from "react-native";
import {version} from '../../../package.json';
import {useDispatch} from "react-redux";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faCog, faFlag, faRefresh} from "@fortawesome/free-solid-svg-icons";
import {setupDevices} from "@/native/Hybrid";

function Main({ navigation }: RootScreenProps<'Main'>) {
	const { t } = useTranslation(['welcome', 'main']);

	const dispatch = useDispatch();
	const [release, setRelease] = useState({
		tag_name: `v${version}`,
	});



	useEffect(() => {
		if (Platform.OS === 'android') {
			try {
				fetch('https://api.github.com/repos/iebb/NekokoLPA/releases/latest').then(
					r => r.json()
				).then(
					data => setRelease(data)
				)
			} catch (e) {

			}
		}
	}, []);

	const getBuild = (e: string) => {
		try {
			const s = e.split(".");
			return Number(s[s.length - 1]);
		} catch (e) {
			return version;
		}
	}
	const isLatest = getBuild(release.tag_name) <= getBuild(version);

	return (
		<SafeScreen>
			<View
				paddingH-24
				marginT-12
			>
				<View style={{flexDirection: 'column', display: 'flex', height: '100%', gap: 10}}>
					<View row>
						<View row gap-5 flexG>
							<TouchableOpacity>
								<Image
									source={CatImage}
									style={{ width: 40, height: 40 }}
								/>
							</TouchableOpacity>
							<View onTouchStart={() => {
								if (Platform.OS === 'android' && !isLatest) {
									try {
										// @ts-ignore
										Linking.openURL(release.assets[0].browser_download_url);
									} finally {

									}
								}
							}}>
								<Text style={{fontSize: 16 / PixelRatio.getFontScale(), fontWeight: 'bold'}} $textDefault >
									{t('welcome:title')}
								</Text>
								<Text style={{ fontSize: 12 / PixelRatio.getFontScale() , color: isLatest ? Colors.$textNeutralLight : Colors.red40 }}>
									v{version} {!isLatest && "↑"}
								</Text>
								{
									!isLatest && (
										<Text style={{ fontSize: 12 / PixelRatio.getFontScale() , color: isLatest ? Colors.$textNeutralLight : Colors.red40 }}>
											{release.tag_name} available
										</Text>
									)
								}
							</View>
						</View>
						<View row gap-10>
							<Button
								size={'small'}
								padding-10
								iconSource={
									style => <FontAwesomeIcon icon={faFlag} style={{ color: style[0].tintColor }} />
								}
								onPress={() => {
									navigation.navigate('Stats', {
									});
								}}
								iconOnRight
								animateLayout
								animateTo={'left'}
							/>
							<Button
								size={'small'}
								padding-10
								iconSource={
									style => <FontAwesomeIcon icon={faRefresh}  style={{ color: style[0].tintColor }} />
								}
								onPress={() => {
									setupDevices(dispatch, t).then(r => r);
								}}
								iconOnRight
								animateLayout
								animateTo={'left'}
							/>
							<Button
							size={'small'}
							padding-10
							iconSource={
								style => <FontAwesomeIcon icon={faCog}  style={{ color: style[0].tintColor }} />
							}
							onPress={() => {
								navigation.navigate('Settings', {
								});
							}}
							iconOnRight
							animateLayout
							animateTo={'left'}
						/>
						</View>
					</View>
					<SIMSelector />
				</View>
			</View>
		</SafeScreen>
	);
}

export default Main;
