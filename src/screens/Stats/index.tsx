import React from 'react';
import {Image, ScrollView,} from 'react-native';
import {useTranslation} from 'react-i18next';
import SafeScreen from '@/theme/SafeScreen';
import type {RootScreenProps} from "@/screens/navigation";
import Title from "@/components/common/Title";
import Container from "@/components/common/Container";
import {countryList} from "@/utils/mmkv";
import _MCC from "@/data/mcc.json";
import {Flags} from "@/assets/flags";
import {Text, View} from "react-native-ui-lib";

function Stats({ route,  navigation }: RootScreenProps<'Stats'>) {

	const { t } = useTranslation(['main']);

	const data = countryList.getAllKeys();
	const countryData: {[key: string]: {
		country: any,
			mncs: { [key: string]: any }
		}} = {};
	for(const mcc of data) {
		const mncs = JSON.parse(countryList.getString(mcc) as string);
		const mccData = (_MCC as any)[mcc];
		if (countryData[mccData.ISO1] == undefined) {
			countryData[mccData.ISO1] = {
				country: mccData,
				mncs: {},
			};
		}

		for(const mnc of Object.keys(mncs)) {
			countryData[mccData.ISO1].mncs[mnc] = mncs[mnc];
		}
	}

	return (
		<SafeScreen>
			<Title>{t('main:profile_collection_stats')}</Title>
			<Container>
				<ScrollView>
					<View flex flexG style={{ gap: 10 }}>
						<View gap-10>
							{
								Object.keys(countryData).sort().map(country => {
									return (
										<View key={country}>
											<View row gap-10>
												<Image
													style={{width: 20, height: 20}}
													source={Flags[country] || Flags.UN}
												/>
												<View flexG>
													<Text text70M style={{ marginTop: -2 }} flexG $textDefault>
														{countryData[country].country.ISO1} {countryData[country].country.Country}
													</Text>
													<View>
														{
															Object.keys(countryData[country].mncs).map((mnc: string) => (
																<Text key={mnc} $textNeutral
																			text90M
																			flexG>{mnc} {countryData[country].mncs[mnc]}</Text>
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
				</ScrollView>
			</Container>
		</SafeScreen>
	);

}

export default Stats;
