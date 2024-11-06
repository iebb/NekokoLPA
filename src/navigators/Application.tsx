import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {NavigationContainer, NavigationContainerRef} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useTheme} from '@/theme';
import type {RootStackParamList} from '@/navigators/navigation';
import ErrorToast from "@/components/common/ErrorToast";
import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/reduxDataStore";
import {Linking, ScrollView} from "react-native";
import {LPACode} from "@/components/utils/lpaRegex";
import {Main, Profile, Scanner, Stats} from '@/screens';
import Title from "@/components/common/Title";
import Container from "@/components/common/Container";
import {ProfileStats} from "@/components/stats/ProfileStats";
import {SafeScreen} from "@/components/template";

const Stack = createStackNavigator<RootStackParamList>();


function ApplicationNavigator() {
	const { variant } = useTheme();
	const {currentEuicc} = useSelector((state: RootState) => state.LPA);
	const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

	const processUrl = (url: string) => {
		if (url) {
			const match = url.match(LPACode);
			if (match && match[0].length) {
				console.log("App Link Matched: URL", url);
				navigationRef.current?.navigate('Scanner', {
					appLink: url,
				});
			}
		}
	}

	useEffect(() => {
		if (navigationRef) {
			Linking.addEventListener('url', ({url}) => processUrl(url));
			const getUrlAsync = async () => {
				try {
					const linkUrl = await Linking.getInitialURL();
					if (linkUrl) {
						processUrl(linkUrl);
					}
				} catch (e) {}
			};
			getUrlAsync();
		}
	}, [navigationRef]);

	return (
		<SafeAreaProvider style={{ backgroundColor: "transparent" }}>
			{/*<SafeScreen>*/}
			{/*	<Container>*/}
			{/*		<ScrollView>*/}
			{/*			<ProfileStats />*/}
			{/*		</ScrollView>*/}
			{/*	</Container>*/}
			{/*</SafeScreen>*/}
			<NavigationContainer ref={navigationRef}>
				<Stack.Navigator
					key={variant}
					screenOptions={{ headerShown: false }}
				>
					<Stack.Screen
						name="Main"
						component={Main}
					/>
					<Stack.Screen
						name="Scanner"
						component={Scanner}
						options={TransitionPresets.SlideFromRightIOS}
					/>
					<Stack.Screen
						name="Profile"
						component={Profile}
						options={TransitionPresets.SlideFromRightIOS}
					/>
					<Stack.Screen
						name="Stats"
						component={Stats}
						options={TransitionPresets.SlideFromRightIOS}
					/>
				</Stack.Navigator>
				<ErrorToast eUICC={currentEuicc} />
			</NavigationContainer>
		</SafeAreaProvider>
	);
}

export default ApplicationNavigator;
