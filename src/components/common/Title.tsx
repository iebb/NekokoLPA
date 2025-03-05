import {Text, View} from "react-native-ui-lib";
import React from "react";


export default function Title({ children }: { children: string }) {
  return (
    <View
      paddingH-20
      paddingT-20
      paddingB-10
    >
      <Text $textDefault text40BO>
        {children}
      </Text>
    </View>
  )
}