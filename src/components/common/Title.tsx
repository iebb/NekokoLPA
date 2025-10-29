import {View} from "react-native";
import {Text} from 'tamagui';
import React from "react";


export default function Title({ children }: { children: string }) {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }}>
      <Text color="$textDefault" fontSize={28} fontWeight={"700" as any}>
        {children}
      </Text>
    </View>
  )
}