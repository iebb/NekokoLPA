import {View} from "react-native";
import {Text, YStack} from 'tamagui';
import React from "react";


export default function Title({ children, subtitle }: { children: string; subtitle?: string }) {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }}>
      <YStack gap={4}>
        <Text color="$textDefault" fontSize={28} fontWeight={"700" as any}>
          {children}
        </Text>
        {subtitle && (
          <Text color="$color10" fontSize={14}>
            {subtitle}
          </Text>
        )}
      </YStack>
    </View>
  )
}