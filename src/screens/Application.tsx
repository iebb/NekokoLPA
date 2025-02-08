import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {NavigationContainer, NavigationContainerRef} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useAppTheme} from '@/theme/context';
import type {RootStackParamList} from '@/screens/navigation';
import React, {useEffect} from "react";
import {Linking} from "react-native";
import {LPACode} from "@/utils/lpaRegex";
import EuiccInfo from "@/screens/EuiccInfo";
import Main from "@/screens/Main";
import Scanner from "@/screens/Download";
import Profile from "@/screens/Profile";
import Settings from "@/screens/Settings/Settings";
import Stats from "@/screens/Stats/Stats";
import Notifications from "@/screens/Notifications";

const Stack = createStackNavigator<RootStackParamList>();


function ApplicationNavigator() {
	const { theme, themeColor } = useAppTheme();
	const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();
	return (
		<SafeAreaProvider key={theme + "_" + themeColor}>
			<NavigationContainer ref={navigationRef}>
				<Stack.Navigator
					screenOptions={{ headerShown: false }}
				>
					<Stack.Screen name="Main" component={Main} />
					<Stack.Screen name="Scanner" component={Scanner} options={TransitionPresets.SlideFromRightIOS} />
					<Stack.Screen name="Profile" component={Profile} options={TransitionPresets.SlideFromRightIOS} />
					<Stack.Screen name="Stats" component={Stats} options={TransitionPresets.SlideFromRightIOS} />
					<Stack.Screen name="EuiccInfo" component={EuiccInfo} options={TransitionPresets.SlideFromRightIOS} />
					<Stack.Screen name="Notifications" component={Notifications} options={TransitionPresets.SlideFromRightIOS} />
					<Stack.Screen name="Settings" component={Settings} options={TransitionPresets.SlideFromRightIOS} />
				</Stack.Navigator>
			</NavigationContainer>
		</SafeAreaProvider>
	);
}

export default ApplicationNavigator;
