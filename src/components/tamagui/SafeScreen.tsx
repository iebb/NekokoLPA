import { StatusBar } from 'react-native';
import React, { PropsWithChildren } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';
import { useAppTheme } from "@/theme/context";
import { useTheme } from '@tamagui/core';

/**
 * SafeScreen component using Tamagui
 * Drop-in replacement for the react-native-ui-lib version
 */
export function SafeScreen({ children }: PropsWithChildren) {
  const { effectiveTheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  
  return (
    <YStack
      backgroundColor="$pageBackground"
      paddingTop={insets.top}
      paddingBottom={insets.bottom}
      paddingLeft={insets.left}
      paddingRight={insets.right}
      flex={1}
    >
      <StatusBar
        barStyle={effectiveTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.pageBackground?.val || '#f9f9f9'}
      />
      {children}
    </YStack>
  );
}

