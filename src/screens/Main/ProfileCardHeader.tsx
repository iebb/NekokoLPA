import React, { useCallback, useMemo, useState } from "react";
import { Platform, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  Card,
  Text as TText,
  useTheme,
  XStack,
  YStack
} from 'tamagui';
import {
  ChevronRight,
  Copy,
  Settings,
  Info,
  Bell,
  Menu,
  HardDrive,
  Plus,
  GripVertical
} from '@tamagui/lucide-icons';
import Clipboard from "@react-native-clipboard/clipboard";

import AppSheet from '@/components/common/AppSheet';
import { Adapters } from "@/native/adapters/registry";
import { formatSize, getEstimatedProfileSize } from "@/utils/size";
import { toFriendlyName } from "@/utils/friendlyName";
import { makeLoading } from "@/components/utils/loading";
import { useToast } from "@/components/common/ToastProvider";
import { useLoading } from "@/components/common/LoadingProvider";
import { selectDeviceState } from "@/redux/stateStore";

// Extracted components
const ActionSheetOptions = React.memo(({
  deviceId,
  DeviceState,
  adapter,
  navigation,
  euiccMenu,
  setEuiccMenu,
  setLoading,
  showToast
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
  const { t } = useTranslation(['main']);
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
    const { OMAPIBridge } = require("@/native/modules");
    OMAPIBridge.openSTK(adapter.device.deviceName);
  }, [adapter.device.deviceName]);

  const handleEuiccInfo = useCallback(() => {
    navigation.navigate('EuiccInfo', { deviceId });
  }, [navigation, deviceId]);



  const handleManageNotifications = useCallback(() => {
    navigation.navigate('Notifications', { deviceId });
  }, [navigation, deviceId]);

  const handleSendNotifications = useCallback(async () => {
    makeLoading(
      setLoading,
      async () => {
        showToast('Refreshing Notifications...', 'success');
        await adapter.processNotifications('');
      }
    );
  }, [setLoading, adapter, showToast]);

  const options = useMemo(() => [
    { label: t('main:eid_copy'), icon: Copy, onPress: handleEidCopy },
    ...(((Platform.OS === 'android' && deviceId.startsWith("omapi")) ? [{
      label: t('main:open_stk_menu'), icon: Menu, onPress: handleOpenSTK
    }] : [])),
    { label: 'EUICC Info', icon: Info, onPress: handleEuiccInfo },
    { label: t('main:manage_notifications'), icon: Settings, onPress: handleManageNotifications },
    { label: t('main:notifications_send'), icon: Bell, onPress: handleSendNotifications },
  ], [
    t, deviceId, adapter, navigation, setEuiccMenu,
    handleEidCopy, handleOpenSTK, handleEuiccInfo,
    handleManageNotifications, handleSendNotifications
  ]);

  return (
    <AppSheet open={euiccMenu} onOpenChange={setEuiccMenu} title="eUICC Management">
      <YStack gap={8} paddingBottom={20}>
        <YStack backgroundColor="$surfaceSpecial" padding={12} borderRadius={12} marginBottom={8}>
          <TText color="$color6" fontSize={11} textTransform="uppercase" letterSpacing={1} marginBottom={4}>Current EID</TText>
          <TText color="$textDefault" fontSize={14} fontWeight="600" style={{ fontFamily: 'monospace' }}>{DeviceState?.eid}</TText>
        </YStack>
        {options.map((opt, idx) => (
          <TouchableOpacity
            key={idx}
            activeOpacity={0.6}
            onPress={() => { setEuiccMenu(false); opt.onPress(); }}
          >
            <XStack alignItems="center" gap={12} paddingVertical={12}>
              <YStack padding={8} borderRadius={8} position="relative">
                <YStack position="absolute" top={0} left={0} right={0} bottom={0} backgroundColor="$primaryColor" borderRadius={8} opacity={0.1} />
                <opt.icon size={18} color={theme.primaryColor?.val} />
              </YStack>
              <TText color="$textDefault" fontSize={15} flex={1}>{opt.label}</TText>
              <ChevronRight size={18} color="$color6" />
            </XStack>
          </TouchableOpacity>
        ))}
      </YStack>
    </AppSheet>
  );
});

