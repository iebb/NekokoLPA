import React from 'react';
import {FlatList} from 'react-native';
import {useTranslation} from 'react-i18next';
import Screen from '@/shared/ui/Screen';
import type {RootScreenProps} from '@/app/navigation/types';
import {Text, useTheme} from 'tamagui';
import {View, TouchableOpacity, ToastAndroid} from 'react-native';
import {useSelector} from 'react-redux';
import {selectDeviceState} from '@/store';
import Clipboard from '@react-native-clipboard/clipboard';
import {useFormatSize} from '@/shared/hooks/useFormatSize';
import {fontFamily, fontSize, radius} from '@/shared/theme/tokens';
import {preferences} from '@/shared/storage';
import {group, isRedactMode, maskEid} from '@/shared/utils/redact';

export type EuiccInfoDataType = {
  key: string;
  raw?: any;
  rendered: any;
  element?: any;
};

function EuiccInfo({route}: RootScreenProps<'EuiccInfo'>) {
  const {deviceId} = route.params;
  const DeviceState = useSelector(selectDeviceState(deviceId!));
  const {t} = useTranslation(['main']);
  const theme = useTheme();
  const formatSize = useFormatSize();
  const {eid, euiccAddress, euiccInfo2} = DeviceState;
  const storedRedact = preferences.getString('redactMode');
  const redactMode = isRedactMode(storedRedact) ? storedRedact : 'none';
  const renderRow = (row: EuiccInfoDataType, t: any) => {
    return (
      <TouchableOpacity
        onPress={() => {
          ToastAndroid.show('Value Copied', ToastAndroid.SHORT);
          Clipboard.setString(row.raw ?? row.rendered);
        }}>
        {/* Rows sit inside one hairline group, so the divider comes from the
            1px gap rather than a per-row border. */}
        <View style={{backgroundColor: theme.surfaceRow?.val, paddingVertical: 11, paddingHorizontal: 14}}>
          <View style={{flexDirection: 'row', alignItems: 'baseline', gap: 14}}>
            <Text color="$color6" fontSize={fontSize.sm} numberOfLines={2} style={{flex: 1}}>
              {t('main:euiccInfo_' + row.key)}
            </Text>
            {row.element ?? (
              <Text
                color="$textDefault"
                fontFamily={fontFamily.mono as any}
                fontSize={fontSize.sm}
                style={{flex: 1, textAlign: 'right'}}>
                {row.rendered ?? '[empty]'}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <Screen
      title={t('main:euiccInfo_euiccinfo')}
      subtitle={t('main:euiccInfo_subtitle')}
      keyboardAvoiding={false}
      scrollViewProps={{nestedScrollEnabled: true}}>
      <FlatList
        style={{
          backgroundColor: theme.borderColor?.val,
          borderWidth: 1,
          borderColor: theme.borderColor?.val,
          borderRadius: radius.lg,
          overflow: 'hidden',
        }}
        ItemSeparatorComponent={() => <View style={{height: 1}} />}
        data={[
          {key: 'eid', rendered: group(maskEid(eid, redactMode)), raw: eid},
          {key: 'sasAcreditationNumber', rendered: euiccInfo2?.sasAcreditationNumber},
          {key: 'svn', rendered: euiccInfo2?.svn},
          {
            key: 'freeNonVolatileMemory',
            rendered: formatSize(euiccInfo2?.extCardResource.freeNonVolatileMemory),
          },
          {
            key: 'freeVolatileMemory',
            rendered: formatSize(euiccInfo2?.extCardResource.freeVolatileMemory),
          },
          {key: 'defaultDpAddress', rendered: euiccAddress?.defaultDpAddress},
          {key: 'rootDsAddress', rendered: euiccAddress?.rootDsAddress},
          {
            key: 'euiccCiPKIdListForSigning',
            rendered: euiccInfo2?.euiccCiPKIdListForSigning.map(x => x.substr(0, 16)).join(', '),
            raw: euiccInfo2?.euiccCiPKIdListForSigning.join('\n'),
          },
          {
            key: 'euiccCiPKIdListForVerification',
            rendered: euiccInfo2?.euiccCiPKIdListForVerification
              .map(x => x.substr(0, 16))
              .join(', '),
            raw: euiccInfo2?.euiccCiPKIdListForVerification.join('\n'),
          },
          {key: 'profileVersion', rendered: euiccInfo2?.profileVersion},
          {key: 'globalplatformVersion', rendered: euiccInfo2?.globalplatformVersion},
          {key: 'euiccFirmwareVer', rendered: euiccInfo2?.euiccFirmwareVer},
        ]}
        renderItem={({item}) => renderRow(item, t)}
        keyExtractor={(item: EuiccInfoDataType) => item.key}
        scrollEnabled={false}
      />
    </Screen>
  );
}

export default EuiccInfo;
