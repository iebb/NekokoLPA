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
  const effectiveTheme = theme === 'default' ? Appearance.getColorScheme() : theme;
  const setTheme = (_theme) => {
    Colors.setScheme(_theme);
    _setTheme(_theme);
  };

  const setThemeColor = (color) => {
    initializeTheme(color);
  };

  return (
    <ThemeContext.Provider value={{theme, effectiveTheme, themeColor, setTheme, setThemeColor}}>
      {children}
    </ThemeContext.Provider>
  );
};