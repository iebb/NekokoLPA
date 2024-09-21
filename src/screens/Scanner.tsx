import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet,} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SafeScreen} from '@/components/template';
import {useTheme} from '@/theme';
import type {RootScreenProps} from "@/navigators/navigation";
import {Camera, useCameraDevice, useCameraPermission, useCodeScanner} from "react-native-vision-camera";
import {Button, Checkbox, Colors, Text, TextField, View} from "react-native-ui-lib";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faArrowLeftLong, faCancel, faCheck, faCheckCircle, faDownload} from "@fortawesome/free-solid-svg-icons";
import InfiLPA from "@/native/InfiLPA";
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import {RootState, selectEuicc, setState} from "@/redux/reduxDataStore";
import {ActionStatus, CancelSessionReasons} from "@/native/consts";
import BlockingLoader from "@/components/common/BlockingLoader";
import RemoteErrorView from "@/components/common/RemoteErrorView";
import MetadataView from "@/components/common/MetadataView";
import Title from "@/components/common/Title";
import Container from "@/components/common/Container";


const LPACode = /^((LPA:1)\$([^$]+)\$([A-Z0-9-]+)(?:\$([0-9]+(?:\.[0-9]+)*)?)?(?:\$(1))?)?$/;

const filteredStates = [
	ActionStatus.AUTHENTICATE_DOWNLOAD_STARTED,
	ActionStatus.AUTHENTICATE_DOWNLOAD_FINISHED,
	ActionStatus.DOWNLOAD_PROFILE_STARTED,
	ActionStatus.DOWNLOAD_PROFILE_FINISHED,
]

