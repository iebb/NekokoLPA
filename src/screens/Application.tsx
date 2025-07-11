import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer, NavigationContainerRef} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useAppTheme} from '@/theme/context';
import type {RootStackParamList} from '@/screens/navigation';
import React from "react";
import EuiccInfo from "@/screens/EuiccInfo";
import Main from "@/screens/Main";
import Scanner from "@/screens/Download";
import Profile from "@/screens/Profile";
import Settings from "@/screens/Settings/Settings";
import Index from "@/screens/Stats";
import Notifications from "@/screens/Notifications";
import LeftSidebarDrawer from "@/screens/Drawer";
import {Colors} from 'react-native-ui-lib';
import {ToastProvider} from "@/components/common/ToastProvider";
import BluetoothScan from "@/screens/Bluetooth";
import {LoadingProvider} from "@/components/common/LoadingProvider";
import Backup from "@/screens/Backup";

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

function StackNavigator() {
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="Main" component={Main} />
			<Stack.Screen name="Scanner" component={Scanner} options={TransitionPresets.SlideFromRightIOS} />
			<Stack.Screen name="Profile" component={Profile} options={TransitionPresets.SlideFromRightIOS} />
			<Stack.Screen name="Stats" component={Index} options={TransitionPresets.SlideFromRightIOS} />
			<Stack.Screen name="EuiccInfo" component={EuiccInfo} options={TransitionPresets.SlideFromRightIOS} />
			<Stack.Screen name="Notifications" component={Notifications} options={TransitionPresets.SlideFromRightIOS} />
			<Stack.Screen name="Settings" component={Settings} options={TransitionPresets.SlideFromRightIOS} />
			<Stack.Screen name="Backup" component={Backup} options={TransitionPresets.SlideFromRightIOS} />
			<Stack.Screen name="BluetoothScan" component={BluetoothScan} options={TransitionPresets.SlideFromRightIOS} />
		</Stack.Navigator>
	)
}
function ApplicationNavigator() {
	const { theme, themeColor } = useAppTheme();
	const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

	return (
		<SafeAreaProvider key={theme + "_" + themeColor}>
			<NavigationContainer ref={navigationRef}>
				<ToastProvider>
					<LoadingProvider>
						<Drawer.Navigator
							drawerContent={(props) => <LeftSidebarDrawer {...props} />}
							screenOptions={{
								headerShown: false,
								swipeEnabled: false,
								drawerStyle: {
									maxWidth: '67%',
									width: 250,
									backgroundColor: Colors.pageBackground,
									borderTopRightRadius: 0,
								},
							}}
						>
							<Drawer.Screen name="Stack" component={StackNavigator} />
						</Drawer.Navigator>
					</LoadingProvider>
				</ToastProvider>
			</NavigationContainer>
		</SafeAreaProvider>
	);
}

export default ApplicationNavigator;
