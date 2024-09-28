import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, ToastAndroid, TouchableOpacity,} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SafeScreen} from '@/components/template';
import {useTheme} from '@/theme';
import type {RootScreenProps} from "@/navigators/navigation";
import {
	Button,
	Chip,
	DateTimePicker,
	Dialog,
	PanningProvider,
	RadioButton,
	RadioGroup,
	Text,
	TextField,
	View
} from "react-native-ui-lib";
import {shallowEqual, useSelector} from "react-redux";
import {selectState} from "@/redux/reduxDataStore";
import BlockingLoader from "@/components/common/BlockingLoader";
import MetadataView from "@/components/common/MetadataView";
import InfiLPA from "@/native/InfiLPA";
import Title from "@/components/common/Title";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faSave} from "@fortawesome/free-solid-svg-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import {dateToDate6, parseMetadata, Tag} from "@/components/MainUI/ProfileList/parser";
import {Spacings} from "react-native-ui-lib/src/components/../style";
import Container from "@/components/common/Container";
import {Flags} from "@/assets/flags";
import {Colors} from "react-native-ui-lib/src/style";


function getUTF8Length(s: string) {
	return new TextEncoder().encode(s).length;
}

function Profile({ route,  navigation }: RootScreenProps<'Profile'>) {
	const { t } = useTranslation(['profile', 'welcome']);
	const { colors, gutters, fonts } = useTheme();
	const { eUICC, ICCID } = route.params;


	const device = eUICC.name;

	const [tags, setTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(false);

	const [metadata, setMetadata] = useState(route.params.metadata);
	const [nickname, setNickname] = useState('');
	const [country, setCountry] = useState('');


	const [tagModal, setTagModal] = useState<boolean>(false);
	const [newTagType, setNewTagType] = useState('date');
	const [tagValue, setTagValue] = useState('');

	const { euiccList } = useSelector(selectState, shallowEqual);

	useEffect(() => {
		const { tags, name, country } = parseMetadata(metadata, colors, t);
		setTags(tags as any);
		setNickname(name);
		setCountry(country);
	}, [metadata]);

	useEffect(() => {
		if (euiccList) {
			for(const eU of euiccList) {
				if (eU.eid == eUICC.eid) {
					for (const p of eU.profiles?.profiles || []) {
						if (p.profileMetadataMap.ICCID === ICCID) {
							setMetadata(p.profileMetadataMap);
						}
					}
				}
			}
		}
	}, [euiccList]);


	const tagChars = tags.length ? " " + (tags.map(t => t.rawValue)).join(" ") : "";

	const Flag = (Flags[country] || Flags.UN).default;

	const updateNickname = (n: string) => {
		setLoading(true);
		setTimeout(() => {
			try {
				InfiLPA.setNicknameByIccId(device, ICCID, n);
			} finally {
				setTimeout(() => {
					setLoading(false);
				}, 100);
			}
		}, 10);
	}

	return (
		<SafeScreen>
			{
				loading && (
					<BlockingLoader />
				)
			}
			<Title>{t('profile:profile_detail')}</Title>
			<Dialog
				useSafeArea
				center
				visible={tagModal}
				onDismiss={() => setTagModal(false)}
				panDirection={PanningProvider.Directions.RIGHT}
				renderPannableHeader={props => {
					const {title} = props;
					return (
						<View>
							<View marginH-20 marginV-15>
								<Text text60 color={colors.std200}>{title}</Text>
							</View>
							<View height={1} style={{ backgroundColor: colors.std500}} />
						</View>
					);
				}}
				pannableHeaderProps={{ title: t('profile:add_tag')}}
				containerStyle={{
					backgroundColor: colors.white,
					borderRadius: 12,
					shadowColor: colors.black,
					shadowOpacity: 0.05,
					shadowRadius: 12,
					shadowOffset: {height: 6, width: 0},
				}}
			>
				<View height={200} padding-20>
					<View flex-1>
						<RadioGroup initialValue={newTagType} onValueChange={setNewTagType}>
							<Text color={colors.std200}>{t('profile:add_tag_type')}:</Text>
							<View row marginT-10 gap-20>
								<RadioButton value={'date'} label={t('profile:tags_date')} labelStyle={{ color: colors.std200 }} />
								<RadioButton value={'text'} label={t('profile:tags_text')} labelStyle={{ color: colors.std200 }} />
							</View>
						</RadioGroup>
						<View marginT-20>
							{
								newTagType === 'date' ? (
									<DateTimePicker
										placeholder={t('profile:tags_date_placeholder')}
										mode={'date'}
										color={colors.std200}
										labelStyle={{ color: colors.std200 }}
										containerStyle={{ borderBottomWidth: 1, borderBottomColor: colors.std500 }}
										style={{ color: colors.std200 }}
										labelColor={colors.std200}
										placeholderTextColor={colors.std200}
										defaultValue={new Date().toISOString().split('T')[0]}
										dateTimeFormatter={v => v.toISOString().split('T')[0]}
										onChange={e => {
											setTagValue(`d:${dateToDate6(e)}`)
										}}
									/>
								) : newTagType === 'text' ? (
									<TextField
										placeholder={t('profile:tags_text_placeholder')}
										color={colors.std200}
										labelStyle={{ color: colors.std200 }}
										containerStyle={{ borderBottomWidth: 1, borderBottomColor: colors.std500 }}
										style={{ color: colors.std200 }}
										labelColor={colors.std200}
										placeholderTextColor={colors.std200}
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
					<View marginB-10 row gap-5>
						<Flag
							width={32}
							height={32}
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
								color={colors.std200}
								style={{ fontWeight: '500', flex: 1, flexWrap: 'wrap', padding: 0, fontSize: 20 }}
								adjustsFontSizeToFit
							>
								{nickname}
							</Text>
						</TouchableOpacity>
					</View>
					<View paddingT-20>
						<Text color={colors.std200} marginB-10 style={{ fontSize: 13 }}>Tags</Text>
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
										}}
										onDismiss={() => Alert.alert(
											t('profile:delete_tag'),
											t('profile:delete_tag_alert', {tag: tag.value}), [
												{
													text: t('profile:delete_tag_cancel'),
													onPress: () => {},
													style: 'cancel',
												},
												{
													text: t('profile:delete_tag_ok'),
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
											padding: 3,
											backgroundColor: tag.backgroundColor,
										}}
									/>
								)
							})}

							<Chip
								label={"＋"}
								labelStyle={{ fontSize: 22, paddingTop: 10 }}
								onPress={() => setTagModal(true)}
								containerStyle={{
									borderWidth: 0,
									backgroundColor: colors.blue400,
								}}
							/>
						</View>
					</View>
					<View paddingT-20>
						<View row spread center>
							<TextField
								placeholder={t('profile:rename_profile')}
								floatingPlaceholder
								value={nickname}
								onChangeText={c => setNickname(c)}
								validate={[e => {
									return !e || (getUTF8Length(e + tagChars) <= 64)
								}]}
								validationMessage={[t('profile:max_length_message')]}
								validateOnChange
								// validationMessagePosition={errorPosition}
								helperText={`${getUTF8Length(nickname + tagChars)}/64`}
								containerStyle={{flex: 1}}
								enableErrors
								style={{ borderBottomWidth: 1, borderColor: colors.std400, fontSize: 16, paddingRight: 3 }}
								color={colors.std200}
								showCharCounter
							/>
							<View>
								<Button
									disabled={loading}
									marginL-10
									style={{ borderRadius: 5, paddingHorizontal: 0, width: 50, height: 50, padding: 0 }}
									$iconDefault
									backgroundColor={colors.std400}
									labelProps={{
										style: {width: 10, padding: 10}
									}}
									round
									onPress={() => {
										setLoading(true);
										updateNickname(nickname + tagChars);
									}}
								>
									<FontAwesomeIcon icon={faSave} style={{ color: colors.std900 }} />
								</Button>
							</View>
						</View>
					</View>
					<View marginT-40>
						<MetadataView metadata={metadata} />
					</View>
					{
						metadata.STATE === "Disabled" && (

							<View flex row marginT-40>
								<Button
									link
									label={t('profile:delete_profile')}
									color={colors.red500}
									onPress={() => Alert.alert(
										t('profile:delete_profile'),
										t('profile:delete_profile_alert_body'), [
											{
												text: t('profile:delete_tag_cancel'),
												onPress: () => {},
												style: 'cancel',
											},
											{
												text: t('profile:delete_tag_ok'),
												style: 'destructive',
												onPress: () => {
													Alert.alert(
														t('profile:delete_profile_alert2'),
														t('profile:delete_profile_alert2_body'), [
															{
																text: t('profile:delete_tag_ok'),
																style: 'destructive',
																onPress: () => {
																	setLoading(true);
																	setTimeout(() => {
																		try {
																			InfiLPA.deleteProfileByIccId(device, ICCID);
																		} finally {
																			setTimeout(() => {
																				setLoading(false);
																				navigation.goBack();
																			}, 100);
																		}
																	}, 10);
																}
															},
															{
																text: t('profile:delete_tag_cancel'),
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
