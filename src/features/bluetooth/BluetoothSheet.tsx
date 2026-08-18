import React, {useCallback, useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text as TText, useTheme, XStack, YStack} from 'tamagui';
import {Bed, HardDrive, Package, Usb} from '@tamagui/lucide-icons';
import {Device} from 'react-native-ble-plx';
import {useDispatch} from 'react-redux';

import AppSheet from '@/shared/ui/AppSheet';
import SectionLabel from '@/shared/ui/SectionLabel';
import RowGroup, {Row} from '@/shared/ui/RowGroup';
import Pill from '@/shared/ui/Pill';
import Loader from '@/shared/ui/Loader';
import {getBleManager, requestBluetoothPermission} from '@/shared/utils/bluetooth';
import {connectDevice, disconnectDevice, reconnectDevice} from '@/features/bluetooth/connection';
import {isSupportedBleName, setupDevices} from '@/lpa/deviceManager';
import {Adapters, ConnectedBluetoothDevices} from '@/lpa/adapters/registry';
import {makeLoading} from '@/shared/utils/loading';
import {useLoading} from '@/app/providers/LoadingProvider';
import {fontFamily, fontSize, iconSize, radius} from '@/shared/theme/tokens';

function iconFor(name: string) {
  return name.startsWith('ESTKme')
    ? Bed
    : name.startsWith('eSIM_Writer')
    ? Package
    : name.startsWith('BeeSIM')
    ? Usb
    : HardDrive;
}

/**
 * Bluetooth reader discovery, as a sheet over the profile list.
 *
 * A sheet rather than a pushed screen because connecting a reader is a
 * side-step, not a destination: a connected reader appears as another tab in
 * the strip you were just looking at, and pushing a full screen to get there
 * loses that context.
 *
 * Scanning is tied to `open` — the radio should not stay on behind a dismissed
 * sheet, which is what a screen left mounted in a navigator would do.
 */
export default function BluetoothSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {t} = useTranslation(['main']);
  const theme = useTheme();
  const dispatch = useDispatch();
  const {setLoading} = useLoading();
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);

  const addDevice = useCallback((scanned: Device) => {
    setDevices(prev => (prev.some(d => d.id === scanned.id) ? prev : [...prev, scanned]));
  }, []);

  useEffect(() => {
    if (!open) {
      setDevices([]);
      setScanning(false);
      return;
    }
    const bleManager = getBleManager();
    const subscription = bleManager.onStateChange(state => {
      if (state === 'PoweredOn') {
        requestBluetoothPermission().then(() => {
          bleManager.startDeviceScan(null, {}, (_error, scanned) => {
            setScanning(true);
            if (scanned !== null && isSupportedBleName(scanned.name)) {
              addDevice(scanned);
            }
          });
        });
        subscription.remove();
      }
    }, true);

    return () => {
      subscription.remove();
      bleManager.stopDeviceScan();
    };
  }, [open, addDevice]);

  const handleDisconnect = useCallback(
    (bleId: string) => {
      makeLoading(setLoading, async () => {
        await disconnectDevice(bleId, dispatch);
      });
    },
    [dispatch, setLoading],
  );

  const handleReconnect = useCallback(
    (bleId: string) => {
      makeLoading(setLoading, async () => {
        await reconnectDevice(bleId, dispatch);
      });
    },
    [dispatch, setLoading],
  );

  const handleConnect = useCallback(
    (device: Device) => {
      makeLoading(setLoading, async () => {
        setScanning(false);
        getBleManager().stopDeviceScan();
        await connectDevice(device);
        await setupDevices(dispatch, 'ble:' + device.id);
        onOpenChange(false);
      });
    },
    [dispatch, onOpenChange, setLoading],
  );

  return (
    <AppSheet open={open} onOpenChange={onOpenChange} title={t('main:bluetooth_readers')}>
      <YStack gap={16} paddingBottom={16}>
        <TText color="$color6" fontSize={fontSize.md}>
          {t('main:bluetooth_sheet_hint')}
        </TText>

        {ConnectedBluetoothDevices.length > 0 && (
          <YStack gap={8}>
            <YStack paddingLeft={4}>
              <SectionLabel>{t('main:bluetooth_connected')}</SectionLabel>
            </YStack>
            <RowGroup>
              {ConnectedBluetoothDevices.map(device => {
                const Icon = iconFor(device.name ?? '');
                const adapter = Adapters['ble:' + device.id];
                const live = adapter?.device.available === true;
                return (
                  <Row key={device.id}>
                    <XStack gap={12} alignItems="center">
                      <Icon size={iconSize.lg} color={theme.color6?.val as string} />
                      <YStack flex={1} minWidth={0} gap={3}>
                        <XStack alignItems="center" gap={8}>
                          <TText
                            color="$textDefault"
                            fontSize={fontSize.lg}
                            fontWeight={'600' as any}
                            numberOfLines={1}
                            flexShrink={1}>
                            {device.name}
                          </TText>
                          {!live && <Pill tone="danger">{t('main:bluetooth_offline')}</Pill>}
                        </XStack>
                        <TText
                          color="$color9"
                          fontFamily={fontFamily.mono as any}
                          fontSize={fontSize.xs}
                          numberOfLines={1}>
                          {device.id}
                        </TText>
                      </YStack>
                      {!live && (
                        <TouchableOpacity
                          onPress={() => handleReconnect(device.id)}
                          style={{
                            backgroundColor: theme.primaryColor?.val,
                            borderRadius: radius.md,
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                          }}>
                          <TText
                            color={theme.onFilled?.val}
                            fontSize={fontSize.md}
                            fontWeight={'600' as any}>
                            {t('main:bluetooth_reconnect')}
                          </TText>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => handleDisconnect(device.id)}
                        style={{
                          borderWidth: 1,
                          borderColor: theme.borderColor?.val,
                          borderRadius: radius.md,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                        }}>
                        <TText color="$color6" fontSize={fontSize.md}>
                          {t('main:bluetooth_disconnect')}
                        </TText>
                      </TouchableOpacity>
                    </XStack>
                  </Row>
                );
              })}
            </RowGroup>
          </YStack>
        )}

        {devices.length > 0 && (
          <YStack gap={8}>
            <YStack paddingLeft={4}>
              <SectionLabel>{t('main:bluetooth_available')}</SectionLabel>
            </YStack>
            <RowGroup>
              {devices
                .filter(d => !ConnectedBluetoothDevices.some(c => c.id === d.id))
                .map(device => {
                  const Icon = iconFor(device.name ?? '');
                  return (
                    <Row key={device.id}>
                      <XStack gap={12} alignItems="center">
                        <Icon size={iconSize.lg} color={theme.color6?.val as string} />
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
                          onPress={() => handleConnect(device)}
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

        {scanning && <Loader compact text={t('main:bluetooth_scanning')} />}
        {!scanning && devices.length === 0 && (
          <TText color="$color9" fontSize={fontSize.md}>
            {t('main:bluetooth_none_found')}
          </TText>
        )}
      </YStack>
    </AppSheet>
  );
}
