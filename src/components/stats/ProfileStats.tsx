import {Text, View} from "react-native-ui-lib";
import React from "react";
import {useTheme} from "@/theme";
import {countryList} from "@/storage/mmkv";
import _MCC from "@/data/mcc.json";
import {Flags} from "@/assets/flags";
import {Image} from "react-native";

export function ProfileStats() {
  const { colors, gutters, fonts } = useTheme();

  return (
    <View flex flexG style={{ gap: 10 }}>
      <View gap-10>
        {
          countryList.getAllKeys().sort().map(mcc => {
            const mncs = JSON.parse(countryList.getString(mcc) as string);
            const mccData = (_MCC as any)[mcc];
            return (
              <View key={mcc}>
                <View row gap-10>
                  <Image
                    style={{width: 20, height: 20}}
                    source={Flags[mccData.ISO1] || Flags.UN}
                  />
                  <View flexG>
                    <Text text70M style={{ color: colors.std200, marginTop: -2 }} flexG>
                      {mcc} {mccData.Country}
                    </Text>
                    <View>
                      {
                        Object.keys(mncs).map((mnc: string) => (
                          <Text key={mnc}
                                text90M style={{ color: colors.std400 }}
                                flexG>{mnc.substring(3)} {mncs[mnc]}</Text>
                        ))
                      }
                    </View>
                  </View>
                </View>
              </View>
            )})
        }
      </View>
    </View>
  )
}