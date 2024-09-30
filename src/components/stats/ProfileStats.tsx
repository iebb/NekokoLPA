import {Text, View} from "react-native-ui-lib";
import React from "react";
import {useTheme} from "@/theme";
import {countryList} from "@/storage/mmkv";
import _MCC from "@/data/mcc.json";
import {Flags} from "@/assets/flags";

export function ProfileStats() {
  const { colors, gutters, fonts } = useTheme();

  return (
    <View flex flexG style={{ gap: 10 }}>
      <View gap-10>
        {
          countryList.getAllKeys().sort().map(mcc => {
            const mncs = JSON.parse(countryList.getString(mcc) as string);
            const mccData = (_MCC as any)[mcc];
            const Flag = (Flags[mccData.ISO1] || Flags.UN).default;
            return (
              <View key={mcc}>
                <View row gap-3>
                  <Flag
                    width={30}
                    height={20}
                  />
                  <View flexG>
                    <Text text70M style={{ color: colors.std200 }} flexG>
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