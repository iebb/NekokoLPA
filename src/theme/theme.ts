import {Colors, SchemeType, TextProps, ThemeManager} from "react-native-ui-lib";
import {preferences} from "@/utils/mmkv";
import {Appearance, StyleProp, TextStyle} from "react-native";
import Animated from "react-native-reanimated";

export function initializeTheme(primaryColor: string) {
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

  ThemeManager.setComponentTheme('Button', (props: any, context: any) => {
    return {
      backgroundColor: Colors.buttonBackground,
      color: Colors.buttonForeground,
    };
  });
  // ThemeManager.setComponentForcedTheme('Text', (props: TextProps & CustomFamilyProps) => {
  //   return {
  //     ...props,
  //     style: combineStyles<StyleProp<TextStyle | Animated.AnimatedProps<TextStyle>>>(
  //       { fontFamily: fonts.fig3 }, // <--- Default font family for all my text components
  //       props.style,
  //       props.family && fonts[props.family] ? { fontFamily: fonts[props.family] } : {}
  // ),
  // }
  // })

  if (preferences.getString("theme") !== undefined) {
    Colors.setScheme((preferences.getString("theme") as SchemeType) ?? Appearance.getColorScheme() ?? "light");
  }

}
