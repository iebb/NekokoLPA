import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/redux/reduxDataStore";
import {EUICCPage} from "@/screens/Main/EUICCPage";
import {useTranslation} from "react-i18next";
import {Alert, Dimensions, Linking, NativeModules, Platform, ScrollView, ToastAndroid, View} from "react-native";
import {Adapters} from "@/native/adapters/registry";
import {Tabs, Text as TText, useTheme, XStack} from 'tamagui';
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faSimCard} from "@fortawesome/free-solid-svg-icons";
import {faBluetooth, faUsb} from "@fortawesome/free-brands-svg-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import {preferences} from "@/utils/mmkv";
import {AppBuyLink} from "@/screens/Main/config";
import {getNicknames} from "@/configs/store";
import {setTargetDevice} from "@/redux/stateStore";

export default function SIMSelector() {
  const theme = useTheme();
  const ds = useSelector((state: RootState) => state.DeviceState);
  const {deviceList: _deviceList, targetDevice} = useSelector((state: RootState) => state.LPA);
  const nicknames = getNicknames();
  const dispatch = useDispatch();
  const { t } = useTranslation(['main']);
  const showSlots = preferences.getString("showSlots");

  let deviceList = _deviceList ?? [];

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

  useEffect(() => {
    if (targetDevice) {
      if (deviceList.indexOf(targetDevice) !== -1) {
        setIndex(deviceList.indexOf(targetDevice));
        dispatch(setTargetDevice(null));
      }
    }
  }, [targetDevice]);

  // Show iOS notification when no compatible devices are found
  useEffect(() => {
    if (Platform.OS === 'ios' && deviceList.length === 0) {
      Alert.alert(
        'No Compatible Devices',
        'A compatible external CCID reader is required for iOS.',
        [{ text: 'OK' }]
      );
    }
  }, [deviceList.length]);

  if (width <= 0) return null;
  if (deviceList.length == 0) return (
    <ScrollView
      bounces
      alwaysBounceVertical
      overScrollMode="always"
    >
      <View style={{ flex: 1, paddingTop: 20, gap: 10 }}>
        <TText color="$textDefault" fontSize={18} textAlign="center">
          {t('main:no_device')}
        </TText>
        <TText color="$accentColor" textDecorationLine="underline" fontSize={20} textAlign="center" style={{ marginTop: 40 }} onPress={() => {
          Linking.openURL(AppBuyLink);
        }}>
          {t('main:purchase_note')}
        </TText>
      </View>
    </ScrollView>
  );

  return (
    <View
      style={{ flexGrow: 1, flexShrink: 0 }}
      key={deviceList.length}
    >
      <Tabs
        value={String(index)}
        onValueChange={(val: string) => {
          const next = Number(val);
          if (!Number.isNaN(next)) setIndex(next);
        }}
      >
        <Tabs.List
          backgroundColor={theme.surfaceSpecial?.val}
          borderRadius={12}
          style={{
            height: 40,
            overflow: 'hidden',
            width: '100%',
            marginBottom: 8,
            borderWidth: 0,
          }}
        >
          {deviceList.map((name, _idx) => {
            const adapter = Adapters[name];
            const eid = ds[name]?.eid ?? '';
            const label = adapter.device.available ?
              ((nicknames[eid]) ? nicknames[eid] + ` (${adapter.device.displayName})` : adapter.device.displayName)
              : `${adapter.device.displayName}\nunavailable`;
            const selected = index === _idx;
            return (
              <Tabs.Tab
                key={`${name}-${_idx}`}
                value={String(_idx)}
                width={displayWidth}
                style={{ backgroundColor: 'transparent' }}
              >
                <XStack alignItems="center" gap={4} paddingHorizontal={8} paddingVertical={6}>
                  <FontAwesomeIcon
                    icon={
                      adapter.device.deviceId.startsWith('omapi') ? faSimCard :
                      adapter.device.deviceId.startsWith('ble') ? (faBluetooth as any) : (faUsb as any)
                    }
                    style={{ color: selected ? (theme.accentColor?.val || theme.colorFocus?.val || theme.color?.val) : (theme.color11?.val || theme.color10?.val || '#888'), marginRight: 4, marginTop: -2 }}
                    size={15}
                  />
                  <TText
                    fontSize={12}
                    lineHeight={16}
                    color={selected ? (theme.accentColor?.val || theme.colorFocus?.val || theme.color?.val) : (theme.color11?.val || theme.color10?.val || '#777')}
                    fontWeight={selected ? '600' as any : '400' as any}
                    numberOfLines={2}
                  >
                    {label}
                  </TText>
                </XStack>
              </Tabs.Tab>
            );
          })}
          {/* Selected tab underline indicator */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: (index * displayWidth) + ((displayWidth - displayWidth2) / 2),
              width: displayWidth2,
              height: 2,
              backgroundColor: theme.accentColor?.val || theme.colorFocus?.val || theme.color?.val,
              borderRadius: 1,
            }}
          />
        </Tabs.List>
      </Tabs>
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
              <View style={{ flex: 1, paddingTop: 20, gap: 10 }}>
                <TText color="$textDefault" fontSize={18} textAlign="center">
                  {t('main:error_device')}
                </TText>
                <TText color="$color" fontSize={20} textAlign="center" style={{ marginBottom: 40 }}>
                  {adapter.device.description}
                </TText>
                {
                  (Platform.OS === 'android' && adapter.device.signatures) && (
                    <>
                      <TText color="$textDefault" fontSize={18} textAlign="center">
                        {t('main:android_aram')}
                      </TText>

                      <View style={{ flex: 1, paddingBottom: 40, gap: 10 }}>
                        {adapter.device.signatures.split(",").map((s: string) => (
                          <TText color="$textDefault" fontSize={14} textAlign="center" key={s} onPress={() => {
                            ToastAndroid.show(`ARA-M ${s} Copied`, ToastAndroid.SHORT);
                            Clipboard.setString(s)
                          }}>{s}</TText>
                        ))}
                      </View>
                    </>
                  )
                }
                {
                  (Platform.OS === 'android') && (
                    <>
                      <TText color="$textDefault" textDecorationLine="underline" fontSize={20} textAlign="center" style={{ marginTop: 40 }} onPress={() => {
                        const { OMAPIBridge } = NativeModules;
                        OMAPIBridge.openSTK(adapter.device.deviceName);
                      }}>
                        {t('main:open_stk_menu')}
                      </TText>
                    </>
                  )
                }
                <TText color="$accentColor" textDecorationLine="underline" fontSize={20} textAlign="center" style={{ marginTop: 40 }} onPress={() => {
                  Linking.openURL(AppBuyLink);
                }}>
                  {t('main:purchase_note')}
                </TText>
              </View>
            </ScrollView>
          )
        )
      }
    </View>
  )
}
