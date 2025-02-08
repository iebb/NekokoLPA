import React, {useEffect, useState} from 'react';
import {Alert, Image, ScrollView, ToastAndroid, TouchableOpacity,} from 'react-native';
import {useTranslation} from 'react-i18next';
import SafeScreen from '@/theme/SafeScreen';
import type {RootScreenProps} from "@/screens/navigation";
import {
	Button,
	Chip,
	Colors,
	DateTimePicker,
	Dialog,
	PanningProvider,
	RadioButton,
	RadioGroup,
	Text,
	TextField,
	View
} from "react-native-ui-lib";
import {useSelector} from "react-redux";
import BlockingLoader from "@/components/common/BlockingLoader";
import MetadataView from "@/components/common/MetadataView";
import Title from "@/components/common/Title";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faSave} from "@fortawesome/free-solid-svg-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import {dateToDate6, parseMetadata, Tag} from "@/utils/parser";
import {Spacings} from "react-native-ui-lib/src/components/../style";
import Container from "@/components/common/Container";
import {Flags} from "@/assets/flags";
import {makeLoading} from "@/components/utils/loading";
import {Adapters} from "@/native/adapters/registry";
import {selectDeviceState} from "@/redux/stateStore";
import {getUTF8Length} from "@/utils/encoding";


