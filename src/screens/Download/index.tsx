import React, {useState} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet,} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SafeScreen} from '@/components/template';
import type {RootScreenProps} from "@/navigators/navigation";
import {Text} from "react-native-ui-lib";
import {ScannerInitial} from "@/screens/Download/Scanner/ScannerInitial";
import {ScannerAuthentication} from "@/screens/Download/Scanner/ScannerAuthentication";
import {ScannerResult} from "@/screens/Download/Scanner/ScannerResult";
import {ScannerEuicc} from "@/screens/Download/Scanner/ScannerEuicc";
import {version} from '../../../package.json';
import {sizeStats} from "@/storage/mmkv";
import {Adapters} from "@/native/adapters/registry";
import {useSelector} from "react-redux";
import {selectDeviceState} from "@/redux/stateStore";

const REPORTING_URL = "https://nlpa-data.nekoko.ee/api/collection/v2";

function Scanner({ route,  navigation }: RootScreenProps<'Scanner'>) {

	const { deviceId, appLink } = route.params;
	const { t } = useTranslation(['profile']);

	const DeviceState = deviceId ? useSelector(selectDeviceState(deviceId)) : null;
	const [scanState, setScanState] = useState(deviceId ? 0 : -1);
	const [authenticateResult, setAuthenticateResult] = useState(null);
	const [downloadResult, setDownloadResult] = useState(null);
	const [confirmationCode, setConfirmationCode] = useState('');
	const adapter = deviceId ? Adapters[deviceId] : null;


	return (
		<SafeScreen>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<ScrollView>
					{
						scanState === -1 ? (
							<ScannerEuicc
								appLink={appLink}
								eUICC={DeviceState}
								finishAuthenticate={({ authenticateResult, confirmationCode } : any) => {
									setAuthenticateResult(authenticateResult);
									setConfirmationCode(confirmationCode);
									setScanState(1);
								}}
								setEUICC={() => {

								}}
							/>
						) : scanState === 0 ? (
							<ScannerInitial
								appLink={appLink}
								adapter={adapter}
								deviceId={deviceId}
								eUICC={DeviceState}
								finishAuthenticate={({ authenticateResult, confirmationCode } : any) => {
									setAuthenticateResult(authenticateResult);
									setConfirmationCode(confirmationCode);
									setScanState(1);
								}}
							/>
						) : scanState === 1 ? (
							<ScannerAuthentication
								eUICC={DeviceState}
								adapter={adapter}
								deviceId={deviceId}
								initialConfirmationCode={confirmationCode}
								authenticateResult={authenticateResult}
								goBack={() => {
									setScanState(0);
								}}
								confirmDownload={({ downloadResult }: any) => {
									// @ts-ignore
									const m = authenticateResult.profile;
									const v = {
										...downloadResult,
										...(authenticateResult || {}),
									};
									delete v["_internal"];
									fetch(REPORTING_URL, {
										method: 'POST',
										headers: {
											'Accept': 'application/json',
											'Content-Type': 'application/json'
										},
										body: JSON.stringify(v)
									}).then((d) => d.json()).then((data: any) => console.log("reported", data));

									if (downloadResult?.deltaSpace) {
										sizeStats.set(m.iccid, downloadResult.deltaSpace);
									}

									setDownloadResult(downloadResult);
									setScanState(3);
								}}
							/>
						) : scanState === 3 ? (
							<ScannerResult
								eUICC={DeviceState}
								adapter={adapter}
								deviceId={deviceId}
								initialConfirmationCode={confirmationCode}
								authenticateResult={authenticateResult}
								downloadResult={downloadResult}
								goBack={() => {
									setScanState(0);
									setDownloadResult(null);
									setAuthenticateResult(null);
									navigation.goBack();
								}}
							/>
						) : (
							<Text>Unknown</Text>
						)
					}
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeScreen>
	);
}

export default Scanner;
