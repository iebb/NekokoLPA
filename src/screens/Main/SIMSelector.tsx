import {Colors, Text, View} from "react-native-ui-lib";
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/reduxDataStore";
import {EUICCPage} from "@/screens/Main/EUICCPage";
import {useTranslation} from "react-i18next";
import {Dimensions, Linking, NativeModules, Platform, ScrollView, ToastAndroid} from "react-native";
import {Adapters} from "@/native/adapters/registry";
import TabController from "../../components/ui/Tab";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faFloppyDisk, faSimCard} from "@fortawesome/free-solid-svg-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import {preferences} from "@/utils/mmkv";
import {AppBuyLink} from "@/screens/Main/config";
import {getNicknames} from "@/configs/configStore";
import {setDeviceState} from "@/redux/stateStore";

export default function SIMSelector() {
  const {deviceList: _deviceList} = useSelector((state: RootState) => state.LPA);
  const ds = useSelector((state: RootState) => state.DeviceState);
  const nicknames = getNicknames();
  const { t } = useTranslation(['main']);
  const showSlots = preferences.getString("showSlots");

  console.log(ds);
  let deviceList = _deviceList;

  if (showSlots === "possible") {
    deviceList = _deviceList.filter(x => Adapters[x].device.available || Adapters[x].device.slotAvailable);
  } else if (showSlots === "available") {
    deviceList = _deviceList.filter(x => Adapters[x].device.available);
  }

  const firstAvailable = deviceList.map(x => Adapters[x].device.available).indexOf(true);
  
  const [index, setIndex] = useState(firstAvailable < 0 ? 0 : firstAvailable);
  const selected = index < deviceList.length ? deviceList[index] : null;
  const adapter = selected ? Adapters[selected] : null;
  const width = Dimensions.get('window').width - 48;
  
  const deviceCount = deviceList.length;
  const displayWidth = width / deviceCount;
  const displayWidth2 = (deviceCount === 1 ? 2 : 1) * width / deviceCount;


  useEffect(() => {
    if (firstAvailable > 0 && !(adapter?.device.available)) {
      setIndex(firstAvailable < 0 ? 0 : firstAvailable);
    }
  }, [firstAvailable]);

  if (width <= 0) return null;
  if (deviceList.length == 0) return (
    <ScrollView
      bounces
      alwaysBounceVertical
      overScrollMode="always"
    >
      <View flex paddingT-20 gap-10>
        <Text $textDefault center text70L>
          {t('main:no_device')}
        </Text>
        <Text $textPrimary center underline text60L marginT-40 onPress={() => {
          Linking.openURL(AppBuyLink);
        }}>
          {t('main:purchase_note')}
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <View
      flexG-1
      flexS-0
      key={deviceList.length}
    >
      <TabController
        items={
          deviceList.map((name, _idx) => {
            const adapter = Adapters[name];
            const eid = ds[name]?.eid ?? "";

            const label = adapter.device.available ?
              ((nicknames[eid]) ? nicknames[eid] + ` (${adapter.device.displayName})` : adapter.device.displayName)
              : `${adapter.device.displayName}\nunavailable`;

            return ({
              label,
              icon: (
                <FontAwesomeIcon
                  icon={
                    adapter.device.deviceName.startsWith("SIM") ? faSimCard : faFloppyDisk
                  }
                  style={{
                    color: Colors.$textPrimary,
                    marginRight: 4,
                    marginTop: -2,
                  }}
                  size={12}
                />
              ),
              labelStyle: {
                padding: 0,
                margin: 0,
                fontSize: 12,
                lineHeight: 16,
              },
              selectedLabelStyle: {
                padding: 0,
                margin: 0,
                fontSize: 12,
                lineHeight: 16,
                fontWeight: '500',
              },
              labelColor: Colors.$textNeutral,
              selectedLabelColor: Colors.$textPrimary,
              width: displayWidth,
            })

          })
        }
        initialIndex={index}
        onChangeIndex={setIndex}
      >
        <TabController.TabBar
          backgroundColor={Colors.cardBackground}
          indicatorWidth={displayWidth2}
          indicatorStyle={{
            backgroundColor: Colors.$textPrimary,
          }}
          containerWidth={width}
          containerStyle={{
            width: '100%',
            overflow: "hidden",
            borderRadius: 20,
            marginBottom: 10,
            height: 40,
          }}
        />
      </TabController>
      {
        selected && (adapter != null) && (
          adapter.device.available ? (
            <EUICCPage deviceId={selected} key={selected}/>
          ): (
            <ScrollView
              bounces
              alwaysBounceVertical
              overScrollMode="always"
            >
              <View flex paddingT-20 gap-10>
                <Text $textDefault center text70L>
                  {t('main:error_device')}
                </Text>
                <Text $textMajor center text60L marginB-40>
                  {adapter.device.description}
                </Text>
                {
                  (Platform.OS === 'android' && adapter.device.signatures) && (
                    <>
                      <Text $textDefault center text70L>
                        {t('main:android_aram')}
                      </Text>

                      <View flex paddingB-40 gap-10>
                        {adapter.device.signatures.split(",").map((s: string) => (
                          <Text $textDefault text80L center key={s} onPress={() => {
                            ToastAndroid.show(`ARA-M ${s} Copied`, ToastAndroid.SHORT);
                            Clipboard.setString(s)
                          }}>{s}</Text>
                        ))}
                      </View>
                    </>
                  )
                }
                {
                  (Platform.OS === 'android') && (
                    <>
                      <Text $textDefault center underline text60L marginT-40 onPress={() => {
                        const { OMAPIBridge } = NativeModules;
                        OMAPIBridge.openSTK(adapter.device.deviceName);
                      }}>
                        {t('main:open_stk_menu')}
                      </Text>
                    </>
                  )
                }
                <Text $textPrimary center underline text60L marginT-40 onPress={() => {
                  Linking.openURL(AppBuyLink);
                }}>
                  {t('main:purchase_note')}
                </Text>
              </View>
            </ScrollView>
          )
        )
      }
    </View>
  )
}