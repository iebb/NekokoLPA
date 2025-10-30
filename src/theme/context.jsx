import React, {createContext, useContext, useState, useEffect} from 'react';
import {Appearance} from 'react-native';
import {preferences} from "@/utils/mmkv";

const ThemeContext = createContext();

export const useAppTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({children}) => {
  const [theme, _setTheme] = useState(preferences.getString("theme") ?? 'default');
  const [themeColor, _setThemeColor] = useState(preferences.getString("themeColor") ?? '#a575f6');
  const [systemTheme, setSystemTheme] = useState(Appearance.getColorScheme());
  const [themeVersion, setThemeVersion] = useState(0);

  const effectiveTheme = theme === 'default' ? systemTheme : theme;
  
  const setTheme = (_theme) => {
    _setTheme(_theme);
    preferences.set("theme", _theme);
    setThemeVersion(v => v + 1);
  };

  const setThemeColor = (color) => {
    preferences.set("themeColor", color);
    _setThemeColor(color);
    setThemeVersion(v => v + 1);
  };

  // initialize theme from preferences on mount
  useEffect(() => {
    const storedTheme = preferences.getString("theme");
    if (storedTheme && storedTheme !== theme) {
      _setTheme(storedTheme);
    }
    const storedColor = preferences.getString("themeColor");
    if (storedColor && storedColor !== themeColor) {
      _setThemeColor(storedColor);
    }
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
      setThemeVersion(v => v + 1);
    });
    return () => {
      // @ts-ignore
      sub?.remove?.();
    };
  }, []);

  return (
    <ThemeContext.Provider
      value={{theme, effectiveTheme, themeColor, setTheme, setThemeColor, themeVersion}}
    >
      {children}
    </ThemeContext.Provider>
  );
};