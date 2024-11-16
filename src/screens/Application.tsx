import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {NavigationContainer, NavigationContainerRef} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useTheme} from '@/theme';
import type {RootStackParamList} from '@/screens/navigation';
import React, {useEffect} from "react";
import {Linking} from "react-native";
import {LPACode} from "@/components/utils/lpaRegex";
import EuiccInfo from "@/screens/EuiccInfo";
import Main from "@/screens/Main";
import Scanner from "@/screens/Download";
import Profile from "@/screens/Profile";
import Settings from "@/screens/Settings/Settings";
import Stats from "@/screens/Stats/Stats";
import Notifications from "@/screens/Notifications";

const Stack = createStackNavigator<RootStackParamList>();


function ApplicationNavigator() {
	const { variant } = useTheme();
	const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

	const processUrl = (url: string) => {
		if (url) {
			const match = url.match(LPACode);
			if (match && match[0].length) {
				console.log("App Link Matched: URL", url);
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
		<SafeAreaProvider>
			<NavigationContainer ref={navigationRef}>
				<Stack.Navigator
					key={variant}
					screenOptions={{ headerShown: false }}
				>
					<Stack.Screen name="Main" component={Main} />
					<Stack.Screen name="Scanner" component={Scanner} options={TransitionPresets.SlideFromRightIOS} />
					<Stack.Screen name="Profile" component={Profile} options={TransitionPresets.SlideFromRightIOS} />
					<Stack.Screen name="Stats" component={Stats} options={TransitionPresets.SlideFromRightIOS} />
					<Stack.Screen name="Settings" component={Settings} options={TransitionPresets.SlideFromRightIOS} />
					<Stack.Screen name="EuiccInfo" component={EuiccInfo} options={TransitionPresets.SlideFromRightIOS} />
					<Stack.Screen name="Notifications" component={Notifications} options={TransitionPresets.SlideFromRightIOS} />
				</Stack.Navigator>
			</NavigationContainer>
		</SafeAreaProvider>
	);
}

export default ApplicationNavigator;
