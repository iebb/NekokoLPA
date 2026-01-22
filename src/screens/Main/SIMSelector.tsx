import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/reduxDataStore";
import { useTranslation } from "react-i18next";
import { Alert, Dimensions, Linking, NativeModules, Platform, ScrollView, ToastAndroid } from "react-native";
import { Adapters } from "@/native/adapters/registry";
import { Tabs, Text as TText, XStack, YStack, View as TView, Separator, AnimatePresence } from 'tamagui';
import { Smartphone, Bluetooth, Usb } from '@tamagui/lucide-icons';
import Clipboard from "@react-native-clipboard/clipboard";
import { preferences } from "@/utils/mmkv";
import { AppBuyLink } from "@/config";

import { setTargetDevice } from "@/redux/stateStore";
import ProfileCardHeader from "@/screens/Main/ProfileCardHeader";
import ProfileSelector from "@/screens/Main/ProfileSelector";
import { OMAPIBridge } from "@/native/modules";



export default function SIMSelector() {
  const ds = useSelector((state: RootState) => state.DeviceState);
  const { deviceList: _deviceList, targetDevice } = useSelector((state: RootState) => state.LPA);
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
  const [currentTab, setCurrentTab] = React.useState<string | undefined>(
    firstAvailable < 0 ? deviceList[0] : deviceList[firstAvailable]
  );


  const selected = currentTab;
  const adapter = selected ? Adapters[selected] : null;



  useEffect(() => {
    if (!currentTab && deviceList.length > 0) {
      const firstAvailable = deviceList.map(x => Adapters[x].device.available).indexOf(true);
      setCurrentTab(firstAvailable < 0 ? deviceList[0] : deviceList[firstAvailable]);
    }
  }, [deviceList, currentTab]);

  useEffect(() => {
    if (targetDevice) {
      if (deviceList.indexOf(targetDevice) !== -1) {
        setCurrentTab(targetDevice);
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
        <TText color="$primaryColor" textDecorationLine="underline" fontSize={20} textAlign="center" marginTop={40} onPress={() => {
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
        value={currentTab}
        onValueChange={setCurrentTab}
        borderRadius={12}
      >
        <Tabs.List
          borderRadius={12}
          orientation="horizontal"
          flexDirection="row"
          borderColor="$surfaceSpecial"
          backgroundColor="$surfaceSpecial"
          width="100%"
        >
          {deviceList.map((name, _idx) => {
            const adapter = Adapters[name];
            const label = adapter.device.available ?
              adapter.device.displayName
              : `${adapter.device.displayName}\nunavailable`;
            return (
              <Tabs.Tab
                key={`${name}-${_idx}`}
                value={name}
                style={{ backgroundColor: 'transparent' }}
                flex={1}
                flexBasis={0}
              >
                <YStack position="relative" width="100%">
                  <XStack alignItems="center" justifyContent="center" gap={3} paddingHorizontal={6} paddingVertical={4} width="100%">
                    {(() => {
                      const IconComponent = adapter.device.deviceId.startsWith('omapi')
                        ? Smartphone
                        : adapter.device.deviceId.startsWith('ble')
                          ? Bluetooth
                          : Usb;
                      return (
                        <IconComponent
                          size={12}
                          color={name === currentTab ? "$primaryColor" : "$color6"}
                        />
                      );
                    })()}
                    <TText
                      fontSize="$2"
                      lineHeight="$2"
                      color={name === currentTab ? '$primaryColor' : '$color6'}
                      numberOfLines={2}
                      flexShrink={1}
                      textAlign="center"
                    >
                      {label}
                    </TText>
                  </XStack>
                  <YStack
                    position="absolute"
                    bottom={0}
                    left={0}
                    height={2}
                    backgroundColor="$primaryColor"
                    width="100%"
                    opacity={name === currentTab ? 1 : 0}
                    scaleX={name === currentTab ? 1 : 0}
                  />
                </YStack>
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs>
      {selected && (adapter != null) && (
        <YStack
          key={selected}
          flex={1}
          minHeight={0}
          opacity={1}
          x={0}
        >
          {adapter.device.available ? (
            <YStack flex={1} minHeight={0} key={selected}>
              <ProfileCardHeader deviceId={selected} />
              <ProfileSelector deviceId={selected} />
            </YStack>
          ) : (
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
                <TText color="$primaryColor" textDecorationLine="underline" fontSize={20} textAlign="center" marginTop={40} onPress={() => {
                  Linking.openURL(AppBuyLink);
                }}>
                  {t('main:purchase_note')}
                </TText>
              </YStack>
            </ScrollView>
          )}
        </YStack>
      )}
    </TView>
  )
}
