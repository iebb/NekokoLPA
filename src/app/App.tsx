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
import React, {useEffect, useMemo, useState} from 'react';
import {useTheme, Theme} from 'tamagui';
import {createTamaguiConfigWithColor} from '../../tamagui.config';
import {preferences} from '@/shared/storage';
import MaterialYou from 'react-native-material-you-colors';
import {isSimplifiedMode} from '@/shared/config/features';
import {
  DEFAULT_THEME_COLOR,
  MATERIAL_YOU,
  migrateLegacyDefaultColor,
} from '@/shared/theme/presetColors';

// @react-navigation/stack still calls InteractionManager from its Card view,
// which RN 0.83 deprecated, so every launch raises a LogBox warning we cannot
// act on. It is still there in the latest 7.10.x, so this is not something a
// version bump fixes. Drop this line once react-navigation stops using it.
LogBox.ignoreLogs(['InteractionManager has been deprecated']);

const getThemeColor = () => {
  if (isSimplifiedMode()) return DEFAULT_THEME_COLOR;
  // A stored accent beats the default, so an install that never picked a colour
  // would keep the pre-redesign purple forever. Clear that one value — and only
  // that value — so the redesign's azure applies.
  const stored = migrateLegacyDefaultColor(preferences.getString('themeColor'));
  if (stored === undefined && preferences.getString('themeColor')) {
    preferences.remove('themeColor');
  }
  const themeColor = stored || DEFAULT_THEME_COLOR;
  if (themeColor === MATERIAL_YOU && Platform.OS === 'android') {
    const palette = MaterialYou.getMaterialYouPalette();
    return palette?.system_accent1[7] || DEFAULT_THEME_COLOR;
  }
  return themeColor;
};

function App() {
  // The config is state, not a module constant. Built once at import time it
  // could never change without relaunching the app, which is why the setting
  // was labelled "restart to take effect". Rebuilding it when `themeColor`
  // changes makes the accent apply as soon as it is picked.
  const [themeColor, setThemeColor] = useState(getThemeColor);

  useEffect(() => {
    const listener = preferences.addOnValueChangedListener(key => {
      if (key === 'themeColor') {
        setThemeColor(getThemeColor());
      }
    });
    return () => listener.remove();
  }, []);

  const config = useMemo(() => createTamaguiConfigWithColor(themeColor), [themeColor]);

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
