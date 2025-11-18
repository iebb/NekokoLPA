import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer, NavigationContainerRef, DefaultTheme, DarkTheme, Theme as NavTheme} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
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
import {useTheme} from 'tamagui';
import {ToastProvider} from "@/components/common/ToastProvider";
import BluetoothScan from "@/screens/Bluetooth";
import {LoadingProvider} from "@/components/common/LoadingProvider";
import Backup from "@/screens/Backup";

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

function StackNavigator() {
    const theme = useTheme();
	return (
		<Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: {
                    backgroundColor: theme.background?.val,
                },
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
	const tamaguiTheme = useTheme();
	const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

	const navTheme: NavTheme = {
		...(tamaguiTheme.color?.val ? DarkTheme : DefaultTheme),
		colors: {
			...((tamaguiTheme.color?.val ? DarkTheme : DefaultTheme).colors),
			background: tamaguiTheme.background?.val || '#000',
			card: tamaguiTheme.background?.val || '#000',
			border: tamaguiTheme.borderColor?.val || ((tamaguiTheme.color?.val ? DarkTheme : DefaultTheme).colors.border),
			text: tamaguiTheme.textDefault?.val || ((tamaguiTheme.color?.val ? DarkTheme : DefaultTheme).colors.text),
			primary: tamaguiTheme.primaryColor?.val || ((tamaguiTheme.color?.val ? DarkTheme : DefaultTheme).colors.primary),
		},
	};

	return (
		<SafeAreaProvider style={{ backgroundColor: tamaguiTheme.background?.val || '#000' }}>
			<NavigationContainer theme={navTheme} ref={navigationRef}>
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
									backgroundColor: tamaguiTheme.background?.val || '#fff',
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
