import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/redux/reduxDataStore";
import {useTranslation} from "react-i18next";
import {Alert, Dimensions, Linking, NativeModules, Platform, ScrollView, ToastAndroid} from "react-native";
import {Adapters} from "@/native/adapters/registry";
import {Tabs, Text as TText, XStack, YStack, View as TView, useTheme} from 'tamagui';
import {Smartphone, Bluetooth, Usb} from '@tamagui/lucide-icons';
import Clipboard from "@react-native-clipboard/clipboard";
import {preferences} from "@/utils/mmkv";
import {AppBuyLink} from "@/screens/Main/config";
import {getNicknames} from "@/configs/store";
import {setTargetDevice} from "@/redux/stateStore";
import ProfileCardHeader from "@/screens/Main/ProfileCardHeader";
import ProfileSelector from "@/screens/Main/ProfileSelector";

export default function SIMSelector() {
  const ds = useSelector((state: RootState) => state.DeviceState);
  const {deviceList: _deviceList, targetDevice} = useSelector((state: RootState) => state.LPA);
  const nicknames = getNicknames();
  const dispatch = useDispatch();
  const { t } = useTranslation(['main']);
  const showSlots = preferences.getString("showSlots");
  const theme = useTheme();

  let deviceList = _deviceList ?? [];

  if (showSlots === "possible") {
    deviceList = _deviceList.filter(x => Adapters[x].device.available || Adapters[x].device.slotAvailable);
  } else if (showSlots === "available") {
    deviceList = _deviceList.filter(x => Adapters[x].device.available);
  }

  const firstAvailable = deviceList.map(x => Adapters[x].device.available).indexOf(true);

  const [index, setIndex] = useState(firstAvailable < 0 ? 0 : firstAvailable);
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
  const selected = index < deviceList.length ? deviceList[index] : null;
  const adapter = selected ? Adapters[selected] : null;
  const width = dimensions.width - 48;

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

  // Listen for dimension changes (orientation changes)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  if (width <= 0) return null;


  if (deviceList.length == 0) return (
    <ScrollView
      bounces
      alwaysBounceVertical
      overScrollMode="always"
    >
      <YStack flex={1} paddingTop={20} gap={10}>
        <TText color="$textDefault" fontSize={18} textAlign="center">
          {t('main:no_device')}
        </TText>
        <TText color="$accentColor" textDecorationLine="underline" fontSize={20} textAlign="center" marginTop={40} onPress={() => {
          Linking.openURL(AppBuyLink);
        }}>
          {t('main:purchase_note')}
        </TText>
      </YStack>
    </ScrollView>
  );

  return (
    <TView
      flex={1}
      minHeight={0}
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
          backgroundColor="$surfaceSpecial"
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
                  {(() => {
                    const IconComponent = adapter.device.deviceId.startsWith('omapi')
                      ? Smartphone
                      : adapter.device.deviceId.startsWith('ble')
                        ? Bluetooth
                        : Usb;
                    return (
                      <TView style={{ marginRight: 4, marginTop: -2 }}>
                        <IconComponent size={15} color={selected ? "$accentColor" : "$color11"} />
                      </TView>
                    );
                  })()}
                  <TText
                    fontSize={12}
                    lineHeight={16}
                    color={selected ? '$accentColor' : '$color11'}
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
          <TView
            backgroundColor="$accentColor"
            style={{
              position: 'absolute',
              bottom: 0,
              left: (index * displayWidth) + ((displayWidth - displayWidth2) / 2),
              width: displayWidth2,
              height: 2,
              borderRadius: 1,
            }}
          />
        </Tabs.List>
      </Tabs>
      {
        selected && (adapter != null) && (
          adapter.device.available ? (
            <YStack flex={1} minHeight={0} gap={10} key={selected} marginTop={5}>
              <ProfileCardHeader deviceId={selected} />
              <ProfileSelector deviceId={selected} />
            </YStack>
          ): (
            <ScrollView
              bounces
              alwaysBounceVertical
              overScrollMode="always"
            >
              <YStack flex={1} paddingTop={20} gap={10}>
                <TText color="$textDefault" fontSize={18} textAlign="center">
                  {t('main:error_device')}
                </TText>
                <TText color="$color" fontSize={20} textAlign="center" marginBottom={40}>
                  {adapter.device.description}
                </TText>
                {
                  (Platform.OS === 'android' && adapter.device.signatures) && (
                    <>
                      <TText color="$textDefault" fontSize={18} textAlign="center">
                        {t('main:android_aram')}
                      </TText>
                      <YStack flex={1} paddingBottom={40} gap={10}>
                        {adapter.device.signatures.split(",").map((s: string) => (
                          <TText color="$textDefault" fontSize={14} textAlign="center" key={s} onPress={() => {
                            ToastAndroid.show(`ARA-M ${s} Copied`, ToastAndroid.SHORT);
                            Clipboard.setString(s)
                          }}>{s}</TText>
                        ))}
                      </YStack>
                    </>
                  )
                }
                {
                  (Platform.OS === 'android') && (
                    <>
                      <TText color="$textDefault" textDecorationLine="underline" fontSize={20} textAlign="center" marginTop={40} onPress={() => {
                        const { OMAPIBridge } = require("@/native/modules");
                        OMAPIBridge.openSTK(adapter.device.deviceName);
                      }}>
                        {t('main:open_stk_menu')}
                      </TText>
                    </>
                  )
                }
                <TText color="$accentColor" textDecorationLine="underline" fontSize={20} textAlign="center" marginTop={40} onPress={() => {
                  Linking.openURL(AppBuyLink);
                }}>
                  {t('main:purchase_note')}
                </TText>
              </YStack>
            </ScrollView>
          )
        )
      }
    </TView>
  )
}
