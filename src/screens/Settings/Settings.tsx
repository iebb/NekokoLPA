import React from 'react';
import {FlatList,} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SafeScreen} from '@/components/template';
import type {RootScreenProps} from "@/screens/navigation";
import Title from "@/components/common/Title";
import {Colors, ListItem, Picker, View} from "react-native-ui-lib";
import {preferences} from "@/storage/mmkv";
import {setValue} from "@/redux/configStore";
import {useDispatch} from "react-redux";
import {useAppTheme} from "@/theme/context";

export type SettingDataType = {
	key: string;
	options: string[];
	type?: string;
	onChange?: (value: string) => void;
}

function PickerRow({row} : {row: SettingDataType}) {
	const { t } = useTranslation(['settings']);
	const currentValue = preferences.getString(row.key) ?? row.options[0];
	const [v, setV] = React.useState<string>(currentValue);
		if (row.type === 'select') {
		return (
			<View style={{ width : "100%" }}>
				<Picker
					placeholder={t(`settings:title_${row.key}`)}
					topBarProps={{title: t(`settings:title_${row.key}`)}}
					floatingPlaceholder
					value={v}
					onChange={(value) => {
						setV(value);
						console.log(value);
						preferences.set(row.key, value);
						if (row.onChange) {
							row.onChange(value);
						}
					}}
					items={row.options?.map(opt => ({
						label: t(`settings:item_${row.key}_${opt}`),
						value: opt,
						labelStyle: {
							color: Colors.$textDefault,
						}
					}))}
				/>
			</View>
		);
	}

	return null;
}


function Settings({ route,  navigation }: RootScreenProps<'Settings'>) {

	const {t} = useTranslation(['settings']);
	const {theme, setTheme} = useAppTheme();
	const dispatch = useDispatch();
	return (
		<SafeScreen>
			<Title>{t('settings:settings')}</Title>
			<View
				marginT-20
			>
				<FlatList
					key={theme}
					data={[
						{
							key: "showSlots",
							options: ['possible', 'all', 'available'],
							type: 'select'
						},
						{
							key: "language",
							options: ['en', 'zh'],
							type: 'select',
							onChange: (value: string) => {
								dispatch(setValue({language: value}))
							}
						},
						{
							key: "theme",
							options: ['default', 'dark', 'light'],
							type: 'select',
							onChange: (value: string) => {
								setTheme(value);
							}
						},
					]}
					renderItem={({item, index}) => (
						<View
							paddingH-20
							key={item.key}
							borderTopWidth={0.5}
							borderTopColor={Colors.$outlineDisabled}
						>
							<ListItem
								activeBackgroundColor={Colors.grey60}
								activeOpacity={0.3}
							>
								<PickerRow row={item}/>
							</ListItem>
						</View>
					)}
					keyExtractor={(item: SettingDataType) => item.key}
				/>
			</View>
		</SafeScreen>
	);
}

export default Settings;
