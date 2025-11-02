import React from 'react';
import {FlatList} from 'react-native';
import {useTranslation} from 'react-i18next';
import Screen from '@/components/common/Screen';
import type {RootScreenProps} from "@/screens/navigation";
import {Text, useTheme} from 'tamagui';
import {View, TouchableOpacity, ToastAndroid} from 'react-native';
import {useSelector} from "react-redux";
import {selectDeviceState} from "@/redux/stateStore";
import Clipboard from "@react-native-clipboard/clipboard";
import {formatSize} from "@/utils/size";

export type EuiccInfoDataType = {
	key: string;
	raw?: any;
	rendered: any;
	element?: any;
}

function EuiccInfo({ route,  navigation }: RootScreenProps<'EuiccInfo'>) {
	const { deviceId } = route.params;
	const DeviceState = useSelector(selectDeviceState(deviceId!));
  const { t } = useTranslation(['main']);
  const theme = useTheme();
	const { eid, euiccAddress, euiccInfo2 } = DeviceState;
  const renderRow = (row: EuiccInfoDataType, id: number, t: any) => {
    return (
      <TouchableOpacity
        onPress={() => {
          ToastAndroid.show('Value Copied', ToastAndroid.SHORT);
          Clipboard.setString(row.raw ?? row.rendered)
        }}
      >
        <View style={{ paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: theme.borderColor?.val || 'rgba(0,0,0,0.08)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text color="$textDefault" numberOfLines={1} style={{ flex: 1 }}>
              {t('main:euiccInfo_' + row.key)}
            </Text>
            { row.element ?? (
              <Text color="$color10" style={{ textAlign: 'right' }}>
                {row.rendered ?? "[empty]"}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
	return (
    <Screen title={t('main:euiccInfo_euiccinfo')} subtitle={t('main:euiccInfo_subtitle')} keyboardAvoiding={false} scrollViewProps={{ nestedScrollEnabled: true }}>
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
					scrollEnabled={false}
				/>
    </Screen>
	);

}

export default EuiccInfo;
