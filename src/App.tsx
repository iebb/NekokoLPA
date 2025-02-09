import "react-native-gesture-handler";
import {MMKV} from "react-native-mmkv";
import {preferences} from "@/utils/mmkv";
import {ThemeProvider} from "@/theme/context";
import "./translations";
import {NativeListener} from "@/native/NativeListener";
import {store} from "@/redux/reduxDataStore";
import {Provider} from "react-redux";
import ApplicationNavigator from "@/screens/Application";
import {useEffect} from "react";
import i18next from "i18next";
import {initializeTheme} from "@/theme/theme";

require("react-native-ui-lib/config").setConfig({
  appScheme: preferences.getString("theme") ?? "default",
});
try {
  initializeTheme(preferences.getString("themeColor") ?? "#a575f6");
} catch {}

export const storage = new MMKV();

function App() {

  return (
    <Provider store={store}>
      <NativeListener>
        <ThemeProvider>
          <ApplicationNavigator />
        </ThemeProvider>
      </NativeListener>
    </Provider>
  );
}

export default App;
