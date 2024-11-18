import React, {useEffect, useState} from 'react';
import i18next from 'i18next';
import {useTranslation} from 'react-i18next';
import {SafeScreen} from '@/components/template';
import {useTheme} from '@/theme';
import CatImage from '@/theme/assets/images/shiroya.png';
import {Button, Text, View} from "react-native-ui-lib";
import SIMSelector from "@/screens/Main/MainUI/SIMSelector";
import type {RootScreenProps} from "@/screens/navigation";
import {Image, Linking, PixelRatio, Platform, TouchableOpacity} from "react-native";
import {version} from '../../../package.json';
import {useDispatch, useSelector} from "react-redux";
import {nextValue, selectAppConfig} from "@/redux/configStore";
import type {Variant} from "@/types/theme/config";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faCog, faFlag, faLanguage, faMoon, faRefresh} from "@fortawesome/free-solid-svg-icons";
import {setupDevices} from "@/native/Hybrid";

const DEBUG_REPORTING_URL = "https://nlpa-data.nekoko.ee/api/debug/log";

function Main({ navigation }: RootScreenProps<'Main'>) {
	const { t } = useTranslation(['welcome']);

	const {
		colors,
		changeTheme,
		gutters,
		fonts,
	} = useTheme();

	const dispatch = useDispatch();
	const { language, theme } = useSelector(selectAppConfig);
	const [release, setRelease] = useState({
		tag_name: `v${version}`,
	});

	useEffect(() => {
		void i18next.changeLanguage(language);
	}, [language]);

	useEffect(() => {
		changeTheme(theme as Variant);
	}, [theme]);


	useEffect(() => {
		if (Platform.OS === 'android') {
			fetch('https://api.github.com/repos/iebb/NekokoLPA/releases/latest').then(
				r => r.json()
			).then(
				data => setRelease(data)
			)
		}
	}, [theme]);

	const getBuild = (e: string) => {
		const s = e.split(".");
		return Number(s[s.length - 1]);
	}
	const isLatest = getBuild(release.tag_name) <= getBuild(version);

	return (
		<SafeScreen>
			<View
				style={{
					...gutters.paddingHorizontal_24,
					...gutters.marginTop_12,
				}}
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
								<Text style={{fontSize: 16 / PixelRatio.getFontScale(), ...fonts.bold, ...fonts.gray800}} >
									{t('welcome:title')}
								</Text>
								<Text style={{ fontSize: 12 / PixelRatio.getFontScale() , color: isLatest ? colors.std200 : colors.red400 }}>
									v{version} {!isLatest && "↑"}
								</Text>
								{
									!isLatest && (
										<Text style={{ fontSize: 12 / PixelRatio.getFontScale() , color: isLatest ? colors.std200 : colors.green400 }}>
											{release.tag_name} available
										</Text>
									)
								}
							</View>
						</View>
						<View row gap-10>
							<Button
								size={'small'}
								style={{ padding: 10 }}
								iconSource={
									style => <FontAwesomeIcon icon={faRefresh} color={colors.std200} />
								}
								backgroundColor={colors.cardBackground}
								onPress={() => {
									setupDevices(dispatch).then(r => r);
								}}
								iconOnRight
								animateLayout
								animateTo={'left'}
							/>
						{/*	<Button*/}
						{/*	size={'small'}*/}
						{/*	style={{ padding: 10 }}*/}
						{/*	iconSource={*/}
						{/*		style => <FontAwesomeIcon icon={faCog} color={colors.std200} />*/}
						{/*	}*/}
						{/*	backgroundColor={colors.cardBackground}*/}
						{/*	onPress={() => {*/}
						{/*		navigation.navigate('Settings', {*/}
						{/*		});*/}
						{/*	}}*/}
						{/*	iconOnRight*/}
						{/*	animateLayout*/}
						{/*	animateTo={'left'}*/}
						{/*/>*/}
							<Button
								size={'small'}
								style={{ padding: 10 }}
								iconSource={
									style => <FontAwesomeIcon icon={faFlag} color={colors.std200} />
								}
								backgroundColor={colors.cardBackground}
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
								style={{ padding: 10 }}
								iconSource={
									style => <FontAwesomeIcon icon={faLanguage} color={colors.std200} />
								}
								backgroundColor={colors.cardBackground}
								onPress={() => {
									dispatch(nextValue('language'))
								}}
								iconOnRight
								animateLayout
								animateTo={'left'}
							/>
							<Button
								size={'small'}
								style={{ padding: 10 }}
								iconSource={
									style => <FontAwesomeIcon icon={faMoon} color={colors.std200} />
								}
								backgroundColor={colors.cardBackground}
								onPress={() => {
									dispatch(nextValue('theme'))
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
