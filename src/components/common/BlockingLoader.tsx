import {LoaderScreen, Text, View} from "react-native-ui-lib";
import React from "react";
import {useTheme} from "../../theme_legacy";

export default function BlockingLoader({ message }: { message?: string }) {
  const { colors} = useTheme();
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
      }}
    >
      <View style={{ minHeight: 100, minWidth: 150, backgroundColor: colors.std900, borderRadius: 10, shadowColor: colors.std200,
        shadowOffset: {
          width: 2,
          height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 3.84,
        elevation: 5, }}>
        <LoaderScreen
          color={colors.blue500}
          size="large"
          loaderColor={colors.std200}
        />
          {
            message && (
              <View center paddingB-20>
                <Text color={colors.std200} paddingB-10>{message}</Text>
              </View>
            )
          }
      </View>
    </View>
  )
}