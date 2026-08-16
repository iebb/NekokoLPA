import React, {useCallback, useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import Screen from '@/shared/ui/Screen';
import type {RootScreenProps} from '@/app/navigation/types';
import Loader from '@/shared/ui/Loader';
import {Text as TText, View as TView, XStack, YStack, useTheme} from 'tamagui';
import {Bed, Package, HardDrive} from '@tamagui/lucide-icons';
import {getBleManager, requestBluetoothPermission} from '@/shared/utils/bluetooth';
import {Device} from 'react-native-ble-plx';
import {connectDevice} from '@/features/bluetooth/connection';
import {setupDevices} from '@/lpa/deviceManager';
import {useDispatch} from 'react-redux';
import {makeLoading} from '@/shared/utils/loading';
import {useLoading} from '@/app/providers/LoadingProvider';

function BluetoothScan({navigation}: RootScreenProps<'BluetoothScan'>) {
  const {t} = useTranslation(['main']);
  const [devices, setDevices] = useState<Device[]>([]);
  const dispatch = useDispatch();
  const {setLoading} = useLoading();
  const [scanning, setScanning] = useState(false);
  const theme = useTheme();

  // Functional update: the scan callback lives in a mount-only effect, so it
  // would otherwise capture a stale `devices` array and mutate it in place.
  const addDevice = useCallback((scannedDevice: Device) => {
    setDevices(prev =>
      prev.some(d => d.id === scannedDevice.id) ? prev : [...prev, scannedDevice],
    );
  }, []);

  useEffect(() => {
    const bleManager = getBleManager();
    const subscription = bleManager.onStateChange(state => {
      if (state === 'PoweredOn') {
        requestBluetoothPermission().then(() => {
          bleManager.startDeviceScan(
            null, // ?Array<UUID>
            {}, // options: ? ScanOptions
            (_error, scannedDevice) => {
              setScanning(true); // listener: (error: ?Error, scannedDevice: ?Device) => void
              if (scannedDevice !== null) {
                if (
                  scannedDevice.name?.startsWith('ESTKme-RED') ||
                  scannedDevice.name?.startsWith('eSIM_Writer')
                ) {
                  addDevice(scannedDevice);
                }
              }
            },
          );
        });
        subscription.remove();
      }
    }, true);

    return () => {
      subscription.remove();
      bleManager.stopDeviceScan();
    };
  }, [addDevice]);

  return (
    <Screen title={t('main:bluetooth_scan')}>
      <YStack gap={10} flex={1}>
        <YStack gap={10}>
          {devices.map(device => {
            return (
              <TouchableOpacity
                key={device.id}
                style={{paddingVertical: 10}}
                onPress={async () => {
                  makeLoading(setLoading, async () => {
                    setScanning(false);
                    getBleManager().stopDeviceScan();
                    await connectDevice(device);
                    await setupDevices(dispatch, 'ble:' + device.id);
                    navigation.goBack();
                  });
                }}>
                <XStack gap={10} alignItems="center">
                  {(() => {
                    const IconComponent = device!.name!.startsWith('ESTKme')
                      ? Bed
                      : device!.name!.startsWith('eSIM_Writer')
                      ? Package
                      : HardDrive;
                    return <IconComponent size={40} color={theme.primaryColor?.val as string} />;
                  })()}
                  <YStack flex={1}>
                    <TText
                      color="$textDefault"
                      fontSize={14}
                      fontWeight={'500' as any}
                      style={{marginTop: -2}}>
                      {device.name}
                    </TText>
                    <TView>
                      <TText color="$color6" fontSize={12} fontWeight={'500' as any}>
                        {device.id}
                      </TText>
                    </TView>
                  </YStack>
                </XStack>
              </TouchableOpacity>
            );
          })}
          {scanning && <Loader compact text={t('main:bluetooth_scan')} />}
        </YStack>
      </YStack>
    </Screen>
  );
}

export default BluetoothScan;
