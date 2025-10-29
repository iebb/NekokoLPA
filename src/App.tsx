import "react-native-gesture-handler";
import {preferences} from "@/utils/mmkv";
import {ThemeProvider} from "@/theme/context";
import "./translations";
import {NativeListener} from "@/native/NativeListener";
import {store} from "@/redux/reduxDataStore";
import {Provider} from "react-redux";
import ApplicationNavigator from "@/screens/Application";
import {initializeTheme} from "@/theme/theme";
import * as Sentry from "@sentry/react-native";
import { TamaguiProvider } from "@/theme/TamaguiProvider";


Sentry.init({
  dsn: "https://eea742e6ac6d6908f6bc6c34e30fb88d@sentry.nekoko.it/2",
  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

require("react-native-ui-lib/config").setConfig({
  appScheme: preferences.getString("theme") ?? "default",
});
try {
  initializeTheme(preferences.getString("themeColor") ?? "#a575f6");
} catch {}

function App() {
  return (
    <Provider store={store}>
      <NativeListener>
        <ThemeProvider>
          <TamaguiProvider>
            <ApplicationNavigator />
          </TamaguiProvider>
        </ThemeProvider>
      </NativeListener>
    </Provider>
  );
}

export default App;
