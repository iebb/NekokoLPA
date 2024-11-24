import "react-native-gesture-handler";
import {MMKV} from "react-native-mmkv";
import {preferences} from "@/storage/mmkv";
import {ThemeProvider} from "@/theme/context";
import "./translations";
import {NativeListener} from "@/native/NativeListener";
import {store} from "@/redux/reduxDataStore";
import {Provider} from "react-redux";
import ApplicationNavigator from "@/screens/Application";
import {useEffect} from "react";
import i18next from "i18next";
import {initializeTheme} from "@/theme/theme";
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://0bd91e9c300e703b7743cabf578f64d0@o4505050046332928.ingest.us.sentry.io/4508350673190912",

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // enableSpotlight: __DEV__,
});

require("react-native-ui-lib/config").setConfig({
  appScheme: preferences.getString("theme") ?? "default",
});
try {
  initializeTheme(preferences.getString("themeColor") ?? "#a575f6");
} catch {}

export const storage = new MMKV();

function App() {
  useEffect(() => {
    void i18next.changeLanguage(preferences.getString("language") ?? "en");
  }, []);

  return (
    <ThemeProvider>
      <Provider store={store}>
        <NativeListener>
          <ApplicationNavigator />
        </NativeListener>
      </Provider>
    </ThemeProvider>
  );
}

export default App;
