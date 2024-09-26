import React, {useState} from 'react';
import {ScrollView, StyleSheet,} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SafeScreen} from '@/components/template';
import type {RootScreenProps} from "@/navigators/navigation";
import {Text} from "react-native-ui-lib";
import {ActionStatus} from "@/native/consts";
import BlockingLoader from "@/components/common/BlockingLoader";
import {ScannerInitial} from "@/components/Scanner/ScannerInitial";
import {ScannerAuthentication} from "@/components/Scanner/ScannerAuthentication";
import {ScannerResult} from "@/components/Scanner/ScannerResult";
import {ScannerEuicc} from "@/components/Scanner/ScannerEuicc";

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
