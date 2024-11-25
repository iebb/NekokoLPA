import {Colors, SchemeType, ThemeManager} from "react-native-ui-lib";
import {preferences} from "@/storage/mmkv";
import {Appearance} from "react-native";

export function initializeTheme(primaryColor) {
  Colors.loadDesignTokens({
    primaryColor
  });

  Colors.loadSchemes({
    light: {
      screenBG: 'transparent',
      cardBackground: Colors.grey80,
      pageBackground: Colors.grey60,
      buttonBackground: primaryColor,
      buttonForeground: Colors.isDark(primaryColor) ? Colors.getColorTint(primaryColor, 80) : Colors.getColorTint(primaryColor, 20),
      moonOrSun: Colors.yellow30,
      mountainForeground: Colors.green30,
      mountainBackground: Colors.green50,
      $backgroundSuccess: Colors.green40,
      $backgroundSuccessLight: Colors.green70
    },
    dark: {
      screenBG: Colors.grey10,
      cardBackground: Colors.grey10,
      pageBackground: Colors.grey1,
      buttonBackground: primaryColor,
      buttonForeground: Colors.isDark(primaryColor) ? Colors.getColorTint(primaryColor, 80) : Colors.getColorTint(primaryColor, 20),
      moonOrSun: Colors.grey80,
      mountainForeground: Colors.violet10,
      mountainBackground: Colors.violet20,
      $backgroundSuccess: Colors.green40,
      $backgroundSuccessLight: Colors.green20
    }
  });

  ThemeManager.setComponentTheme('Button', (props, context) => {
    return {
      backgroundColor: Colors.buttonBackground,
      color: Colors.buttonForeground,
    };
  });

  if (preferences.getString("theme") !== undefined) {
    Colors.setScheme((preferences.getString("theme") as SchemeType) ?? Appearance.getColorScheme() ?? "light");
  }

}
