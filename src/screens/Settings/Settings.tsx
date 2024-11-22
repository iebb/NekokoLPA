import React from 'react';
import {Alert, FlatList,} from 'react-native';
import {useTranslation} from 'react-i18next';
import SafeScreen from '@/theme/SafeScreen';
import type {RootScreenProps} from "@/screens/navigation";
import Title from "@/components/common/Title";
import {Button, ColorPickerDialog, Colors, ListItem, Picker, Text, TextField, View} from "react-native-ui-lib";
import {preferences} from "@/storage/mmkv";
import {useDispatch} from "react-redux";
import {useAppTheme} from "@/theme/context";
import i18next from "i18next";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faPaintbrush} from "@fortawesome/free-solid-svg-icons";
import RNRestart from 'react-native-restart';

export type SettingDataType = {
	key: string;
	options: string[];
	type?: string;
	onChange?: (value: string) => void;
	validate?: (value: string) => boolean;
}

function PickerRow({row} : {row: SettingDataType}) {
	const {t} = useTranslation(['settings']);
	const currentValue = preferences.getString(row.key) ?? row.defaultValue;
	const [v, setV] = React.useState<string>(currentValue);
	if (row.type === 'select') {
		return (
			<View style={{width: "100%"}}>
				<Picker
					placeholder={t(`settings:title_${row.key}`)}
					topBarProps={{title: t(`settings:title_${row.key}`)}}
					floatingPlaceholder
					value={v}
					onChange={(value) => {
						setV(value);
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

	if (row.type === 'text') {
		return (
			<View style={{width: "100%"}}>
				<TextField
					placeholder={t(`settings:title_${row.key}`)}
					floatingPlaceholder
					value={v}
					onChangeText={value => {
						setV(value);
						if (!row.validate || row.validate(value)) {
							preferences.set(row.key, value);
						}
					}}
					enableErrors
					style={{ borderBottomWidth: 0.5, borderColor: Colors.$outlineDisabledHeavy }}
				/>
			</View>
		);
	}

	if (row.type === 'color') {
		const [picker, showPicker] = React.useState<boolean>(false);
		return (
			<View style={{width: "100%"}}>
				<Text $textNeutralLight text90L>
					{t(`settings:title_${row.key}`)}
				</Text>
				<Button backgroundColor={v} onPress={() => showPicker(true)} marginT-10 style={{ maxWidth: 100 }}>
					<FontAwesomeIcon icon={faPaintbrush} style={{ color: Colors.buttonForeground }} />
				</Button>
				<ColorPickerDialog
					initialColor={v}
					visible={picker}
					onDismiss={() => showPicker(false)}
					onSubmit={(value) => {
						setV(value);
						preferences.set(row.key, value);
						if (row.onChange) {
							row.onChange(value);
						}
					}}
					// animatedIndex={0}
				/>
			</View>
		);
	}

	return null;
}


function Settings({ route,  navigation }: RootScreenProps<'Settings'>) {

	const {t} = useTranslation(['settings']);
	const {theme, setTheme, setThemeColor} = useAppTheme();
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
							key: "language",
							options: ['en', 'zh'],
							defaultValue: 'en',
							type: 'select',
							onChange: (value: string) => {
								void i18next.changeLanguage(value);
							}
						},
						{
							key: "theme",
							options: ['default', 'dark', 'light'],
							defaultValue: 'default',
							type: 'select',
							onChange: (value: string) => {
								setTheme(value);
							}
						},
						{
							key: "showSlots",
							options: ['all', 'possible', 'available'],
							defaultValue: 'all',
							type: 'select'
						},
						{
							key: "redactMode",
							options: ['none', 'medium', 'hard'],
							defaultValue: 'none',
							type: 'select'
						},
						{
							key: "unit",
							options: ['b', 'kb', 'kib', 'mb', 'mib', 'adaptive_si', 'adaptive_bi'],
							defaultValue: 'adaptive_si',
							type: 'select'
						},
						{
							key: "displaySubtitle",
							options: ['provider', 'operator', 'country', 'code', 'iccid'],
							defaultValue: 'provider',
							type: 'select'
						},
						{
							key: "useCamera",
							options: ['always', 'ondemand', 'never'],
							defaultValue: 'always',
							type: 'select'
						},
						{
							key: "useRemoteDevice",
							options: ['off', 'on'],
							defaultValue: 'off',
							type: 'select'
						},
						{
							key: "remoteDevice",
							defaultValue: '',
							type: 'text'
						},
						{
							key: "themeColor",
							defaultValue: '#a575f6',
							type: 'color',
							onChange: (value: string) => {
								setThemeColor(value);
								Alert.alert('Color changed', "Restart to take effect?", [
									{text: 'Cancel'},
									{text: 'OK', onPress: () => RNRestart.restart()},
								]);
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
