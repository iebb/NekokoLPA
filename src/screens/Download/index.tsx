import React, {useState} from 'react';
import {Platform, ScrollView,} from 'react-native';
import SafeScreen from '@/theme/SafeScreen';
import type {RootScreenProps} from "@/screens/navigation";
import {Text} from "react-native-ui-lib";
import {ScannerInitial} from "@/screens/Download/Scanner/ScannerInitial";
import {ScannerAuthentication} from "@/screens/Download/Scanner/ScannerAuthentication";
import {ScannerResult} from "@/screens/Download/Scanner/ScannerResult";
import {version} from '../../../package.json';
import {sizeStats} from "@/storage/mmkv";
import {Adapters} from "@/native/adapters/registry";
import {useSelector} from "react-redux";
import {selectDeviceState} from "@/redux/stateStore";

const REPORTING_URL = "https://nlpa-data.nekoko.ee/api/collection/v2";

function Scanner({ route,  navigation }: RootScreenProps<'Scanner'>) {

	const { deviceId, appLink } = route.params;

	const DeviceState = deviceId ? useSelector(selectDeviceState(deviceId)) : null;
	const [scanState, setScanState] = useState(0);
	const [authenticateResult, setAuthenticateResult] = useState(null);
	const [downloadResult, setDownloadResult] = useState(null);
	const [confirmationCode, setConfirmationCode] = useState('');
	const [smdpAddress, setSmdpAddress] = useState('');
	const adapter = deviceId ? Adapters[deviceId] : null;


	return (
		<SafeScreen>
				<ScrollView>
					{
						scanState === 0 ? (
							<ScannerInitial
								appLink={appLink}
								adapter={adapter}
								deviceId={deviceId}
								eUICC={DeviceState}
								finishAuthenticate={({ authenticateResult, smdp, confirmationCode } : any) => {
									setAuthenticateResult(authenticateResult);
									setSmdpAddress(smdp);
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
										smdpAddress,
										...downloadResult,
										...(authenticateResult || {}),
										appVersion: version,
										appOS: Platform.OS,
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

									if (downloadResult?.space_consumed) {
										sizeStats.set(m.iccid, downloadResult.space_consumed);
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
		</SafeScreen>
	);
}

export default Scanner;
