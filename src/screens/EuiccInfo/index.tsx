import React from 'react';
import {FlatList, StyleSheet, ToastAndroid,} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SafeScreen} from '@/components/template';
import type {RootScreenProps} from "@/screens/navigation";
import Title from "@/components/common/Title";
import {BorderRadiuses, Colors, ListItem, Text} from "react-native-ui-lib";
import {useSelector} from "react-redux";
import {selectDeviceState} from "@/redux/stateStore";
import Clipboard from "@react-native-clipboard/clipboard";
import {useTheme} from "@/theme";

export type EuiccInfoDataType = {
	key: string;
	rendered: any;
}

function EuiccInfo({ route,  navigation }: RootScreenProps<'EuiccInfo'>) {
	const { deviceId } = route.params;
	const DeviceState = useSelector(selectDeviceState(deviceId!));
	const { colors, variant } = useTheme();

	const { t } = useTranslation(['euiccinfo']);


	const { eid, euiccAddress, euiccInfo2 } = DeviceState;


	const renderRow = (row: EuiccInfoDataType, id: number, t: any) => {
		return (
			<ListItem
				paddingV-0
				paddingH-20
				activeBackgroundColor={colors.std400}
				activeOpacity={0.3}
				onPress={() => {
					ToastAndroid.show('Value Copied', ToastAndroid.SHORT);
					Clipboard.setString(row.rendered)
				}}
				style={{ borderBottomWidth: 0.25, borderBottomColor: colors.std900 }}
			>
				<ListItem.Part middle column>
					<ListItem.Part>
						<Text color={colors.std200}  text70BL style={{flex: 1}} numberOfLines={1}>
							{t('euiccinfo:' + row.key)}
						</Text>
					</ListItem.Part>
						<ListItem.Part>
							<Text color={colors.std100} text80L style={{ flex: 1, textAlign: 'right'}}>
								{row.rendered ?? "[empty]"}
							</Text>
					</ListItem.Part>
				</ListItem.Part>
			</ListItem>
		);
	}
	return (
		<SafeScreen>
			<Title>{t('euiccinfo:euiccinfo')}</Title>
			<FlatList
				data={[
					{key: "eid", rendered: `${eid}` },
					{key: "sasAcreditationNumber", rendered: euiccInfo2?.sasAcreditationNumber },
					{key: "svn", rendered: euiccInfo2?.svn },
					{key: "freeNonVolatileMemory", rendered: `${euiccInfo2?.extCardResource.freeNonVolatileMemory} B` },
					{key: "freeVolatileMemory", rendered: `${euiccInfo2?.extCardResource.freeVolatileMemory} B` },
					{key: "defaultDpAddress", rendered: euiccAddress?.defaultDpAddress },
					{key: "rootDsAddress", rendered: euiccAddress?.rootDsAddress },
					{key: "euiccCiPKIdListForSigning", rendered: euiccInfo2?.euiccCiPKIdListForSigning.join(", ") },
					{key: "euiccCiPKIdListForVerification", rendered: euiccInfo2?.euiccCiPKIdListForVerification.join(", ") },
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

const styles = StyleSheet.create({
	image: {
		width: 54,
		height: 54,
		borderRadius: BorderRadiuses.br20,
		marginHorizontal: 14
	},
	border: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.grey70
	}
});
export default EuiccInfo;