function Scanner({ navigation }: RootScreenProps<'Scanner'>) {
	const { t } = useTranslation(['profile']);

	const {currentEuicc} = useSelector((state: RootState) => state.LPA);
	const dispatch = useDispatch();
	const {
		downloadResult, eid,
		authenticateResult, status
	} = useSelector(selectEuicc(currentEuicc), shallowEqual);

	const {
		colors,
		gutters,
		fonts,
		navigationTheme,
	} = useTheme();

	const [scanState, setScanState] = useState(0);

	const [smdp, setSmdp] = useState("");
	const [acToken, setAcToken] = useState("");
	const [oid, setOid] = useState("");
	const [confirmationCode, setConfirmationCode] = useState("");
	const [confirmationCodeReq, setConfirmationCodeReq] = useState(false);

	const [size, setSize] = useState<number>(0);
	const { hasPermission, requestPermission } = useCameraPermission();

	const processLPACode = (str: string) => {
		const match = str.match(LPACode);

		if (match) {
			const [_1, _2, LPA, SMDP, AC_TOKEN, OID, CONFIRMATION_CODE] = match;
			setSmdp(SMDP);
			setAcToken(AC_TOKEN);
			setOid(OID);
			setConfirmationCodeReq(CONFIRMATION_CODE === "1");
			setConfirmationCode("");
		}
	}

	const codeScanner = useCodeScanner({
		codeTypes: ['qr'],
		onCodeScanned: (codes) => {
			for(const code of codes) {
				const match = code.value!.match(LPACode);

				if (match) {
					const [_1, _2, LPA, SMDP, AC_TOKEN, OID, CONFIRMATION_CODE] = match;
					setSmdp(SMDP);
					setAcToken(AC_TOKEN);
					setOid(OID);
					setConfirmationCodeReq(CONFIRMATION_CODE === "1");
					setConfirmationCode("");
				}
			}
		}
	})
	const device = useCameraDevice('back');

	useEffect(() => {
		if (!hasPermission) {
			requestPermission().then();
		}
	}, [hasPermission]);

	useEffect(() => {
		// authenticateResult?.profileMetadata?.profileMetadataMap?.uMCC_MNC
		if ((scanState != 0 && status) || status === ActionStatus.AUTHENTICATE_DOWNLOAD_STARTED) {
			if (filteredStates.includes(status)) {
				setScanState(status);
			}
		}
	}, [status]);

	// useEffect(() => {
	// 	dispatch(setState([{status: 0}, currentEuicc]));
	// }, []);

	const clearState = () => {
		setScanState(0);
		dispatch(setState([{authenticateResult: null, downloadResult: null, status: 0}, currentEuicc]));
	}

	console.log(status);
	console.log(scanState);
	console.log(authenticateResult);

	return (
		<SafeScreen>
			{
				scanState === ActionStatus.AUTHENTICATE_DOWNLOAD_STARTED && (
					<BlockingLoader message={t('profile:loading_validating_profile')} />
				)
			}
			{
				scanState === ActionStatus.DOWNLOAD_PROFILE_STARTED && (
					<BlockingLoader message={t('profile:loading_download_profile')} />
				)
			}
			<ScrollView>
				{
					(scanState === ActionStatus.AUTHENTICATE_DOWNLOAD_FINISHED || scanState === ActionStatus.DOWNLOAD_PROFILE_STARTED) ? (
						(authenticateResult && (
							((authenticateResult?.success) ? (
								<View>
									<Title>{t('profile:title_confirm_profile')}</Title>
									{
										(authenticateResult?.success) ? (<Container>
												<MetadataView metadata={authenticateResult.profileMetadata.profileMetadataMap} />
												<View left style={{
													flexDirection: "column", display: "flex",
													justifyContent: "space-between", gap: 10
												}}>
													{
														(authenticateResult.isCcRequired) && (
															<View style={styles.tableRow}>
																<Text style={styles.tableHeader} color={colors.std200}>
																	{t('profile:conf_code')}:
																</Text>
																<TextField
																	placeholder={'Activation Code'}
																	value={confirmationCode}
																	onChangeText={c => setConfirmationCode(c)}
																	enableErrors
																	validate={['required']}
																	validationMessage={['Field is required']}
																	style={{...styles.tableColumn, borderBottomWidth: 1, marginBottom: -10, flexGrow: 1, marginTop: -5 }}
																/>
															</View>
														)
													}
												</View>
												<View flex>
													<View flex row style={{ gap: 10 }}>
														<Button
															style={{ flex: 1, ...gutters.marginVertical_12 }}
															backgroundColor={Colors.red20}
															onPress={() => {
																clearState();
																InfiLPA.cancelSession(CancelSessionReasons.END_USER_REJECTION);
															}}
														>
															<FontAwesomeIcon
																icon={faCancel}
																style={{ color: colors.constWhite }}
															/>
															<Text
																style={{ color: colors.constWhite, marginLeft: 10 }}
															>{t('profile:ui_cancel')}</Text>
														</Button>
														<Button
															style={{ flex: 10, ...gutters.marginVertical_12 }}
															color={Colors.green50}
															onPress={() => {
																InfiLPA.downloadProfile(confirmationCode);
															}}
														>
															<FontAwesomeIcon
																icon={faDownload}
																style={{ color: colors.constWhite }}
															/>
															<Text
																style={{ color: colors.constWhite, marginLeft: 10 }}
															>{t('profile:ui_download')}</Text>
														</Button>
													</View>
												</View>
											</Container>
										) : (
											<View>
											</View>
										)
									}
								</View>
							) : (
								<Container>
									<View flex style={{ gap: 20 }}>
										<Text center text60 color={colors.std200}>
											{t('profile:download_failure')}
										</Text>
										<RemoteErrorView remoteError={authenticateResult?.remoteError} />
										<View flex>
											<View flex style={{ flexDirection: "row", gap: 10 }}>
												<Button
													style={{ flex: 1, ...gutters.marginVertical_12 }}
													backgroundColor={colors.gray600}
													onPress={() => {
														clearState();
													}}
												>
													<FontAwesomeIcon
														icon={faCancel}
														style={{ color: colors.constWhite }}
													/>
													<Text
														style={{ color: colors.constWhite, marginLeft: 10 }}
													>{t('profile:ui_back')}</Text>
												</Button>
											</View>
										</View>
									</View>
								</Container>
							))
						))
					) : (scanState === ActionStatus.DOWNLOAD_PROFILE_FINISHED && authenticateResult) ? (
						<View>
							<Title>{t('profile:title_download_profile')}</Title>
							{
								(
									downloadResult && (
										(downloadResult?.success) ?
											(
												<Container>
													<View center style={{ marginVertical: 20 }}>
														<FontAwesomeIcon icon={faCheckCircle} size={80} color={colors.green500} />
													</View>
													<Text center text60 color={colors.std200}>
														{t('profile:download_success')}
													</Text>
													<MetadataView metadata={authenticateResult.profileMetadata.profileMetadataMap} />
													<View left style={{
														marginTop: 50,
														flexDirection: "column", display: "flex",
														justifyContent: "space-between", gap: 10
													}}>
														{
															(authenticateResult.isCcRequired) && (
																<View style={styles.tableRow}>
																	<Text style={styles.tableHeader} color={colors.std200}>
																		{t('profile:conf_code')}:
																	</Text>
																	<TextField
																		placeholder={'Activation Code'}
																		value={confirmationCode}
																		onChangeText={c => setConfirmationCode(c)}
																		enableErrors
																		validate={['required']}
																		validationMessage={['Field is required']}
																		style={{...styles.tableColumn, borderBottomWidth: 1, marginBottom: -10, flexGrow: 1, marginTop: -5 }}
																	/>
																</View>
															)
														}
													</View>
													<View flex>
														<View flex style={{ flexDirection: "row", gap: 10 }}>
															<Button
																style={{ flex: 1, ...gutters.marginVertical_12 }}
																backgroundColor={colors.gray500}
																onPress={() => {
																	clearState();
																	navigation.goBack();
																}}
															>
																<FontAwesomeIcon
																	icon={faArrowLeftLong}
																	style={{ color: colors.constWhite }}
																/>
																<Text
																	style={{ color: colors.constWhite, marginLeft: 10 }}
																>{t('profile:ui_back')}</Text>
															</Button>
															<Button
																style={{ flex: 1, ...gutters.marginVertical_12 }}
																backgroundColor={Colors.green500}
																onPress={() => {
																	InfiLPA.enableProfileByIccId(authenticateResult.profileMetadata.profileMetadataMap.ICCID);
																	clearState();
																	navigation.goBack();
																}}
															>
																<FontAwesomeIcon
																	icon={faCheck}
																	style={{ color: colors.constWhite }}
																/>
																<Text
																	style={{ color: colors.constWhite, marginLeft: 10 }}
																>{t('profile:ui_enable')}</Text>
															</Button>
														</View>
													</View>
												</Container>
											) : (
												<Container>
													<View flex style={{ gap: 20 }}>
														<Text center text60 color={colors.std200}>
															{t('profile:download_failure')}
														</Text>
														<RemoteErrorView remoteError={downloadResult?.remoteError} />
														<View flex>
															<View flex style={{ flexDirection: "row", gap: 10 }}>
																<Button
																	style={{ flex: 1, ...gutters.marginVertical_12 }}
																	backgroundColor={colors.gray500}
																	onPress={() => {
																		clearState();
																		navigation.goBack();
																	}}
																>
																	<FontAwesomeIcon
																		icon={faCancel}
																		style={{ color: colors.constWhite }}
																	/>
																	<Text
																		style={{ color: colors.constWhite, marginLeft: 10 }}
																	>{t('profile:ui_back')}</Text>
																</Button>
															</View>
														</View>
													</View>
												</Container>
											)
									)
								)
							}
						</View>
					) : (
						/* scan page */
						<View>
							<Title>{t('profile:title_download_profile')}</Title>
							<Container>
								<View
									flex
									style={{ gap: 10 }}
									onLayout={(e) => {
										setSize(
											Math.min(e.nativeEvent.layout.width - 100, 200)
										);
									}}
								>
									<View center>
										<Text text70M color={colors.std200}>
											{t('profile:scan_qr_prompt')}
										</Text>
									</View>
									<View center style={{ borderRadius: 30 }}>
										<View
											style={{ width: size, height: size, borderRadius: 20, overflow: "hidden" }}
										>
											{
												device && hasPermission ? (
													<Camera
														device={device}
														isActive
														codeScanner={codeScanner}
														style={{ width: size, height: size}}
													/>
												) : (
													<Text color={colors.std200}>
														{t('profile:camera_unsupported')}
													</Text>
												)
											}
										</View>
									</View>
									<Button
										style={[gutters.marginVertical_12]}
										borderRadius={210}
										backgroundColor={colors.blue500}
										onPress={() => {
											InfiLPA.authenticateWithCode(`LPA:1$${smdp}$${acToken}${(oid || confirmationCodeReq) ? "$" + oid : ""}${confirmationCodeReq ? "$1" : ""}`);
										}}
									>
										<FontAwesomeIcon icon={faDownload} style={{ color: Colors.$backgroundDefault }} />
										<Text
											style={{ color: colors.blue50, marginLeft: 10 }}
										>{t('profile:ui_download')}</Text>
									</Button>
									<View style={{ padding: 10, display: "flex", gap: 0, paddingVertical: 10 }}>
										<TextField
											placeholder={'SM-DP'}
											floatingPlaceholder
											value={smdp}
											onChangeText={c => c.includes('$') ? processLPACode(c) : setSmdp(c)}
											enableErrors
											validate={['required']}
											validationMessage={['Field is required']}
											color={colors.std200}
											style={{ borderBottomWidth: 1, marginBottom: -10, borderColor: colors.std400 }}
										/>
										<TextField
											placeholder={'Matching ID'}
											floatingPlaceholder
											value={acToken}
											onChangeText={c => c.includes('$') ? processLPACode(c) : setAcToken(c)}
											enableErrors
											color={colors.std200}
											style={{ borderBottomWidth: 1, marginBottom: -10, borderColor: colors.std400 }}
										/>
										<TextField
											placeholder={'OID'}
											floatingPlaceholder
											value={oid}
											onChangeText={c => c.includes('$') ? processLPACode(c) : setOid(c)}
											enableErrors
											color={colors.std200}
											style={{ borderBottomWidth: 1, marginBottom: -10, borderColor: colors.std400 }}
										/>
										<Checkbox
											label={t('profile:download_confcode_required')}
											value={confirmationCodeReq}
											labelStyle={{
												marginLeft: 10,
												color: colors.std200,
											}}
											onValueChange={v => setConfirmationCodeReq(v)}
										/>
									</View>
								</View>
							</Container>
						</View>
					)
				}
			</ScrollView>
		</SafeScreen>
	);
}
const styles = StyleSheet.create({
	tableHeader:{ width: 80, flexGrow: 0, flexShrink: 0, fontSize: 17 },
	tableColumn:{ flexGrow: 1, flexShrink: 0, fontSize: 17 },
	tableRow:{ flexDirection: "row", flex: 1, gap: 10 },
})

export default Scanner;
