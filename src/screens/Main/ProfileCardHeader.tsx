import {ActionSheet, Button, Card, Colors, Text, View} from "react-native-ui-lib";
import {useState} from "react";
import {useSelector} from "react-redux";
import {selectDeviceState} from "@/redux/stateStore";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faPlus} from '@fortawesome/free-solid-svg-icons'
import {useNavigation} from "@react-navigation/native";
import {useTranslation} from "react-i18next";
import {Adapters} from "@/native/adapters/registry";
import {NativeModules, Platform, ToastAndroid} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import prompt from "react-native-prompt-android";
import {preferences} from "@/utils/mmkv";
import {formatSize} from "@/utils/size";
import {toCIName, toFriendlyName} from "@/utils/friendlyName";
import {useAppTheme} from "@/theme/context";
import {getNicknameByEid, setNicknameByEid} from "@/configs/store";
import {RootState} from "@/redux/reduxDataStore";


export default function ProfileCardHeader({ deviceId } : { deviceId: string }) {
  const { t } = useTranslation(['main']);
  const navigation = useNavigation();
  const [euiccMenu, setEuiccMenu] = useState(false);
  const DeviceState = useSelector((state: RootState) => state.DeviceState[deviceId]) ?? {};
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
              if (DeviceState!.eid) setNicknameByEid(DeviceState!.eid!, nickname);
              }},
          ],
          {
            cancelable: true,
            defaultValue: getNicknameByEid(DeviceState.eid!),
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

  const eid = (DeviceState?.eid) ?? "";
  const maskedEid = stealthMode == 'none' ? eid : (
    eid.substring(0, stealthMode === 'medium' ? 18 : 13)
    + "..."
  );

  let supplementText = toFriendlyName(eid, DeviceState.euiccInfo2);
  const {theme, setTheme, setThemeColor} = useAppTheme();

  return (
    <View>
      {
        DeviceState?.eid && (
          <ActionSheet
            title={`EID: ${DeviceState?.eid}`}
            containerStyle={{
              backgroundColor: Colors.cardBackground,
            }}
            cancelButtonIndex={options.length - 1}
            options={options}
            visible={euiccMenu}
            useNativeIOS
            onDismiss={() => setEuiccMenu(false)}
          />
        )
      }
      <Card
        style={{
          backgroundColor: Colors.cardBackground,
          borderRadius: 10,
          borderColor: Colors.$outlineNeutral,
          borderWidth: 1,
          overflow: "hidden",
          width: "100%",
          display: "flex",
          flexDirection: "row"
        }}
        row
        enableShadow
        onPress={() => setEuiccMenu(true)}
      >
        <View paddingH-10 paddingV-3 flexG style={{ flex: 1 }}>
          {/* First Row */}
          <View row style={{ width: '100%' }}>
            <Text text100L $textDefault numberOfLines={1}>
              {t('main:available_space', {
                size: formatSize(DeviceState.bytesFree),
              })}
            </Text>
            <Text
              text100L
              $textDefault
              style={{ textAlign: 'right', flexGrow: 1 }}
              numberOfLines={1}
            >
              CI: {DeviceState.euiccInfo2?.euiccCiPKIdListForSigning.map(x => toCIName(x)).join(', ')}
            </Text>
          </View>

          {/* Second Row */}
          <View row style={{ width: '100%' }}>
            <Text text100L $textDefault>
              EID: {maskedEid}
            </Text>
            <Text
              text100L
              $textDefault
              style={{ textAlign: 'right', flexGrow: 1 }}
              numberOfLines={1}
            >
              {supplementText}
            </Text>
          </View>
        </View>

        {/* Button Container */}
        <View flexG-1 style={{ maxWidth: 36, flex: 1 }}>
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