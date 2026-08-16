import React from 'react';
import {Image} from 'react-native';
import {useTranslation} from 'react-i18next';
import Screen from '@/shared/ui/Screen';
import type {RootScreenProps} from '@/app/navigation/types';
import {countryList} from '@/shared/storage';
import _MCC from '@/data/mcc.json';
import {Flags} from '@/assets/flags';
import {View} from 'react-native';
import {Text as TText, XStack, YStack} from 'tamagui';
import {fontSize} from '@/shared/theme/tokens';

function Stats(_props: RootScreenProps<'Stats'>) {
  const {t} = useTranslation(['main']);

  const data = countryList.getAllKeys();
  const countryData: {
    [key: string]: {
      country: any;
      mncs: {[key: string]: any};
    };
  } = {};
  for (const mcc of data) {
    const mncs = JSON.parse(countryList.getString(mcc) as string);
    const mccData = (_MCC as any)[mcc];
    if (countryData[mccData.ISO1] === undefined) {
      countryData[mccData.ISO1] = {
        country: mccData,
        mncs: {},
      };
    }

    for (const mnc of Object.keys(mncs)) {
      countryData[mccData.ISO1].mncs[mnc] = mncs[mnc];
    }
  }

  return (
    <Screen title={t('main:profile_collection_stats')}>
      <YStack gap={10} flex={1}>
        <YStack gap={10}>
          {Object.keys(countryData)
            .sort()
            .map(country => {
              return (
                <View key={country}>
                  <XStack gap={10} alignItems="flex-start">
                    <Image style={{width: 20, height: 20}} source={Flags[country] || Flags.UN} />
                    <YStack flex={1}>
                      <TText
                        color="$textDefault"
                        fontSize={fontSize.md}
                        fontWeight={'500' as any}
                        style={{marginTop: -2}}>
                        {countryData[country].country.ISO1} {countryData[country].country.Country}
                      </TText>
                      <YStack>
                        {Object.keys(countryData[country].mncs).map((mnc: string) => (
                          <TText
                            key={mnc}
                            color="$color6"
                            fontSize={fontSize.sm}
                            fontWeight={'500' as any}>
                            {mnc} {countryData[country].mncs[mnc]}
                          </TText>
                        ))}
                      </YStack>
                    </YStack>
                  </XStack>
                </View>
              );
            })}
        </YStack>
      </YStack>
    </Screen>
  );
}

export default Stats;
