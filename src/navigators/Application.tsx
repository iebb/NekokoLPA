import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {NekokoLPA, Profile, Scanner, Startup} from '@/screens';
import {useTheme} from '@/theme';

import type {RootStackParamList} from '@/navigators/navigation';
import ErrorToast from "@/components/ErrorToast";
import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/reduxDataStore";
import InfiLPA from "@/native/InfiLPA";

const Stack = createStackNavigator<RootStackParamList>();

function ApplicationNavigator() {
	const { variant, navigationTheme } = useTheme();
	const {currentEuicc} = useSelector((state: RootState) => state.LPA);


	useEffect(() => {
		InfiLPA.refreshEUICC();
	}, []);


	return (
		<SafeAreaProvider style={{ backgroundColor: "transparent" }}>
			<NavigationContainer theme={navigationTheme}>
				<Stack.Navigator key={variant} screenOptions={{ headerShown: false }}>
					<Stack.Screen name="NekokoLPA" component={NekokoLPA} />
					<Stack.Screen name="Scanner" component={Scanner} />
					<Stack.Screen name="Profile" component={Profile} />
				</Stack.Navigator>
				<ErrorToast eUICC={currentEuicc} />
			</NavigationContainer>
		</SafeAreaProvider>
	);
}

export default ApplicationNavigator;
