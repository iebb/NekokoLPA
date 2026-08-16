import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {Appearance} from 'react-native';

import {preferences} from '@/shared/storage';

const THEME_KEY = 'theme';

/** 'default' follows the OS setting; the others force a scheme. */
export type ThemePreference = 'default' | 'light' | 'dark';

/** A concrete scheme to render with — never null, unlike ColorSchemeName. */
export type ResolvedScheme = 'light' | 'dark';

/** RN reports null when the OS expresses no preference; treat that as light. */
function systemScheme(): ResolvedScheme {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

interface ThemeContextValue {
  /** Resolved scheme to render with. */
  scheme: ResolvedScheme;
  /** Persists a new preference and re-renders. */
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  scheme: systemScheme(),
  setTheme: () => {},
});

export const useColorScheme = () => useContext(ThemeContext);

function readStoredTheme(): ThemePreference {
  const stored = preferences.getString(THEME_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'default';
}

export function ThemeProvider({children}: PropsWithChildren) {
  const osScheme = systemScheme();
  const [theme, setThemeState] = useState<ThemePreference>(readStoredTheme);

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    preferences.set(THEME_KEY, next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme: theme === 'default' ? osScheme : theme,
      setTheme,
    }),
    [theme, osScheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
