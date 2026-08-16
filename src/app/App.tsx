import 'react-native-gesture-handler';
import {ThemeProvider, useColorScheme} from '@/app/providers/ThemeProvider';
import '@/i18n';
import {DeviceListener} from '@/lpa/DeviceListener';
import {store} from '@/store';
import {Provider} from 'react-redux';
import ApplicationNavigator from '@/app/navigation/RootNavigator';
import {TamaguiProvider} from '@tamagui/core';
import {KeyboardAvoidingView, LogBox, Platform} from 'react-native';
import {PortalProvider} from '@tamagui/portal';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import React from 'react';
import {useTheme, Theme} from 'tamagui';
import {createTamaguiConfigWithColor} from '../../tamagui.config';
import {preferences} from '@/shared/storage';
import MaterialYou from 'react-native-material-you-colors';
import {isSimplifiedMode} from '@/shared/config/features';

// @react-navigation/stack still calls InteractionManager from its Card view,
// which RN 0.83 deprecated, so every launch raises a LogBox warning we cannot
// act on. It is still there in the latest 7.10.x, so this is not something a
// version bump fixes. Drop this line once react-navigation stops using it.
LogBox.ignoreLogs(['InteractionManager has been deprecated']);

const getThemeColor = () => {
  if (isSimplifiedMode()) return '#813ff3';
  const themeColor = preferences.getString('themeColor') || '#813ff3';
  if (themeColor === 'my' && Platform.OS === 'android') {
    const palette = MaterialYou.getMaterialYouPalette();
    return palette?.system_accent1[7] || '#813ff3';
  }
  return themeColor;
};

const config = createTamaguiConfigWithColor(getThemeColor());

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <TamaguiProvider config={config}>
          <ColorSchemeRoot />
        </TamaguiProvider>
      </ThemeProvider>
    </Provider>
  );
}

function ColorSchemeRoot() {
  const {scheme} = useColorScheme();
  return (
    <Theme name={scheme}>
      <ThemedRoot />
    </Theme>
  );
}

function ThemedRoot() {
  const theme = useTheme();
  const backgroundColor = theme.background?.val as string;
  return (
    <GestureHandlerRootView style={{flex: 1, backgroundColor}}>
      <KeyboardAvoidingView
        style={{flex: 1, backgroundColor}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <DeviceListener>
          <PortalProvider>
            <ApplicationNavigator />
          </PortalProvider>
        </DeviceListener>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

export default App;
