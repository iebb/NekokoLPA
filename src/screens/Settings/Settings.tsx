import React, {useState, useEffect, useMemo} from 'react';
import {FlatList, Platform, ToastAndroid, KeyboardAvoidingView, Dimensions, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import SafeScreen from '@/theme/SafeScreen';
import type {RootScreenProps} from "@/screens/navigation";
import Title from "@/components/common/Title";
import {ActionSheet, Button, ColorPickerDialog, Colors, Dialog, Drawer, ListItem, Text, TextField, View} from "react-native-ui-lib";
import {preferences} from "@/utils/mmkv";
import {useAppTheme} from "@/theme/context";
import i18next from "i18next";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faPaintbrush, faTrash, faArrowUp, faArrowDown} from "@fortawesome/free-solid-svg-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import {getAIDList, resetAIDsToPreset, setAIDsToGsmaOnly, setAIDsToEstkSe0, setAIDsToEstkSe1, setAIDList, GSMA_AID, PRESET_AID_LIST, ESTK_SE0_LIST, ESTK_SE1_LIST} from "@/utils/aid";

export type SettingDataType = {
	key: string;
	options?: string[];
	type: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	validate?: (value: string) => boolean;
}

function SelectRow({row} : {row: SettingDataType}) {
	const { t } = useTranslation(['main']);
	const currentValue = preferences.getString(row.key) ?? (row.defaultValue ?? '');
	const [v, setV] = useState<string>(currentValue);
	const [showActionSheet, setShowActionSheet] = useState(false);
	
	// Update local state when preferences change
	useEffect(() => {
		const newValue = preferences.getString(row.key) ?? (row.defaultValue ?? '');
		if (newValue !== v) {
			setV(newValue);
		}
	}, [row.key, row.defaultValue, v]);
	
	const options = row.options?.map((opt) => ({
		label: t(`main:settings_item_${row.key}_${opt}`),
		onPress: () => {
			setV(opt);
			preferences.set(row.key, opt);
			if (row.onChange) {
				row.onChange(opt);
			}
			setShowActionSheet(false);
		}
	})) || [];
	
	// Add cancel option
	options.push({
		label: 'Cancel',
		onPress: () => setShowActionSheet(false)
	});
	
	const currentLabel = row.options?.find(opt => opt === v) 
		? t(`main:settings_item_${row.key}_${v}`) 
		: v;

    return (
        <>
            <ListItem
                activeBackgroundColor={Colors.grey60}
                activeOpacity={0.3}
                paddingV-4
                onPress={() => setShowActionSheet(true)}
            >
                <ListItem.Part middle column>
				<View>
                    <View row spread style={{ width: '100%' }}>
                        <View>
                            <Text $textDefault text80>
                                {t(`main:settings_title_${row.key}`)}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }} />
                    </View>
                    <View row style={{ width: '100%' }}>
                        <View style={{ flex: 1 }} />
                        <View>
                            <Text $textNeutralLight text80>
                                {currentLabel} →
                            </Text>
                        </View>
						</View>
						</View>
                </ListItem.Part>
            </ListItem>
            <ActionSheet
                visible={showActionSheet}
                title={t(`main:settings_title_${row.key}`)}
                cancelButtonIndex={options.length - 1}
                options={options}
                onDismiss={() => setShowActionSheet(false)}
                useNativeIOS
            />
        </>
    );
}

