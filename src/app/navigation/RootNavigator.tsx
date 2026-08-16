import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {
  NavigationContainer,
  NavigationContainerRef,
  DefaultTheme,
  DarkTheme,
  Theme as NavTheme,
} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import type {RootStackParamList} from '@/app/navigation/types';
import React from 'react';
import EuiccInfo from '@/features/euicc/EuiccInfoScreen';
import Main from '@/features/main/MainScreen';
import Scanner from '@/features/download/DownloadScreen';
import Profile from '@/features/profile/ProfileScreen';
import Settings from '@/features/settings/SettingsScreen';
import Index from '@/features/stats/StatsScreen';
import Notifications from '@/features/notifications/NotificationsScreen';
import LeftSidebarDrawer from '@/app/navigation/DrawerContent';
import {useTheme} from 'tamagui';
import {ToastProvider} from '@/app/providers/ToastProvider';
import BluetoothScan from '@/features/bluetooth/BluetoothScreen';
import {LoadingProvider} from '@/app/providers/LoadingProvider';

/**
 * react-native-screens' native component views do not resolve on Mac
 * Catalyst: RN falls back to a plain RCTView and then crashes applying
 * RNSScreen props to it ("-[RCTView setSheetLargestUndimmedDetent:]:
 * unrecognized selector"). The JS stack and drawer work without native
 * screens — they just lose the native-screen optimisation — so turn them
 * off there. iOS, Android and tvOS keep native screens.
 */
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
      }}>
      <Stack.Screen name="Main" component={Main} />
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
      <Stack.Screen name="Stats" component={Index} options={TransitionPresets.SlideFromRightIOS} />
      <Stack.Screen
        name="EuiccInfo"
        component={EuiccInfo}
        options={TransitionPresets.SlideFromRightIOS}
      />
      <Stack.Screen
        name="Notifications"
        component={Notifications}
        options={TransitionPresets.SlideFromRightIOS}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={TransitionPresets.SlideFromRightIOS}
      />
      <Stack.Screen
        name="BluetoothScan"
        component={BluetoothScan}
        options={TransitionPresets.SlideFromRightIOS}
      />
    </Stack.Navigator>
  );
}
function ApplicationNavigator() {
  const tamaguiTheme = useTheme();
  const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

  const navTheme: NavTheme = {
    ...(tamaguiTheme.color?.val ? DarkTheme : DefaultTheme),
    colors: {
      ...(tamaguiTheme.color?.val ? DarkTheme : DefaultTheme).colors,
      background: tamaguiTheme.background?.val,
      card: tamaguiTheme.background?.val,
      border:
        tamaguiTheme.borderColor?.val ||
        (tamaguiTheme.color?.val ? DarkTheme : DefaultTheme).colors.border,
      text:
        tamaguiTheme.textDefault?.val ||
        (tamaguiTheme.color?.val ? DarkTheme : DefaultTheme).colors.text,
      primary:
        tamaguiTheme.primaryColor?.val ||
        (tamaguiTheme.color?.val ? DarkTheme : DefaultTheme).colors.primary,
    },
  };

  return (
    <SafeAreaProvider style={{backgroundColor: tamaguiTheme.background?.val}}>
      <NavigationContainer theme={navTheme} ref={navigationRef}>
        <ToastProvider>
          <LoadingProvider>
            <Drawer.Navigator
              drawerContent={props => <LeftSidebarDrawer {...props} />}
              screenOptions={{
                headerShown: false,
                swipeEnabled: false,
                drawerStyle: {
                  maxWidth: '67%',
                  width: 250,
                  backgroundColor: tamaguiTheme.background?.val,
                  borderTopRightRadius: 0,
                },
              }}>
              <Drawer.Screen name="Stack" component={StackNavigator} />
            </Drawer.Navigator>
          </LoadingProvider>
        </ToastProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default ApplicationNavigator;
