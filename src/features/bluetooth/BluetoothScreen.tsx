import React, {useCallback, useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import Screen from '@/shared/ui/Screen';
import type {RootScreenProps} from '@/app/navigation/types';
import Loader from '@/shared/ui/Loader';
import {Text as TText, XStack, YStack, useTheme} from 'tamagui';
import {Bed, HardDrive, Package, Usb} from '@tamagui/lucide-icons';
import {getBleManager, requestBluetoothPermission} from '@/shared/utils/bluetooth';
import {Device} from 'react-native-ble-plx';
import {connectDevice} from '@/features/bluetooth/connection';
import {isSupportedBleName, setupDevices} from '@/lpa/deviceManager';
import {useDispatch} from 'react-redux';
import {makeLoading} from '@/shared/utils/loading';
import {useLoading} from '@/app/providers/LoadingProvider';
import {fontFamily, fontSize, radius} from '@/shared/theme/tokens';
import SectionLabel from '@/shared/ui/SectionLabel';
import RowGroup, {Row} from '@/shared/ui/RowGroup';

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
              if (scannedDevice !== null && isSupportedBleName(scannedDevice.name)) {
                addDevice(scannedDevice);
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
          {devices.length > 0 && (
            <YStack gap={8}>
              <YStack paddingLeft={4}>
                <SectionLabel>{t('main:bluetooth_available')}</SectionLabel>
              </YStack>
              <RowGroup>
                {devices.map(device => {
                  const name = device.name ?? '';
                  const IconComponent = name.startsWith('ESTKme')
                    ? Bed
                    : name.startsWith('eSIM_Writer')
                    ? Package
                    : name.startsWith('BeeSIM')
                    ? Usb
                    : HardDrive;
                  return (
                    <Row key={device.id}>
                      <XStack gap={12} alignItems="center">
                        <IconComponent size={22} color={theme.color6?.val as string} />
                        <YStack flex={1} minWidth={0} gap={3}>
                          <TText
                            color="$textDefault"
                            fontSize={fontSize.lg}
                            fontWeight={'600' as any}
                            numberOfLines={1}>
                            {device.name}
                          </TText>
                          <TText
                            color="$color9"
                            fontFamily={fontFamily.mono as any}
                            fontSize={fontSize.xs}
                            numberOfLines={1}>
                            {device.id}
                          </TText>
                        </YStack>
                        <TouchableOpacity
                          onPress={async () => {
                            makeLoading(setLoading, async () => {
                              setScanning(false);
                              getBleManager().stopDeviceScan();
                              await connectDevice(device);
                              await setupDevices(dispatch, 'ble:' + device.id);
                              navigation.goBack();
                            });
                          }}
                          style={{
                            backgroundColor: theme.primaryColor?.val,
                            borderRadius: radius.md,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                          }}>
                          <TText
                            color={theme.onFilled?.val}
                            fontSize={fontSize.md}
                            fontWeight={'600' as any}>
                            {t('main:bluetooth_connect')}
                          </TText>
                        </TouchableOpacity>
                      </XStack>
                    </Row>
                  );
                })}
              </RowGroup>
            </YStack>
          )}
          {scanning && <Loader compact text={t('main:bluetooth_scan')} />}
        </YStack>
      </YStack>
    </Screen>
  );
}

export default BluetoothScan;
