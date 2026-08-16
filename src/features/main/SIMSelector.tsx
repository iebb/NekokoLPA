import React, {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, Platform, ScrollView, ToastAndroid} from 'react-native';
import {Adapters} from '@/lpa/adapters/registry';
import {Text as TText, YStack, View as TView} from 'tamagui';
import SlotTabs from '@/features/main/components/SlotTabs';
import Clipboard from '@react-native-clipboard/clipboard';
import {preferences} from '@/shared/storage';
import PurchaseLinks from '@/shared/ui/PurchaseLinks';

import {useNavigation} from '@react-navigation/native';

import {useAppDispatch, useAppSelector, selectDeviceList} from '@/store';
import {setTargetDevice} from '@/store/slices';
import ProfileCardHeader from '@/features/main/ProfileCardHeader';
import ProfileSelector from '@/features/main/ProfileSelector';
import {OMAPIBridge} from '@/lpa/bridge/nativeModules';
import {fontSize} from '@/shared/theme/tokens';

export default function SIMSelector() {
  const navigation = useNavigation<any>();
  const {
    deviceList: allDevices,
    targetDevice,
    discoveryComplete,
  } = useAppSelector(selectDeviceList);
  const dispatch = useAppDispatch();
  const {t} = useTranslation(['main']);
  const showSlots = preferences.getString('showSlots');

  let deviceList = allDevices;

  if (showSlots === 'possible') {
    deviceList = allDevices.filter(
      x => Adapters[x].device.available || Adapters[x].device.slotAvailable,
    );
  } else if (showSlots === 'available') {
    deviceList = allDevices.filter(x => Adapters[x].device.available);
  }

  const firstAvailable = deviceList.map(x => Adapters[x].device.available).indexOf(true);
  const [currentTab, setCurrentTab] = React.useState<string | undefined>(
    firstAvailable < 0 ? deviceList[0] : deviceList[firstAvailable],
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
  }, [targetDevice, deviceList, dispatch]);

  // Tell Apple users a reader is required, but only once discovery has actually
  // run and come back empty. Keying this on deviceList alone fired the alert on
  // the initial render every launch, before discovery had a chance — so it
  // appeared even with a reader attached and listed behind it.
  const noDeviceAlertShown = useRef(false);
  useEffect(() => {
    if (Platform.OS !== 'ios' || !discoveryComplete || allDevices.length > 0) {
      return;
    }
    if (noDeviceAlertShown.current) {
      return;
    }
    noDeviceAlertShown.current = true;
    Alert.alert(
      'No Compatible Devices',
      Platform.isMacCatalyst
        ? 'A compatible external CCID reader is required.'
        : 'A compatible external CCID reader is required for iOS.',
      [{text: 'OK'}],
    );
  }, [discoveryComplete, allDevices.length]);

  if (deviceList.length === 0)
    return (
      <ScrollView bounces alwaysBounceVertical overScrollMode="always">
        <YStack flex={1} paddingTop={20} gap={10}>
          <TText color="$textDefault" fontSize={fontSize.xl} textAlign="center">
            {t('main:no_device')}
          </TText>
          <PurchaseLinks />
        </YStack>
      </ScrollView>
    );

  return (
    <TView flex={1} minHeight={0} key={deviceList.length}>
      <SlotTabs
        tabs={deviceList.map(name => ({
          key: name,
          label: Adapters[name].device.available
            ? Adapters[name].device.displayName
            : `${Adapters[name].device.displayName} · unavailable`,
        }))}
        selected={currentTab ?? ''}
        onSelect={setCurrentTab}
        onBluetooth={() => navigation.navigate('Bluetooth')}
        bluetoothActive={deviceList.some(name => Adapters[name].device.type === 'ble')}
        emptyLabel={t('main:no_chip_detected')}
      />
      {selected && adapter != null && (
        <YStack key={selected} flex={1} minHeight={0} opacity={1} x={0}>
          {adapter.device.available ? (
            <YStack flex={1} minHeight={0} key={selected}>
              <ProfileCardHeader deviceId={selected} />
              <ProfileSelector deviceId={selected} />
            </YStack>
          ) : (
            <ScrollView bounces alwaysBounceVertical overScrollMode="always">
              <YStack flex={1} paddingTop={20} gap={10}>
                <TText color="$textDefault" fontSize={fontSize.xl} textAlign="center">
                  {t('main:error_device')}
                </TText>
                <TText color="$color" fontSize={fontSize.xxl} textAlign="center" marginBottom={40}>
                  {adapter.device.description}
                </TText>
                {Platform.OS === 'android' && adapter.device.signatures && (
                  <>
                    <TText color="$textDefault" fontSize={fontSize.xl} textAlign="center">
                      {t('main:android_aram')}
                    </TText>
                    <YStack flex={1} paddingBottom={40} gap={10}>
                      {adapter.device.signatures.split(',').map((s: string) => (
                        <TText
                          color="$textDefault"
                          fontSize={fontSize.md}
                          textAlign="center"
                          key={s}
                          onPress={() => {
                            ToastAndroid.show(`ARA-M ${s} Copied`, ToastAndroid.SHORT);
                            Clipboard.setString(s);
                          }}>
                          {s}
                        </TText>
                      ))}
                    </YStack>
                  </>
                )}
                {Platform.OS === 'android' && (
                  <>
                    <TText
                      color="$textDefault"
                      textDecorationLine="underline"
                      fontSize={fontSize.xxl}
                      textAlign="center"
                      marginTop={40}
                      onPress={() => {
                        OMAPIBridge.openSTK(adapter.device.deviceName);
                      }}>
                      {t('main:open_stk_menu')}
                    </TText>
                  </>
                )}
                <PurchaseLinks />
              </YStack>
            </ScrollView>
          )}
        </YStack>
      )}
    </TView>
  );
}
