import React, {useState} from 'react';
import {ScrollView, StyleSheet,} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SafeScreen} from '@/components/template';
import type {RootScreenProps} from "@/navigators/navigation";
import {Text} from "react-native-ui-lib";
import {ScannerInitial} from "@/components/Scanner/ScannerInitial";
import {ScannerAuthentication} from "@/components/Scanner/ScannerAuthentication";
import {ScannerResult} from "@/components/Scanner/ScannerResult";
import {ScannerEuicc} from "@/components/Scanner/ScannerEuicc";
import {version} from '@/../package.json';
import {storage} from "@/redux/reduxDataStore";
import {sizeStats} from "@/storage/sizeStats";

const REPORTING_URL = "https://nlpa-data.nekoko.ee/api/collection/install";

function Scanner({ route,  navigation }: RootScreenProps<'Scanner'>) {

	const { eUICC: _eUICC, appLink } = route.params;
	const { t } = useTranslation(['profile']);

	const [eUICC, setEUICC] = useState(_eUICC);
	const [scanState, setScanState] = useState(eUICC ? 0 : -1);
	const [authenticateResult, setAuthenticateResult] = useState(null);
	const [downloadResult, setDownloadResult] = useState(null);
	const [confirmationCode, setConfirmationCode] = useState('');

	return (
		<SafeScreen>
			<ScrollView>
				{
					scanState === -1 ? (
						<ScannerEuicc
							appLink={appLink}
							eUICC={eUICC}
							finishAuthenticate={({ authenticateResult, confirmationCode } : any) => {
								setAuthenticateResult(authenticateResult);
								setConfirmationCode(confirmationCode);
								setScanState(1);
							}}
							setEUICC={setEUICC}
						/>
					) : scanState === 0 ? (
						<ScannerInitial
							appLink={appLink}
							eUICC={eUICC}
							finishAuthenticate={({ authenticateResult, confirmationCode } : any) => {
								setAuthenticateResult(authenticateResult);
								setConfirmationCode(confirmationCode);
								setScanState(1);
							}}
						/>
					) : scanState === 1 ? (
						<ScannerAuthentication
							eUICC={eUICC}
							initialConfirmationCode={confirmationCode}
							authenticateResult={authenticateResult}
							goBack={() => {
								setScanState(0);
							}}
							confirmDownload={({ downloadResult }: any) => {
								// @ts-ignore
								const m = authenticateResult.profileMetadata.profileMetadataMap;
								const v = {
									eid: eUICC?.eid,
									eum: eUICC?.eid?.substring(0, 8),
									eUICCVersion: eUICC?.version,
									...downloadResult,
									profileProvider: m.PROVIDER_NAME,
									profileName: m.NAME,
									profileMccMnc: m.uMCC_MNC,
									version: version,
								};
								fetch(REPORTING_URL, {
									method: 'POST',
									headers: {
										'Accept': 'application/json',
										'Content-Type': 'application/json'
									},
									body: JSON.stringify(v)
								}).then((d) => d.json()).then((data: any) => console.log("reported", data));

								if (downloadResult?.deltaSpace) {
									sizeStats.set(m.uICCID, downloadResult.deltaSpace);
								}


								setDownloadResult(downloadResult);
								setScanState(3);
							}}
						/>
					) : scanState === 3 ? (
						<ScannerResult
							eUICC={eUICC}
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
const styles = StyleSheet.create({
	tableHeader:{ width: 80, flexGrow: 0, flexShrink: 0, fontSize: 17 },
	tableColumn:{ flexGrow: 1, flexShrink: 0, fontSize: 17 },
	tableRow:{ flexDirection: "row", flex: 1, gap: 10 },
})

export default Scanner;
