import React, {createContext, useContext, useState} from 'react';
import {Colors, ThemeManager, View} from 'react-native-ui-lib';

const ThemeContext = createContext();

export const useAppTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({children}) => {
  console.log("ThemeProvider ok");
  const [theme, _setTheme] = useState('default');
  const setTheme = (_theme) => {
    Colors.setScheme(_theme);
    _setTheme(_theme);
  };
  return (
    <ThemeContext.Provider value={{theme, setTheme}}>
      <View key={theme}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
};