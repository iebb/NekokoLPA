import {ActionSheet, Button, Card, Colors, Text, View} from "react-native-ui-lib";
import {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectDeviceState} from "@/redux/stateStore";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faPlus} from '@fortawesome/free-solid-svg-icons'
import {useNavigation} from "@react-navigation/native";
import {useTranslation} from "react-i18next";
import {selectAppConfig, setNickname} from "@/redux/configStore";
import {Adapters} from "@/native/adapters/registry";
import {NativeModules, Platform, ToastAndroid} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import prompt from "react-native-prompt-android";
import {preferences} from "@/storage/mmkv";
import {useAppTheme} from "@/theme/context";
import _ from "lodash";
import {toCIName} from "@/screens/EuiccInfo/CINames";


export default function ProfileMenu({ deviceId } : { deviceId: string }) {
  const { t } = useTranslation(['main']);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { nicknames } = useSelector(selectAppConfig);
  const [euiccMenu, setEuiccMenu] = useState(false);
  const DeviceState = useSelector(selectDeviceState(deviceId));
  const stealthMode = preferences.getString("redactMode") ?? "none";
  const adapter = Adapters[deviceId];

  const options = [
    {
      label: t('main:eid_copy'),
      onPress: () => {
        ToastAndroid.show('EID Copied', ToastAndroid.SHORT);
        Clipboard.setString(DeviceState.eid!)
      }
    },
    ...(((Platform.OS === 'android' && deviceId.startsWith("omapi")) ? [{
      label: t('main:open_stk_menu'),
      onPress: () => {
        // @ts-ignore
        const { OMAPIBridge } = NativeModules;
        OMAPIBridge.openSTK(adapter.device.deviceName);
      }
    }] : [])),
    {
      label: 'EUICC Info',
      onPress: () => {
        // @ts-ignore
        navigation.navigate('EuiccInfo', { deviceId: deviceId });
      }
    },
    {
      label: t('main:download_profile'),
      onPress: () => {
        // @ts-ignore
        navigation.navigate('Scanner', { deviceId: deviceId });
      }
    },
    {
      label: t('main:set_nickname'),
      onPress: () => {
        prompt(
          t('main:set_nickname'),
          t('main:set_nickname_prompt'),
          [
            {text: 'Cancel', onPress: () => {}, style: 'cancel'},
            {text: 'OK', onPress: (nickname: string) => {
                // @ts-ignore
                dispatch(setNickname({ [DeviceState?.eid] : nickname}));
              }},
          ],
          {
            cancelable: true,
            defaultValue: nicknames[DeviceState.eid!],
            placeholder: 'placeholder'
          }
        );
      }},
    {
      label: t('main:manage_notifications'),
      onPress: () => {
        // @ts-ignore
        navigation.navigate('Notifications', {
          deviceId: deviceId,
        });
      }
    },
    {
      label: 'Cancel',
      onPress: () => setEuiccMenu(false)
    }
  ];

  return (
    <View>
      <ActionSheet
        title={`EID: ${DeviceState?.eid}`}
        cancelButtonIndex={options.length - 1}
        options={options}
        visible={euiccMenu}
        useNativeIOS
        onDismiss={() => setEuiccMenu(false)}
      />
      <Card
        style={{
          backgroundColor: Colors.cardBackground,
          borderRadius: 10,
          borderColor: Colors.$outlineNeutral,
          borderWidth: 1,
          overflow: "hidden",
          width: "100%",
        }}
        row
        enableShadow
        onPress={() => setEuiccMenu(true)}
      >
        <View style={{ flexGrow: 1 }}>
          <View paddingH-10 paddingV-3 style={{ overflow: 'hidden' }}>
            <View row fullWidth>
              <Text text100L $textDefault>
                {t('main:available_space', {
                  bytes: Intl.NumberFormat().format(DeviceState.bytesFree || 0),
                  kBytes: Intl.NumberFormat().format((DeviceState.bytesFree || 0) / 1024.0)
                })}
              </Text>
              <Text flexG text100L $textDefault style={{ textAlign: "right" }}>
                CI: {
                  DeviceState.euiccInfo2?.euiccCiPKIdListForSigning.map(x => toCIName(x)).join(", ")
                }
              </Text>
            </View>
            <View row fullWidth>
              <Text text100L $textDefault>
                EID: {
                  DeviceState.eid?.substring(0, stealthMode == 'none' ? null : stealthMode === 'medium' ? 18 : 13)
                }{
                  _.repeat("*", DeviceState.eid?.length - (stealthMode == 'none' ? DeviceState.eid.length : stealthMode === 'medium' ? 18 : 13))
                }
              </Text>
              <Text flexG text100L $textDefault style={{ textAlign: "right" }}>
                SAS #: {
                  DeviceState.euiccInfo2?.sasAcreditationNumber
                }
              </Text>
            </View>
          </View>
        </View>
        <View style={{ width: 36, flexBasis: 36 }}>
          <Button
            borderRadius={0}
            fullWidth
            round
            style={{ flex: 1, width: 36 }}
            size="small"
            onPress={() => {
              // @ts-ignore
              navigation.navigate('Scanner', {
                deviceId: deviceId,
              });
            }}
          >
            <FontAwesomeIcon icon={faPlus} style={{ color: Colors.buttonForeground }} />
          </Button>
        </View>
      </Card>
    </View>
  )
}