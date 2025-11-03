import "react-native-gesture-handler";
import {ThemeProvider, useColorScheme} from "@/theme/context";
import "./translations";
import {NativeListener} from "@/native/NativeListener";
import {store} from "@/redux/reduxDataStore";
import {Provider} from "react-redux";
import ApplicationNavigator from "@/screens/Application";
import {TamaguiProvider} from "@tamagui/core";
import {KeyboardAvoidingView, Platform} from 'react-native';
import {PortalProvider} from '@tamagui/portal';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import React from 'react';
import {useTheme, Theme} from 'tamagui';
import {createTamaguiConfigWithColor} from "../tamagui.config";
import {preferences} from "@/utils/mmkv";

const config = createTamaguiConfigWithColor(preferences.getString("themeColor") || '#a575f6');

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
  const { scheme } = useColorScheme();
  return (
    <Theme name={scheme}>
      <ThemedRoot />
    </Theme>
  );
}

function ThemedRoot() {
  const theme = useTheme();
  const backgroundColor = (theme.background?.val as string);
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor }}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <NativeListener>
          <PortalProvider>
            <ApplicationNavigator />
          </PortalProvider>
        </NativeListener>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

export default App;
