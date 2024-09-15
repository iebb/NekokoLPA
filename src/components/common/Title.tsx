import {Text, View} from "react-native-ui-lib";
import React from "react";
import {useTheme} from "@/theme";


export default function Title({ children }: { children: string }) {
  const { colors, gutters, fonts } = useTheme();
  return (
    <View
      paddingH-30
      paddingT-20
    >
      <Text style={[fonts.size_24, fonts.gray800, fonts.bold]}>
        {children}
      </Text>
    </View>
  )
}