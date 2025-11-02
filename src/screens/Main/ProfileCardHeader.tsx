import {Button as TButton, Card, Input, Text as TText, useTheme, XStack, YStack} from 'tamagui';
import AppSheet from '@/components/common/AppSheet';
import {Platform, ToastAndroid, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {MessageSquareShare, Plus} from '@tamagui/lucide-icons';
import {useNavigation} from "@react-navigation/native";
import {useTranslation} from "react-i18next";
import {Adapters} from "@/native/adapters/registry";
import Clipboard from "@react-native-clipboard/clipboard";
import {preferences} from "@/utils/mmkv";
import {formatSize} from "@/utils/size";
import {toCIName, toFriendlyName} from "@/utils/friendlyName";
import {getNicknameByEid, setNicknameByEid} from "@/configs/store";
import {RootState} from "@/redux/reduxDataStore";
import {makeLoading} from "@/components/utils/loading";
import {useToast} from "@/components/common/ToastProvider";
import {useLoading} from "@/components/common/LoadingProvider";

// Extracted components
const ActionSheetOptions = React.memo(({
                                         deviceId,
                                         DeviceState,
                                         adapter,
                                         navigation,
                                         euiccMenu,
                                         setEuiccMenu,
                                         setLoading,
                                         showToast,
                                         setNicknameSheetOpen
                                       }: {
  deviceId: string;
  DeviceState: any;
  adapter: any;
  navigation: any;
  euiccMenu: boolean;
  setEuiccMenu: (visible: boolean) => void;
  setLoading: any;
  showToast: any;
  setNicknameSheetOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation(['main']);

  const handleEidCopy = useCallback(() => {
    ToastAndroid.show('EID Copied', ToastAndroid.SHORT);
    Clipboard.setString(DeviceState.eid!);
  }, [DeviceState.eid]);

  const handleOpenSTK = useCallback(() => {
    const { OMAPIBridge } = require("@/native/modules");
    OMAPIBridge.openSTK(adapter.device.deviceName);
  }, [adapter.device.deviceName]);

  const handleEuiccInfo = useCallback(() => {
    navigation.navigate('EuiccInfo', { deviceId });
  }, [navigation, deviceId]);

  const handleSetNickname = useCallback(() => {
    setEuiccMenu(false);
    setNicknameSheetOpen(true);
  }, [setEuiccMenu, setNicknameSheetOpen]);

  const handleManageNotifications = useCallback(() => {
    navigation.navigate('Notifications', { deviceId });
  }, [navigation, deviceId]);

  const handleSendNotifications = useCallback(async () => {
    makeLoading(
      setLoading,
      async () => {
        showToast('Loading Notifications. This may take some time.', 'success');
        await adapter.processNotifications('');
        showToast('Loading Notifications. This may take some time.', 'success');
      }
    );
  }, [setLoading, adapter, showToast]);

  const options = useMemo(() => [
    {
      label: t('main:eid_copy'),
      onPress: handleEidCopy
    },
    ...(((Platform.OS === 'android' && deviceId.startsWith("omapi")) ? [{
      label: t('main:open_stk_menu'),
      onPress: handleOpenSTK
    }] : [])),
    {
      label: 'EUICC Info',
      onPress: handleEuiccInfo
    },
    {
      label: t('main:set_nickname'),
      onPress: handleSetNickname
    },
    {
      label: t('main:manage_notifications'),
      onPress: handleManageNotifications
    },
    {
      label: t('main:notifications_send'),
      onPress: handleSendNotifications
    },
  ], [
    t, deviceId, adapter, navigation, setEuiccMenu, setNicknameSheetOpen,
    handleEidCopy, handleOpenSTK, handleEuiccInfo,
    handleSetNickname, handleManageNotifications, handleSendNotifications
  ]);

  return (
    <AppSheet open={euiccMenu} onOpenChange={setEuiccMenu} title={`EID: ${DeviceState?.eid}`} titleProps={{
      fontSize: 14,
    }}>
      <YStack>
        {options.map((opt, idx) => (
          <TouchableOpacity
            key={idx}
            activeOpacity={0.6}
            onPress={() => { setEuiccMenu(false); opt.onPress(); }}
            style={{ paddingBottom: 24 }}
          >
            <TText color="$textDefault" fontSize={14}>{opt.label}</TText>
          </TouchableOpacity>
        ))}
      </YStack>
    </AppSheet>
  );
});

const CardContent = React.memo(({
                                  DeviceState,
                                  maskedEid,
                                  supplementText
                                }: {
  DeviceState: any;
  maskedEid: string;
  supplementText: string;
}) => {
  const { t } = useTranslation(['main']);

  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 3, flex: 1 }}>
      {/* First Row */}
      <View style={{ flexDirection: 'row', width: '100%' }}>
        <TText color="$textDefault" fontSize={11} numberOfLines={1}>
          {t('main:available_space', {
            size: formatSize(DeviceState.bytesFree),
          })}
        </TText>
        <TText
          color="$textDefault"
          fontSize={11}
          style={{ textAlign: 'right', flexGrow: 1 }}
          numberOfLines={1}
        >
          CI: {DeviceState.euiccInfo2?.euiccCiPKIdListForSigning.map((x: any) => toCIName(x)).join(', ')}
        </TText>
      </View>

      {/* Second Row */}
      <View style={{ flexDirection: 'row', width: '100%' }}>
        <TText color="$textDefault" fontSize={11}>
          EID: {maskedEid}
        </TText>
        <TText
          color="$textDefault"
          fontSize={11}
          style={{ textAlign: 'right', flexGrow: 1 }}
          numberOfLines={1}
        >
          {supplementText}
        </TText>
      </View>
    </View>
  );
});