function PickerRow({row} : {row: SettingDataType}) {
	const { t } = useTranslation(['main']);
	const currentValue = preferences.getString(row.key) ?? (row.defaultValue ?? '');
	const [v, setV] = useState<string>(currentValue);
	
	// Update local state when preferences change
	useEffect(() => {
		const newValue = preferences.getString(row.key) ?? (row.defaultValue ?? '');
		if (newValue !== v) {
			setV(newValue);
		}
	}, [row.key, row.defaultValue, v]);
	
	if (row.type === 'select') {
		return null; // Handled by SelectRow
	}

	if (row.type === 'text') {
		return (
			<View style={{width: "100%"}}>
				<TextField
					placeholder={t(`main:settings_title_${row.key}`)}
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
		const [picker, showPicker] = useState<boolean>(false);
		return (
			<View style={{width: "100%"}}>
				<View>
					<View row spread style={{ width: '100%' }}>
						<View>
							<Text $textDefault text80>
								{t(`main:settings_title_${row.key}`)}
							</Text>
						</View>
						<View style={{ flex: 1 }} />
					</View>
					<View row style={{ width: '100%' }}>
						<View style={{ flex: 1 }} />
						<View>
							<Button backgroundColor={v} onPress={() => showPicker(true)} style={{ maxWidth: 100 }}>
								<FontAwesomeIcon icon={faPaintbrush} style={{ color: Colors.buttonForeground }} />
							</Button>
						</View>
					</View>
				</View>
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
				/>
			</View>
		);
	}

	return null;
}


export default function Settings({ route,  navigation }: RootScreenProps<'Settings'>) {

	const { t } = useTranslation(['main']);
	const {theme, setTheme, setThemeColor} = useAppTheme();
	const [aidModalVisible, setAidModalVisible] = useState(false);
	const insets = useSafeAreaInsets();
	
	const modalHeight = useMemo(() => {
		const screenHeight = Dimensions.get('window').height;
		const availableHeight = screenHeight - insets.top - insets.bottom - 150;
		return Math.min(availableHeight, 600);
	}, [insets.top, insets.bottom]);
	
	return (
		<SafeScreen>
			<Title>{t('main:settings_settings')}</Title>
			<View
				marginT-20
				marginB-40
			>
				<FlatList
					key={theme}
					data={(() => {
						const items: SettingDataType[] = [
							{
								key: "language",
								options: ['en', 'ja', 'zh', 'es', 'ru', 'ar'],
								defaultValue: 'en',
								type: 'select',
								onChange: (value: string) => {
									preferences.set("language", value);
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
								options: ['always', 'ondemand'],
								defaultValue: 'always',
								type: 'select'
							},
							{
								key: "aid",
								type: 'aid'
							},
							{
								key: "themeColor",
								defaultValue: '#a575f6',
								type: 'color',
								onChange: (value: string) => {
									setThemeColor(value);
								}
							},
						];
						if (Platform.OS === 'android') {
							items.splice(items.length - 2, 0, {
								key: "disableProtection",
								options: ['on', 'off'],
								defaultValue: 'on',
								type: 'select'
							});
						}
						return items;
					})()}
					renderItem={({item, index}) => {
						if (item.type === 'aid') {
							const aidCount = getAIDList().split(',').filter(Boolean).length;
							return (
								<View paddingH-20>
									<ListItem
										activeBackgroundColor={Colors.grey60}
										activeOpacity={0.3}
										paddingV-4
										onPress={() => setAidModalVisible(true)}
									>
										<ListItem.Part middle column>
											<View>
												<View row spread style={{ width: '100%' }}>
													<View>
														<Text $textDefault text80>
															AID Configuration
														</Text>
													</View>
													<View style={{ flex: 1 }} />
												</View>
												<View row style={{ width: '100%' }}>
													<View style={{ flex: 1 }} />
													<View>
														<Text $textNeutralLight text80>
															{aidCount} AID{aidCount !== 1 ? 's' : ''} →
														</Text>
													</View>
												</View>
											</View>
										</ListItem.Part>
									</ListItem>
								</View>
							);
						}
                        return (
                            <View
                                paddingH-20
                                key={item.key}
                            >
                                {item.type === 'select' ? (
                                    <SelectRow row={item} />
								) : (
									<ListItem
										activeBackgroundColor={Colors.grey60}
										activeOpacity={0.3}
										paddingV-12
									>
										<PickerRow row={item}/>
									</ListItem>
								)}
                            </View>
                        );
					}}
					keyExtractor={(item: SettingDataType) => item.key}
				/>
			</View>
			
			<Dialog
				useSafeArea
				center
				visible={aidModalVisible}
				onDismiss={() => setAidModalVisible(false)}
				containerStyle={{
					backgroundColor: Colors.$backgroundElevatedLight,
					borderRadius: 12,
					shadowColor: Colors.$backgroundElevated,
					shadowOpacity: 0.05,
					shadowRadius: 12,
					shadowOffset: {height: 6, width: 0},
					height: modalHeight,
					width: '90%',
					alignSelf: 'center',
				}}
				renderPannableHeader={() => {
					return (
						<View>
							<View marginH-20 marginV-15>
								<Text $textDefault text60>AID Configuration</Text>
							</View>
							<View height={1} style={{ backgroundColor: Colors.$outlineDisabledHeavy}} />
						</View>
					);
				}}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					style={{ flex: 1, width: '100%' }}
				>
					<AIDManager onDismiss={() => setAidModalVisible(false)} />
				</KeyboardAvoidingView>
			</Dialog>
		</SafeScreen>
	);
}

function AIDManager({onDismiss}: {onDismiss?: () => void}) {
    const [aids, setAids] = useState<string[]>(() => getAIDList().split(',').filter(Boolean));
    const [input, setInput] = useState<string>("");

    useEffect(() => {
        if (aids.length > 0) {
            setAIDList(aids.join(','));
        }
    }, [aids]);

    const addAid = () => {
        const v = input.trim().toUpperCase();
        if (v.length === 0) return;
        if (!/^[0-9A-F]+$/.test(v)) return;
        if (aids.includes(v)) return;
        setAids([...aids, v]);
        setInput("");
    };

    const removeAid = (aid: string) => {
        setAids(aids.filter(a => a !== aid));
    };

    const moveAidUp = (aid: string) => {
        const index = aids.indexOf(aid);
        if (index > 0) {
            const newAids = [...aids];
            [newAids[index - 1], newAids[index]] = [newAids[index], newAids[index - 1]];
            setAids(newAids);
        }
    };

    const moveAidDown = (aid: string) => {
        const index = aids.indexOf(aid);
        if (index < aids.length - 1) {
            const newAids = [...aids];
            [newAids[index], newAids[index + 1]] = [newAids[index + 1], newAids[index]];
            setAids(newAids);
        }
    };

    const onResetPreset = () => {
        resetAIDsToPreset();
        setAids(PRESET_AID_LIST.split(',').filter(Boolean));
    };

    const onGsmaOnly = () => {
        setAIDsToGsmaOnly();
        setAids([GSMA_AID]);
    };

    const onEstkSe0 = () => {
        setAIDsToEstkSe0();
        setAids(ESTK_SE0_LIST.split(',').filter(Boolean));
    };

    const onEstkSe1 = () => {
        setAIDsToEstkSe1();
        setAids(ESTK_SE1_LIST.split(',').filter(Boolean));
    };

    const inputValid = /^[0-9A-F]+$/.test(input.trim().toUpperCase()) && !aids.includes(input.trim().toUpperCase());

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <View row centerV marginB-15>
				<View flexG marginR-10>
					<TextField
						placeholder="Add AID (hex)"
						value={input}
						onChangeText={setInput}
						autoCapitalize="characters"
						floatingPlaceholder
						style={{ 
							borderBottomWidth: 0.5, 
							borderColor: Colors.$outlineDisabledHeavy,
						}}
						floatingPlaceholderStyle={{
							color: Colors.$textNeutralLight
						}}
					/>
				</View>
                <Button 
                    label="Add" 
                    onPress={addAid} 
                    disabled={!inputValid}
                    size={Button.sizes.small}
                    style={{
                        minHeight: 40,
                        borderColor: Colors.$outlineNeutral,
                        borderWidth: 1,
                        backgroundColor: inputValid ? Colors.$backgroundDefault : Colors.$backgroundDisabled,
                    }}
                    labelStyle={{
                        color: inputValid ? Colors.$textDefault : Colors.$textNeutralLight
                    }}
                />
            </View>

            {aids.length > 0 ? (
                <FlatList
                    data={aids}
                    keyExtractor={(item) => item}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 0 }}
                    renderItem={({item, index}) => {
                        const canMoveUp = index > 0;
                        const canMoveDown = index < aids.length - 1;

                        return (
                            <View marginB-5>
                                <Drawer
                                    style={{
                                        overflow: "hidden",
                                    }}
                                    leftItem={{
                                        customElement: (
                                            <FontAwesomeIcon icon={faTrash} style={{ color: Colors.buttonForeground }} />
                                        ),
                                        width: 60,
                                        background: Colors.red30,
                                        onPress: () => removeAid(item)
                                    }}
                                    rightItems={(() => {
                                        const items = [];
                                        if (canMoveUp) {
                                            items.push({
                                                customElement: (
                                                    <FontAwesomeIcon icon={faArrowUp} style={{ color: Colors.buttonForeground }} />
                                                ),
                                                width: 60,
                                                background: Colors.blue30,
                                                onPress: () => moveAidUp(item)
                                            });
                                        }
                                        if (canMoveDown) {
                                            items.push({
                                                customElement: (
                                                    <FontAwesomeIcon icon={faArrowDown} style={{ color: Colors.buttonForeground }} />
                                                ),
                                                width: 60,
                                                background: Colors.blue30,
                                                onPress: () => moveAidDown(item)
                                            });
                                        }
                                        return items.length > 0 ? items : undefined;
                                    })()}
                                >
                                <ListItem
                                    activeBackgroundColor="transparent"
                                    activeOpacity={0.6}
                                    paddingV-0
                                    paddingH-0
									style={{ height: 40 }}
                                    onPress={() => {
                                        Clipboard.setString(item);
                                        if (Platform.OS === 'android') {
                                            ToastAndroid.show('AID Copied', ToastAndroid.SHORT);
                                        }
                                    }}
                                >
                                    <ListItem.Part middle>
                                    <Text $textDefault text80M numberOfLines={1} style={{ fontFamily: 'monospace' }}>{item}</Text>
                                </ListItem.Part>
                            </ListItem>
                        </Drawer>
                    </View>
                    );
                    }}
                />
            ) : (
                <View flex centerV centerH style={{ minHeight: 100, marginBottom: 15 }}>
                    <Text $textNeutralLight text80>No AIDs configured</Text>
                </View>
            )}

            <View marginT-10>
                <View row style={{ justifyContent: 'flex-end', marginBottom: 8 }}>
                    <Button 
                        outline 
                        label="Reset to preset" 
                        onPress={onResetPreset}
                        size={Button.sizes.small}
                        style={{ 
                            marginRight: 8,
                            borderColor: Colors.$outlineNeutral,
                        }}
                        labelStyle={{
                            color: Colors.$textDefault
                        }}
                    />
                    <Button 
                        outline 
                        label="GSMA only" 
                        onPress={onGsmaOnly}
                        size={Button.sizes.small}
                        style={{
                            borderColor: Colors.$outlineNeutral,
                        }}
                        labelStyle={{
                            color: Colors.$textDefault
                        }}
                    />
                </View>
                <View row style={{ justifyContent: 'flex-end' }}>
                    <Button 
                        outline 
                        label="ESTK SE0" 
                        onPress={onEstkSe0}
                        size={Button.sizes.small}
                        style={{ 
                            marginRight: 8,
                            borderColor: Colors.$outlineNeutral,
                        }}
                        labelStyle={{
                            color: Colors.$textDefault
                        }}
                    />
                    <Button 
                        outline 
                        label="ESTK SE1" 
                        onPress={onEstkSe1}
                        size={Button.sizes.small}
                        style={{
                            borderColor: Colors.$outlineNeutral,
                        }}
                        labelStyle={{
                            color: Colors.$textDefault
                        }}
                    />
                </View>
            </View>
        </View>
    );
}
