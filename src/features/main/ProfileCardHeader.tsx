import React, {useCallback, useMemo, useState} from 'react';
import {Platform, ToastAndroid, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {Text as TText, useTheme, XStack, YStack} from 'tamagui';
import {Bell, ChevronRight, Copy, Info, Menu, Settings} from '@tamagui/lucide-icons';
import Clipboard from '@react-native-clipboard/clipboard';

import AppSheet from '@/shared/ui/AppSheet';
import {Adapters} from '@/lpa/adapters/registry';
import {useFormatSize} from '@/shared/hooks/useFormatSize';
import {toFriendlyName} from '@/shared/utils/friendlyName';
import {makeLoading} from '@/shared/utils/loading';
import {useToast} from '@/app/providers/ToastProvider';
import {useLoading} from '@/app/providers/LoadingProvider';
import {selectDeviceState} from '@/store';
import {OMAPIBridge} from '@/lpa/bridge/nativeModules';
import {fontFamily, fontSize, iconSize, radius} from '@/shared/theme/tokens';
import SectionLabel from '@/shared/ui/SectionLabel';
import {group, isRedactMode, maskEid} from '@/shared/utils/redact';
import {usePreference} from '@/shared/hooks/usePreference';

// Extracted components
const ActionSheetOptions = React.memo(
  ({
    deviceId,
    DeviceState,
    adapter,
    navigation,
    euiccMenu,
    setEuiccMenu,
    setLoading,
    showToast,
  }: {
    deviceId: string;
    DeviceState: any;
    adapter: any;
    navigation: any;
    euiccMenu: boolean;
    setEuiccMenu: (visible: boolean) => void;
    setLoading: any;
    showToast: any;
  }) => {
    const {t} = useTranslation(['main']);
    const theme = useTheme();

    const handleEidCopy = useCallback(() => {
      if (DeviceState.eid) {
        Clipboard.setString(DeviceState.eid);
        if (Platform.OS === 'android') {
          ToastAndroid.show('EID Copied', ToastAndroid.SHORT);
        }
      }
    }, [DeviceState.eid]);

    const handleOpenSTK = useCallback(() => {
      OMAPIBridge.openSTK(adapter.device.deviceName);
    }, [adapter.device.deviceName]);

    const handleEuiccInfo = useCallback(() => {
      navigation.navigate('EuiccInfo', {deviceId});
    }, [navigation, deviceId]);

    const handleManageNotifications = useCallback(() => {
      navigation.navigate('Notifications', {deviceId});
    }, [navigation, deviceId]);

    const handleSendNotifications = useCallback(async () => {
      makeLoading(setLoading, async () => {
        showToast('Refreshing Notifications...', 'success');
        await adapter.processNotifications('');
      });
    }, [setLoading, adapter, showToast]);

    const options = useMemo(
      () => [
        {label: t('main:eid_copy'), icon: Copy, onPress: handleEidCopy},
        ...(Platform.OS === 'android' && deviceId.startsWith('omapi')
          ? [
              {
                label: t('main:open_stk_menu'),
                icon: Menu,
                onPress: handleOpenSTK,
              },
            ]
          : []),
        {label: 'EUICC Info', icon: Info, onPress: handleEuiccInfo},
        {label: t('main:manage_notifications'), icon: Settings, onPress: handleManageNotifications},
        {label: t('main:notifications_send'), icon: Bell, onPress: handleSendNotifications},
      ],
      [
        t,
        deviceId,
        handleEidCopy,
        handleOpenSTK,
        handleEuiccInfo,
        handleManageNotifications,
        handleSendNotifications,
      ],
    );

    return (
      <AppSheet open={euiccMenu} onOpenChange={setEuiccMenu} title="eUICC Management">
        <YStack gap={8} paddingBottom={20}>
          <YStack
            backgroundColor="$surfaceSpecial"
            padding={12}
            borderRadius={radius.md}
            marginBottom={8}>
            <TText
              color="$color6"
              fontSize={fontSize.xs}
              textTransform="uppercase"
              letterSpacing={1}
              marginBottom={4}>
              Current EID
            </TText>
            <TText
              color="$textDefault"
              fontSize={fontSize.md}
              fontWeight="600"
              style={{fontFamily: 'monospace'}}>
              {DeviceState?.eid}
            </TText>
          </YStack>
          {options.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.6}
              onPress={() => {
                setEuiccMenu(false);
                opt.onPress();
              }}>
              <XStack alignItems="center" gap={12} paddingVertical={12}>
                <YStack padding={8} borderRadius={radius.sm} position="relative">
                  <YStack
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    backgroundColor="$primaryColor"
                    borderRadius={radius.sm}
                    opacity={0.1}
                  />
                  <opt.icon size={iconSize.md} color={theme.primaryColor?.val} />
                </YStack>
                <TText color="$textDefault" fontSize={fontSize.md} flex={1}>
                  {opt.label}
                </TText>
                <ChevronRight size={iconSize.sm} color="$color6" />
              </XStack>
            </TouchableOpacity>
          ))}
        </YStack>
      </AppSheet>
    );
  },
);

