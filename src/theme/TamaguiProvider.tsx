import React, { useEffect } from 'react';
import { TamaguiProvider as BaseTamaguiProvider } from '@tamagui/core';
import config from '../../tamagui.config';
import { useAppTheme } from './context';
import { useColorScheme } from 'react-native';

/**
 * TamaguiProvider wrapper that integrates with existing theme system
 * This allows gradual migration - components can use Tamagui while still
 * having access to the existing theme context
 */
export function TamaguiProvider({ children }: { children: React.ReactNode }) {
  const { effectiveTheme, themeColor } = useAppTheme();
  const systemTheme = useColorScheme();
  
  // Map to Tamagui theme names
  const tamaguiTheme = effectiveTheme === 'dark' ? 'dark' : 'light';

  // Note: themeColor changes will be handled via token overrides later
  // For now, we use the basic light/dark themes

  return (
    <BaseTamaguiProvider
      config={config}
      defaultTheme={tamaguiTheme}
    >
      {children}
    </BaseTamaguiProvider>
  );
}

