import React, {createContext, useContext, useEffect, useState} from 'react';
import {Appearance} from 'react-native';
import {preferences} from "@/utils/mmkv";

const ThemeContext = createContext();

export const useColorScheme = () => useContext(ThemeContext);

export const ThemeProvider = ({children}) => {
  const systemTheme = Appearance.getColorScheme();
  const [theme, _setTheme] = useState(preferences.getString("theme") ?? 'default');

  const setTheme = (_theme) => {
    _setTheme(_theme);
    preferences.set("theme", _theme);
  };

  // initialize theme from preferences on mount
  useEffect(() => {
    const storedTheme = preferences.getString("theme");
    if (storedTheme && storedTheme !== theme) {
      _setTheme(storedTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{scheme: theme === 'default' ? systemTheme : theme, setTheme}}
    >
      {children}
    </ThemeContext.Provider>
  );
};