function Profile({ route,  navigation }: RootScreenProps<'Profile'>) {
	const { t } = useTranslation(['main']);
	const { deviceId, iccid } = route.params;


	const adapter = Adapters[deviceId];

	const [tags, setTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(false);
	const [nickname, setNickname] = useState('');
	const [country, setCountry] = useState('');


	const [tagModal, setTagModal] = useState<boolean>(false);
	const [newTagType, setNewTagType] = useState('date');
	const [tagValue, setTagValue] = useState('');

	const DeviceState = useSelector(selectDeviceState(deviceId));
	const metadata = DeviceState.profiles.find(m => m.iccid === iccid)!;

	useEffect(() => {
		const { tags, name, country } = parseMetadata(metadata, t, false);
		setTags(tags as any);
		setNickname(name);
		setCountry(country);
	}, [metadata]);

	const tagChars = tags.length ? " " + (tags.map(t => t.rawValue)).join(" ") : "";

	const updateNickname = (n: string) => {
		makeLoading(setLoading, async () => {
			await adapter.setNicknameByIccId(iccid, n);
		});
	}

	return (
		<SafeScreen>
			{
				loading && (
					<BlockingLoader />
				)
			}
			<Title>{t('main:profile_profile_detail')}</Title>
			<Dialog
				useSafeArea
				bottom
				visible={tagModal}
				onDismiss={() => setTagModal(false)}
				panDirection={PanningProvider.Directions.DOWN}
				renderPannableHeader={props => {
					const {title} = props;
					return (
						<View>
							<View marginH-20 marginV-15>
								<Text $textDefault text60>{title}</Text>
							</View>
							<View height={1} style={{ backgroundColor: Colors.$outlineDisabledHeavy}} />
						</View>
					);
				}}
				pannableHeaderProps={{ title: t('main:profile_add_tag')}}
				containerStyle={{
					backgroundColor: Colors.$backgroundElevatedLight,
					borderRadius: 12,
					shadowColor: Colors.$backgroundElevated,
					shadowOpacity: 0.05,
					shadowRadius: 12,
					shadowOffset: {height: 6, width: 0},
				}}
			>
				<View height={200} padding-20>
					<View flex-1>
						<RadioGroup initialValue={newTagType} onValueChange={setNewTagType}>
							<View row marginT-10 gap-20>
								<Text $textDefault>{t('main:profile_add_tag_type')}:</Text>
								<RadioButton value={'date'} label={t('main:profile_tags_date')} />
								<RadioButton value={'text'} label={t('main:profile_tags_text')} />
							</View>
						</RadioGroup>
						<View marginT-20>
							{
								newTagType === 'date' ? (
									<DateTimePicker
										placeholder={t('main:profile_tags_date_placeholder')}
										mode={'date'}
										containerStyle={{ borderBottomWidth: 1, borderBottomColor: Colors.$outlineDisabledHeavy }}
										defaultValue={new Date().toISOString().split('T')[0]}
										dateTimeFormatter={e => new Date(+e - new Date().getTimezoneOffset() * 60 * 1000).toISOString().split('T')[0]}
										onChange={e => {
											const _nd = new Date(+e - new Date().getTimezoneOffset() * 60 * 1000);
											setTagValue(`d:${dateToDate6(_nd)}`)
										}}
									/>
								) : newTagType === 'text' ? (
									<TextField
										placeholder={t('main:profile_tags_text_placeholder')}
										containerStyle={{ borderBottomWidth: 1 }}
										onChangeText={c => {
											setTagValue(`t:${c.replaceAll(" ", "_")}`)
										}}
									/>
								) : null
							}
						</View>
					</View>
					<View right>
						<Button label="Done" onPress={() => {
							if (tagValue.length) {
								updateNickname(nickname + tagChars + " " + tagValue);
								setTagValue('');
							}
							setTagModal(false);
						}} />
					</View>
				</View>
			</Dialog>
			<Container>
				<ScrollView>
					<View row gap-5>
						<Image
							style={{width: 20, height: 20}}
							source={Flags[country] || Flags.UN}
						/>
						<TouchableOpacity
							style={{ flex: 1, marginLeft: 5 }}
							onPress={() => {
								if (nickname) {
									Clipboard.setString(nickname);
									ToastAndroid.show('Copied', ToastAndroid.SHORT);
								}
							}}
						>
							<Text
								$textDefault
								text60L
								adjustsFontSizeToFit
							>
								{nickname}
							</Text>
						</TouchableOpacity>
					</View>
					<View marginB-10 row gap-5>
						<Text
							text80L
							$textNeutral
							adjustsFontSizeToFit
						>
							{metadata.serviceProviderName}
						</Text>
					</View>
					<View paddingT-20>
						<Text marginB-10 text70L $textDefault>Tags</Text>
						<View flex row gap-10 style={{ flexWrap: "wrap" }}>
							{tags.map((tag, i) => {
								return (
									<Chip
										key={i}
										resetSpacings
										label={tag.value}
										labelStyle={{
											marginRight: Spacings.s1,
											fontWeight: '500',
											color: tag.color,
										}}
										onDismiss={() => Alert.alert(
											t('main:profile_delete_tag'),
											t('main:profile_delete_tag_alert', {tag: tag.value}), [
												{
													text: t('main:profile_delete_tag_cancel'),
													onPress: () => {},
													style: 'cancel',
												},
												{
													text: t('main:profile_delete_tag_ok'),
													style: 'destructive',
													onPress: () => {
														updateNickname(
															(nickname + " " + tags.filter(
																tag_ => tag_.value !== tag.value
															).map(tag => tag.rawValue).join(" ")).trimEnd()
														);
													}
												},
											])}
										dismissIconStyle={{width: 10, height: 10, paddingHorizontal: Spacings.s2}}
										dismissColor={tag.color}
										paddingL-10
										containerStyle={{
											borderWidth: 0,
											padding: 7,
											backgroundColor: tag.backgroundColor,
										}}
									/>
								)
							})}

							<Chip
								label={"＋"}
								resetSpacings
								labelStyle={{
									fontSize: 22,
									paddingTop: 10, paddingLeft: 0, paddingRight: 0,
									textAlign: 'center',
									width: 30,
									color: Colors.buttonForeground
								}}
								onPress={() => setTagModal(true)}
								containerStyle={{
									borderWidth: 0,
									backgroundColor: Colors.buttonBackground,
								}}
							/>
						</View>
					</View>
					<View paddingT-20>
						<View row spread center>
							<TextField
								placeholder={t('main:profile_rename_profile')}
								floatingPlaceholder
								value={nickname}
								onChangeText={c => setNickname(c)}
								validate={[e => {
									return !e || (getUTF8Length(e + tagChars) <= 64)
								}]}
								validationMessage={[t('main:profile_max_length_message')]}
								validateOnChange
								// validationMessagePosition={errorPosition}
								helperText={`${getUTF8Length(nickname + tagChars)}/64`}
								containerStyle={{flex: 1}}
								enableErrors
								style={{ borderBottomWidth: 1, borderColor: Colors.$outlineDisabledHeavy, fontSize: 16, paddingRight: 3 }}
								showCharCounter
							/>
							<View>
								<Button
									disabled={loading}
									marginL-10
									style={{ borderRadius: 5, paddingHorizontal: 0, width: 50, height: 50, padding: 0 }}
									$iconDefault
									labelProps={{
										style: {width: 10, padding: 10}
									}}
									round
									onPress={() => {
										setLoading(true);
										updateNickname(nickname + tagChars);
									}}
								>
									<FontAwesomeIcon icon={faSave} style={{ color: Colors.buttonForeground }} />
								</Button>
							</View>
						</View>
					</View>
					<View marginT-40>
						<MetadataView metadata={metadata} />
					</View>
					{
						(metadata.profileState === 0) && (

							<View flex row marginT-40>
								<Button
									link
									label={t('main:profile_delete_profile')}
									color={Colors.$textDangerLight}
									onPress={() => Alert.alert(
										t('main:profile_delete_profile'),
										t('main:profile_delete_profile_alert_body'), [
											{
												text: t('main:profile_delete_tag_cancel'),
												onPress: () => {},
												style: 'cancel',
											},
											{
												text: t('main:profile_delete_tag_ok'),
												style: 'destructive',
												onPress: () => {
													Alert.alert(
														t('main:profile_delete_profile_alert2'),
														t('main:profile_delete_profile_alert2_body'), [
															{
																text: t('main:profile_delete_tag_ok'),
																style: 'destructive',
																onPress: () => {
																	makeLoading(() => {
																		setLoading(false);
																		navigation.goBack();
																	}, async () => {
																		await adapter.deleteProfileByIccId(iccid);
																		await adapter.processNotifications(iccid);
																	});
																}
															},
															{
																text: t('main:profile_delete_tag_cancel'),
																onPress: () => {},
																style: 'cancel',
															},
														])
												}
											},
										])
									}
								/>
								<View />
							</View>
						)
					}
				</ScrollView>
			</Container>
		</SafeScreen>
	);

}

export default Profile;
