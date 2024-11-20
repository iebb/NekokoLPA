import React, {createContext, useContext, useState} from 'react';
import {Colors, ThemeManager, View} from 'react-native-ui-lib';
import {Appearance} from "react-native";
import {initializeTheme} from "@/theme/theme";
import {preferences} from "@/storage/mmkv";

const ThemeContext = createContext();

export const useAppTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({children}) => {
  const [theme, _setTheme] = useState('default');
  const [themeColor, _setThemeColor] = useState(preferences.getString("themeColor") ?? '#a575f6');
  const [effectiveTheme, _setEffectiveTheme] = useState('default');
  const setTheme = (_theme) => {
    Colors.setScheme(_theme);
    _setTheme(_theme);
    _setEffectiveTheme(_theme === 'default' ? Appearance.getColorScheme() : _theme);
  };

  const setThemeColor = (color) => {
    initializeTheme(color);
    _setTheme(theme);
    _setEffectiveTheme(theme === 'default' ? Appearance.getColorScheme() : theme);
  };

  return (
    <ThemeContext.Provider value={{theme, effectiveTheme, themeColor, setTheme, setThemeColor}}>
      {children}
    </ThemeContext.Provider>
  );
};