const RoundedButton = (props: any) => {

  const {radiusL, radiusR } = props;

  return (
    <TButton
      size="$3"
      width={40}
      height={40}
      borderTopLeftRadius={radiusL}
      borderBottomLeftRadius={radiusL}
      borderTopRightRadius={radiusR}
      borderBottomRightRadius={radiusR}
      {...props}
    />
  );
}

export default function ProfileCardHeader({ deviceId } : { deviceId: string }) {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['main']);
  const [euiccMenu, setEuiccMenu] = useState(false);
  const [nicknameSheetOpen, setNicknameSheetOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const DeviceState = useSelector((state: RootState) => state.DeviceState[deviceId]) ?? {};

  // Memoize preferences
  const stealthMode = useMemo(() =>
      preferences.getString("redactMode") ?? "none",
    []
  );

  const adapter = Adapters[deviceId];
  const { showToast } = useToast();
  const { setLoading } = useLoading();

  // Memoize EID processing
  const { eid, maskedEid } = useMemo(() => {
    const eid = (DeviceState?.eid) ?? "";
    const maskedEid = stealthMode === 'none' ? eid : (
      eid.substring(0, stealthMode === 'medium' ? 18 : 13) + "..."
    );
    return { eid, maskedEid };
  }, [DeviceState?.eid, stealthMode]);

  // Memoize supplement text
  const supplementText = useMemo(() =>
      toFriendlyName(eid, DeviceState.euiccInfo2),
    [eid, DeviceState.euiccInfo2]
  );

  // Memoize action sheet visibility
  const shouldShowActionSheet = useMemo(() =>
      DeviceState?.eid && euiccMenu,
    [DeviceState?.eid, euiccMenu]
  );

  const handleCardPress = useCallback(() => {
    setEuiccMenu(true);
  }, []);

  const handleNicknameSubmit = useCallback(() => {
    if (DeviceState?.eid) {
      setNicknameByEid(DeviceState.eid, nicknameInput);
      setNicknameSheetOpen(false);
      setNicknameInput('');
      if (Platform.OS === 'android') {
        ToastAndroid.show('Nickname saved', ToastAndroid.SHORT);
      }
    }
  }, [DeviceState?.eid, nicknameInput]);

  // Initialize nickname input when sheet opens
  React.useEffect(() => {
    if (nicknameSheetOpen && DeviceState?.eid) {
      setNicknameInput(getNicknameByEid(DeviceState.eid) || '');
    }
  }, [nicknameSheetOpen, DeviceState?.eid]);

  return (
    <View>
      {shouldShowActionSheet && (
        <ActionSheetOptions
          deviceId={deviceId}
          DeviceState={DeviceState}
          adapter={adapter}
          navigation={navigation}
          euiccMenu={euiccMenu}
          setEuiccMenu={setEuiccMenu}
          setLoading={setLoading}
          showToast={showToast}
          setNicknameSheetOpen={setNicknameSheetOpen}
        />
      )}

      {
        nicknameSheetOpen && (
          <AppSheet
            open={nicknameSheetOpen}
            onOpenChange={setNicknameSheetOpen}
            title={t('main:set_nickname')}
          >
            <YStack gap={16}>
              <TText color="$color10" fontSize={14}>
                {t('main:set_nickname_prompt')}
              </TText>
              <Input
                placeholder={t('main:set_nickname_prompt')}
                value={nicknameInput}
                onChangeText={setNicknameInput}
                borderWidth={0.5}
                borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
                backgroundColor="transparent"
                color={theme.textDefault?.val}
                placeholderTextColor={theme.color10?.val}
                fontSize={16}
                autoFocus
              />
              <XStack gap={10} justifyContent="flex-end">
                <TButton
                  onPress={() => {
                    setNicknameSheetOpen(false);
                    setNicknameInput('');
                  }}
                  backgroundColor="$color2"
                >
                  <TText>Cancel</TText>
                </TButton>
                <TButton
                  onPress={handleNicknameSubmit}
                  backgroundColor="$accentColor"
                >
                  <TText>OK</TText>
                </TButton>
              </XStack>
            </YStack>
          </AppSheet>
        )
      }

      <Card
        backgroundColor={theme.surfaceSpecial?.val}
        borderRadius={12}
        borderWidth={0}
        width="100%"
        onPress={handleCardPress}
        padding={0}
        height={40}
      >
        <XStack flex={1} alignItems="center">
          <RoundedButton
            backgroundColor="$color10"
            icon={<MessageSquareShare size="$1" />}
            onPress={() => {navigation.navigate('Notifications', { deviceId });}}
            radiusL={12}
            radiusR={0}
          />
          <CardContent
            DeviceState={DeviceState}
            maskedEid={maskedEid}
            supplementText={supplementText}
          />
          <RoundedButton
            backgroundColor="$accentColor"
            icon={<Plus size="$1" />}
            onPress={() => {navigation.navigate('Scanner', { deviceId });}}
            radiusL={0}
            radiusR={12}
          />
        </XStack>
      </Card>
    </View>
  );
}
