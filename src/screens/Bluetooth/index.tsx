import React, {useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import Screen from '@/components/common/Screen';
import type {RootScreenProps} from "@/screens/navigation";
import UnifiedLoader from "@/components/common/UnifiedLoader";
import {Text as TText, View as TView, XStack, YStack, useTheme} from 'tamagui';
import {Bed, Package, HardDrive} from '@tamagui/lucide-icons';
import {bleManager, requestBluetoothPermission} from "@/utils/blue";
import {Device} from 'react-native-ble-plx';
import {connectDevice} from "@/screens/Bluetooth/connection";
import {setupDevices} from "@/native/setup";
import {useDispatch} from 'react-redux';
import {makeLoading} from "@/components/utils/loading";
import {useLoading} from "@/components/common/LoadingProvider";

function BluetoothScan({ route,  navigation }: RootScreenProps<'BluetoothScan'>) {
  const { t } = useTranslation(['main']);
  const [devices, setDevices] = useState<Device[]>([]);
  const dispatch = useDispatch();
  const { setLoading } = useLoading();
  const [scanning, setScanning] = useState(false);
  const theme = useTheme();


  const addDevice = (scannedDevice: Device) => {
    if (!devices.map(d => d.id).includes(scannedDevice.id)) {
      devices.push(scannedDevice);
      setDevices([...devices]);
    }
  }

  useEffect(() => {
    const subscription = bleManager.onStateChange(state => {
      if (state === 'PoweredOn') {
        requestBluetoothPermission().then(() => {
          bleManager.startDeviceScan(
            null, // ?Array<UUID>
            {}, // options: ? ScanOptions
            (error, scannedDevice) => {
              setScanning(true); // listener: (error: ?Error, scannedDevice: ?Device) => void
              if (scannedDevice !== null) {
                if (
                  scannedDevice.name?.startsWith("ESTKme-RED")
                  || scannedDevice.name?.startsWith("eSIM_Writer")
                ) {
                  addDevice(scannedDevice);
                }
              }
            }
          );
        })
        subscription.remove()
      }
    }, true)

    return () => {
      subscription.remove();
      bleManager.stopDeviceScan();
    }

  }, []);

  return (
    <Screen title={t('main:bluetooth_scan')}>
      <YStack gap={10} flex={1}>
        <YStack gap={10}>
          {
            devices.map(device => {
              return (
                <TouchableOpacity
                  key={device.id}
                  style={{ paddingVertical: 10 }}
                  onPress={async () => {
                    makeLoading(setLoading, async () => {
                      setScanning(false);
                      bleManager.stopDeviceScan();
                      await connectDevice(device);
                      await setupDevices(dispatch, "ble:" + device.id);
                      navigation.goBack();
                    })
                  }}
                >
                  <XStack gap={10} alignItems="center">
                    {(() => {
                      const IconComponent = device!.name!.startsWith("ESTKme") 
                        ? Bed 
                        : device!.name!.startsWith("eSIM_Writer") 
                          ? Package 
                          : HardDrive;
                      return (
                        <IconComponent size={40} color={theme.accentColor?.val as string} />
                      );
                    })()}
                    <YStack flex={1}>
                      <TText color="$textDefault" fontSize={14} fontWeight={"500" as any} style={{ marginTop: -2 }}>
                        {device.name}
                      </TText>
                      <TView>
                        <TText color="$color10" fontSize={12} fontWeight={"500" as any}>
                          {device.id}
                        </TText>
                      </TView>
                    </YStack>
                  </XStack>
                </TouchableOpacity>
              )})
          }
          {scanning && (
            <UnifiedLoader variant="circular" compact text={t('main:bluetooth_scan')} />
          )}
        </YStack>
      </YStack>
    </Screen>
  );

}

export default BluetoothScan;
