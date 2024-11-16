import {ActionSheet, Button, Card, Text, View} from "react-native-ui-lib";
import {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {EuiccList, selectDeviceState} from "@/redux/stateStore";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faClipboard, faPlus} from '@fortawesome/free-solid-svg-icons'
import {useTheme} from "@/theme";
import {useNavigation} from "@react-navigation/native";
import {useTranslation} from "react-i18next";
import {nextValue, selectAppConfig, setNickname} from "@/redux/configStore";
import {Adapters} from "@/native/adapters/registry";
import {ToastAndroid} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import prompt from "react-native-prompt-android";


export default function ProfileMenu({ deviceId } : { deviceId: string }) {
  const { colors } = useTheme();
  const { t } = useTranslation(['main']);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { stealthMode , nicknames } = useSelector(selectAppConfig);
  const [euiccMenu, setEuiccMenu] = useState(false);
  const DeviceState = useSelector(selectDeviceState(deviceId));

  const adapter = Adapters[deviceId];

  return (
    <View>
      <ActionSheet
        title={`EID: ${DeviceState?.eid}`}
        cancelButtonIndex={6}
        containerStyle={{
          backgroundColor: colors.std800,
        }}

        options={[
          {
            label: 'Copy EID',
            labelStyle: {
              color: colors.std200,
            },
            onPress: () => {
              ToastAndroid.show('EID Copied', ToastAndroid.SHORT);
              Clipboard.setString(DeviceState.eid!)
            }
          },
          {
            label: 'EUICC Info',
            labelStyle: {
              color: colors.std200,
            },
            onPress: () => {
              // @ts-ignore
              navigation.navigate('EuiccInfo', { deviceId: deviceId });
            }
          },
          {
            label: 'Download Profile',
            labelStyle: {
              color: colors.std200,
            },
            onPress: () => {
              // @ts-ignore
              navigation.navigate('Scanner', { deviceId: deviceId });
            }
          },
          {
            label: t('main:set_nickname'),
            labelStyle: {
              color: colors.std200,
            },
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
            label: 'Manage Notifications',
            labelStyle: {
              color: colors.std200,
            },
            onPress: () => {
              // @ts-ignore
              navigation.navigate('Notifications', {
                deviceId: deviceId,
              });
            }
          },
          {
            label: 'Cancel',
            labelStyle: {
              color: colors.std200,
            },
            onPress: () => setEuiccMenu(false)
          }
        ]}
        visible={euiccMenu}
        useNativeIOS
        onDismiss={() => setEuiccMenu(false)}
      />
      <Card
        style={{
          borderRadius: 10,
          borderColor: colors.std800,
          borderWidth: 1,
          overflow: "hidden",
          width: "100%",
        }}
        row
        backgroundColor={colors.cardBackground}
        enableShadow
        onPress={() => setEuiccMenu(true)}
        onLongPress={
          () => {
            dispatch(nextValue('stealthMode'))
          }
        }
      >
        <View style={{ flexGrow: 1 }}>
          <View paddingH-10 paddingV-3 style={{ overflow: 'hidden' }}>
            <Text text100L color={colors.std50}>
              {t('main:available_space', {
                bytes: DeviceState.bytesFree !== null ? Intl.NumberFormat().format(DeviceState.bytesFree || 0) : "??"
              })}
            </Text>
            <Text text100L color={colors.std50}>
              {
                stealthMode === 'none' ? `EID: ` + DeviceState.eid : `EUM: ${DeviceState.eid?.substring(0, 8)}`
              }
            </Text>
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
            <FontAwesomeIcon icon={faPlus} style={{ color: colors.cardBackground, }} />
          </Button>
        </View>
      </Card>
    </View>
  )
}