export default function ProfileCardHeader({deviceId}: {deviceId: string}) {
  const {t} = useTranslation(['main']);
  const theme = useTheme();
  const formatSize = useFormatSize();
  const navigation = useNavigation<any>();
  const [euiccMenu, setEuiccMenu] = useState(false);

  const DeviceState = useSelector(selectDeviceState(deviceId)) ?? {};

  const storedRedact = usePreference('redactMode', 'none');
  const stealthMode = isRedactMode(storedRedact) ? storedRedact : 'none';
  const adapter = Adapters[deviceId];
  const {showToast} = useToast();
  const {setLoading} = useLoading();

  const eid = String(DeviceState?.eid ?? '');

  /**
   * The EID as the card prints it: 32 digits in groups of four.
   *
   * Grouping is what makes it checkable by eye against the physical chip, so
   * it applies to the redacted form too — masked digits keep their positions
   * rather than collapsing to an ellipsis.
   */
  const groupedEid = useMemo(
    () => group(maskEid(DeviceState?.eid, stealthMode)),
    [DeviceState?.eid, stealthMode],
  );

  const supplementText = useMemo(
    () => toFriendlyName(eid, DeviceState.euiccInfo2),
    [eid, DeviceState.euiccInfo2],
  );

  const profileCount = DeviceState.profiles?.length ?? 0;
  const profileCountLabel =
    profileCount === 1 ? t('main:one_profile') : t('main:n_profiles', {count: profileCount});

  const exactFreeBytes = DeviceState.bytesFree ?? 0;

  return (
    <YStack gap={8}>
      {DeviceState?.eid && euiccMenu && (
        <ActionSheetOptions
          deviceId={deviceId}
          DeviceState={DeviceState}
          adapter={adapter}
          navigation={navigation}
          euiccMenu={euiccMenu}
          setEuiccMenu={setEuiccMenu}
          setLoading={setLoading}
          showToast={showToast}
        />
      )}

      {/* The chip card. Everything identifying the eUICC is mono — the EID is
          grouped in fours so it can be read off against the card itself — and
          the two actions live in a hairline-separated footer rather than as
          floating icon buttons, so the card reads as one object. */}
      <YStack
        backgroundColor="$surfaceRow"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius={radius.lg}
        overflow="hidden">
        <YStack padding={13} gap={7}>
          <XStack alignItems="baseline" justifyContent="space-between" gap={10}>
            <SectionLabel color="$primaryColor">{supplementText || 'eUICC'}</SectionLabel>
            <TText color="$color9" fontSize={fontSize.sm}>
              {profileCountLabel}
            </TText>
          </XStack>

          {/* EID and free space share a row. The EID yields first — it is the
              longest string on the card and the one that can be truncated
              without losing the point, since it is grouped for checking
              against the chip, not for reading aloud. */}
          <XStack alignItems="baseline" gap={12}>
            <TText
              flex={1}
              minWidth={0}
              numberOfLines={1}
              ellipsizeMode="tail"
              color="$color6"
              fontFamily={fontFamily.mono as any}
              fontSize={fontSize.xs}
              lineHeight={16}>
              {groupedEid}
            </TText>
            <XStack flexShrink={0} alignItems="baseline" gap={5}>
              <TText
                color="$textDefault"
                fontFamily={fontFamily.mono as any}
                fontSize={fontSize.md}
                fontWeight={'600' as any}>
                {formatSize(exactFreeBytes)}
              </TText>
              <TText color="$color9" fontSize={fontSize.sm}>
                {t('main:euicc_available')}
              </TText>
            </XStack>
          </XStack>
        </YStack>

        <XStack backgroundColor="$borderColor" gap={1} borderTopWidth={1} borderTopColor="$borderColor">
          <TouchableOpacity
            style={{flex: 1, backgroundColor: theme.surfaceRow?.val, padding: 12}}
            onPress={() => navigation.navigate('Scanner', {deviceId})}>
            <TText
              textAlign="center"
              color="$primaryColor"
              fontSize={fontSize.md}
              fontWeight={'600' as any}>
              {t('main:add_profile')}
            </TText>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flex: 1, backgroundColor: theme.surfaceRow?.val, padding: 12}}
            onPress={() => setEuiccMenu(true)}>
            <TText
              textAlign="center"
              color="$color6"
              fontSize={fontSize.md}
              fontWeight={'500' as any}>
              {t('main:manage')}
            </TText>
          </TouchableOpacity>
        </XStack>
      </YStack>
    </YStack>
  );
}
