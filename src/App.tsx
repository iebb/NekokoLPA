import "react-native-gesture-handler";
import {preferences} from "@/utils/mmkv";
import {ThemeProvider} from "@/theme/context";
import "./translations";
import {NativeListener} from "@/native/NativeListener";
import {store} from "@/redux/reduxDataStore";
import {Provider} from "react-redux";
import ApplicationNavigator from "@/screens/Application";
// Load Sentry only in development to avoid references in production builds
let Sentry: any;
if (__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Sentry = require('@sentry/react-native');
}
import { TamaguiProvider } from "@/theme/TamaguiProvider";
import { Appearance, KeyboardAvoidingView, Platform } from 'react-native';
import { PortalProvider } from '@tamagui/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppTheme } from '@/theme/context';


if (__DEV__ && Sentry) {
  Sentry.init({
    dsn: "https://eea742e6ac6d6908f6bc6c34e30fb88d@sentry.nekoko.it/2",
    // spotlight: __DEV__,
  });
}

function App() {
  const prefTheme = preferences.getString('theme') || 'default';
  const system = Appearance.getColorScheme();
  const effective = prefTheme === 'default' ? (system || 'light') : prefTheme;
  const bgColor = effective === 'dark' ? '#0b0b0f' : '#ffffff';
  return (
    <Provider store={store}>
      <ThemeProvider>
        <TamaguiProvider>
          <InnerApp fallbackBg={bgColor} />
        </TamaguiProvider>
      </ThemeProvider>
    </Provider>
  );
}

function InnerApp({ fallbackBg }: { fallbackBg: string }) {
  const { effectiveTheme, themeColor } = useAppTheme();
  return (
    <ThemedRoot key={`root-${effectiveTheme}-${themeColor}`} fallbackBg={fallbackBg}>
      <NativeListener>
        <PortalProvider>
          <ApplicationNavigator key={`nav-${effectiveTheme}-${themeColor}`} />
        </PortalProvider>
      </NativeListener>
    </ThemedRoot>
  );
}

import React from 'react';
import { useTheme } from 'tamagui';

function ThemedRoot({ children, fallbackBg }: { children: React.ReactNode; fallbackBg: string }) {
  const theme = useTheme();
  const backgroundColor = (theme.background?.val as string) || fallbackBg;
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor }}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {children}
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

export default App;