export default function ProfileCardHeader({ deviceId }: { deviceId: string }) {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['main']);
  const [euiccMenu, setEuiccMenu] = useState(false);

  const DeviceState = useSelector(selectDeviceState(deviceId)) ?? {};

  const stealthMode = useMemo(() => "none", []);
  const adapter = Adapters[deviceId];
  const { showToast } = useToast();
  const { setLoading } = useLoading();

  const { eid, maskedEid } = useMemo(() => {
    const eidStr = String(DeviceState?.eid ?? "");
    if (stealthMode === 'hard') return { eid: eidStr, maskedEid: "**** **** **** ****" };
    return {
      eid: eidStr,
      maskedEid: eidStr.length > 20 ? eidStr.substring(0, 8) + "..." + eidStr.substring(eidStr.length - 8) : eidStr
    };
  }, [DeviceState?.eid, stealthMode]);

  const supplementText = useMemo(() => toFriendlyName(eid, DeviceState.euiccInfo2), [eid, DeviceState.euiccInfo2]);



  const { freeSpacePercent, exactFreeBytes } = useMemo(() => {
    const used = (DeviceState.profiles || []).reduce((acc: number, p: any) => {
      // Assuming all installed profiles take space
      return acc + getEstimatedProfileSize(p, DeviceState.eid || "");
    }, 0);

    // bytesFree is exact, but total is unknown. So assume Total = Free + EstimatedUsed
    const free = DeviceState.bytesFree || 0;
    const estimatedTotal = free + used;

    console.log("Free: " + free);
    console.log("Used: " + used);
    console.log("Total: " + estimatedTotal);
    console.log("Percent: " + freeSpacePercent);

    return {
      freeSpacePercent: estimatedTotal > 0 ? Math.max(0, Math.min(100, (free / estimatedTotal) * 100)) : 0,
      exactFreeBytes: free
    };
  }, [DeviceState.profiles, DeviceState.eid, DeviceState.bytesFree]);

  return (
    <YStack marginVertical={8} gap={8}>


      {DeviceState?.eid && euiccMenu && (
        <ActionSheetOptions
          deviceId={deviceId} DeviceState={DeviceState} adapter={adapter} navigation={navigation}
          euiccMenu={euiccMenu} setEuiccMenu={setEuiccMenu} setLoading={setLoading}
          showToast={showToast}
        />
      )}

      <Card backgroundColor="$surfaceSpecial" borderRadius={16} padding={12} onPress={() => setEuiccMenu(true)}>
        <YStack gap={10}>
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack gap={3} flex={1}>
              <XStack gap={6} alignItems="center">
                <TText color="$primaryColor" fontSize={11} fontWeight="700" textTransform="uppercase" letterSpacing={0.5}>
                  {supplementText || "eUICC Status"}
                </TText>
                <YStack padding={2} borderRadius={4} position="relative">
                  <YStack position="absolute" top={0} left={0} right={0} bottom={0} backgroundColor="$primaryColor" borderRadius={4} opacity={0.2} />
                  <HardDrive size={9} color={theme.primaryColor?.val} />
                </YStack>
              </XStack>
              <TText color="$textDefault" fontSize={15} fontWeight="600" style={{ fontFamily: 'monospace' }}>
                {maskedEid}
              </TText>
            </YStack>

            <XStack gap={6}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Scanner', { deviceId })}
                style={{
                  backgroundColor: theme.primaryColor?.val,
                  padding: 8,
                  borderRadius: 10,
                  elevation: 2
                }}
              >
                <Plus size={18} color={theme.background?.val || '#fff'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setEuiccMenu(true)}
                style={{
                  backgroundColor: theme.color3?.val,
                  padding: 8,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: theme.borderColor?.val
                }}
              >
                <GripVertical size={18} color={theme.color8?.val} />
              </TouchableOpacity>
            </XStack>
          </XStack>

          <YStack gap={4}>
            <XStack justifyContent="space-between" alignItems="center">
              <TText color="$color9" fontSize={11} fontWeight="500">Available Storage</TText>
              <TText color="$textDefault" fontSize={11} fontWeight="700">{formatSize(exactFreeBytes)}</TText>
            </XStack>
            <YStack height={5} backgroundColor="$color3" borderRadius={2.5} overflow="hidden">
              <YStack
                height="100%"
                width={`${freeSpacePercent}%`}
                backgroundColor="$primaryColor"
                borderRadius={2.5}
              />
            </YStack>
          </YStack>
        </YStack>
      </Card>
    </YStack>
  );
}
