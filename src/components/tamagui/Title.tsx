import { YStack, Text } from 'tamagui';
import React from "react";

/**
 * Title component using Tamagui
 * Drop-in replacement for the react-native-ui-lib version
 */
export function Title({ children }: { children: string }) {
  return (
    <YStack
      paddingHorizontal={20}
      paddingTop={20}
      paddingBottom={10}
    >
      <Text 
        color="$textDefault"
        fontSize={28}
        fontWeight="700"
        lineHeight={32}
      >
        {children}
      </Text>
    </YStack>
  );
}

export default Title;

