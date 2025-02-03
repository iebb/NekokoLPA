import { Colors, LoaderScreen, Text, View } from "react-native-ui-lib";
import React from "react";

export default function BlockingLoader({ message }: { message?: string }) {
  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
    >
      <View
        style={{
          minHeight: 100,
          minWidth: 150,
          backgroundColor: Colors.$backgroundNeutral,
          borderRadius: 10,
          shadowColor: Colors.$backgroundNeutralHeavy,
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 3.84,
          elevation: 5,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <LoaderScreen color={Colors.blue30} size="large" loaderColor={Colors.$backgroundNeutral} />
        {message && (
          <Text $textDefault marginT-10>
            {message}
          </Text>
        )}
      </View>
    </View>
  );
}
