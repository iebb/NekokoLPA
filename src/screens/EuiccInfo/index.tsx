import React from 'react';
import {FlatList, ToastAndroid,} from 'react-native';
import {useTranslation} from 'react-i18next';
import SafeScreen from '@/theme/SafeScreen';
import type {RootScreenProps} from "@/screens/navigation";
import Title from "@/components/common/Title";
import {Button, Colors, ListItem, Text} from "react-native-ui-lib";
import {useSelector} from "react-redux";
import {selectDeviceState} from "@/redux/stateStore";
import Clipboard from "@react-native-clipboard/clipboard";
import {formatSize} from "@/utils/size";
import {Adapters} from "@/native/adapters/registry";

export type EuiccInfoDataType = {
	key: string;
	raw?: any;
	rendered: any;
	element?: any;
}

function EuiccInfo({ route,  navigation }: RootScreenProps<'EuiccInfo'>) {
	const { deviceId } = route.params;
	const DeviceState = useSelector(selectDeviceState(deviceId!));
	const adapter = Adapters[deviceId];

	const { t } = useTranslation(['main']);

	const { eid, euiccAddress, euiccInfo2 } = DeviceState;


	const renderRow = (row: EuiccInfoDataType, id: number, t: any) => {
		return (
			<ListItem
				paddingV-0
				paddingH-20
				activeBackgroundColor={Colors.$backgroundNeutralMedium}
				activeOpacity={0.3}
				onPress={() => {
					ToastAndroid.show('Value Copied', ToastAndroid.SHORT);
					Clipboard.setString(row.raw ?? row.rendered)
				}}
				style={{ borderBottomWidth: 0.25, borderBottomColor: Colors.$outlineNeutral }}
			>
				<ListItem.Part middle column>
					<ListItem.Part>
						<Text $textDefault text70BL flex-1 numberOfLines={1}>
							{t('main:euiccInfo_' + row.key)}
						</Text>
					</ListItem.Part>
						<ListItem.Part>
							{ row.element ?? (
								<Text $textNeutral text80L style={{ flex: 1, textAlign: 'right'}}>
									{row.rendered ?? "[empty]"}
								</Text>
							)}
					</ListItem.Part>
				</ListItem.Part>
			</ListItem>
		);
	}
	return (
		<SafeScreen>
			<Title>{t('main:euiccInfo_euiccinfo')}</Title>
			<FlatList
				data={[
					{key: "eid", rendered: `${eid}` },
					{key: "sasAcreditationNumber", rendered: euiccInfo2?.sasAcreditationNumber },
					{key: "svn", rendered: euiccInfo2?.svn },
					{key: "freeNonVolatileMemory", rendered: formatSize(euiccInfo2?.extCardResource.freeNonVolatileMemory) },
					{key: "freeVolatileMemory", rendered: formatSize(euiccInfo2?.extCardResource.freeVolatileMemory) },
					{key: "defaultDpAddress", rendered: euiccAddress?.defaultDpAddress },
					{key: "rootDsAddress", rendered: euiccAddress?.rootDsAddress },
					{key: "euiccCiPKIdListForSigning", rendered: euiccInfo2?.euiccCiPKIdListForSigning.map(x => x.substr(0, 16)).join(", "), raw: euiccInfo2?.euiccCiPKIdListForSigning.join("\n") },
					{key: "euiccCiPKIdListForVerification", rendered: euiccInfo2?.euiccCiPKIdListForVerification.map(x => x.substr(0, 16)).join(", "), raw: euiccInfo2?.euiccCiPKIdListForVerification.join("\n") },
					{key: "profileVersion", rendered: euiccInfo2?.profileVersion },
					{key: "globalplatformVersion", rendered: euiccInfo2?.globalplatformVersion },
					{key: "euiccFirmwareVer", rendered: euiccInfo2?.euiccFirmwareVer },
				]}
				renderItem={({item, index}) => renderRow(item, index, t)}
				keyExtractor={(item: EuiccInfoDataType) => item.key}
			/>
		</SafeScreen>
	);

}

export default EuiccInfo;
