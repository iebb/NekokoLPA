import React, { useMemo } from 'react';
import { TamaguiProvider as BaseTamaguiProvider } from '@tamagui/core';
import { createTamaguiConfigWithColor } from '../../tamagui.config';
import { useAppTheme } from './context';
import { useColorScheme } from 'react-native';

export function TamaguiProvider({ children }: { children: React.ReactNode }) {
  const { effectiveTheme, themeColor } = useAppTheme();
  const systemTheme = useColorScheme();
  
  // Map to Tamagui theme names
  const tamaguiTheme = effectiveTheme === 'dark' ? 'dark' : 'light';

  const tamaguiConfig = useMemo(() => {
    return createTamaguiConfigWithColor(themeColor || '#a575f6');
  }, [themeColor]);

  // Force remount when themeColor changes by using it as part of the key
  // This ensures all components using theme colors will update immediately
  return (
    <BaseTamaguiProvider
      key={`tamagui-${themeColor}-${tamaguiTheme}`}
      config={tamaguiConfig}
      defaultTheme={tamaguiTheme}
    >
      {children}
    </BaseTamaguiProvider>
  );
}

