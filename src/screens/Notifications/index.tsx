import React, {useEffect} from 'react';
import {Alert, Image, PixelRatio, TouchableOpacity, View,} from 'react-native';
import {useTranslation} from 'react-i18next';
import Screen from '@/components/common/Screen';
import type {RootScreenProps} from "@/screens/navigation";
import {Swipeable} from 'react-native-gesture-handler';
import {Text, useTheme, XStack, YStack} from 'tamagui';
import {useSelector} from "react-redux";
import {selectDeviceState} from "@/redux/stateStore";
import {Adapters} from "@/native/adapters/registry";
import {Notification} from "@/native/types/LPA";
import {parseMetadataOnly} from "@/utils/parser";
import {Flags} from "@/assets/flags";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faBan, faCircleCheck, faDownload, faPaperPlane, faTrash} from "@fortawesome/free-solid-svg-icons";
import {useToast} from "@/components/common/ToastProvider";
import {useLoading} from "@/components/common/LoadingProvider";
import {makeLoading} from "@/components/utils/loading";
import {Button as TButton} from 'tamagui';

function Notifications({ route,  navigation }: RootScreenProps<'Notifications'>) {
  const { deviceId } = route.params;
  const DeviceState = useSelector(selectDeviceState(deviceId!));
  const { showToast } = useToast();
  const { t } = useTranslation(['main']);
  const { profiles, notifications } = DeviceState;
  const { setLoading } = useLoading();
  const theme = useTheme();

  const adapter = Adapters[deviceId];

  useEffect(() => {
    setLoading(true);
    adapter.getNotifications().then(() => setLoading(false));
  }, []);

  const renderRow = (row: Notification) => {

    const metadata = profiles.find(p => p.iccid === row.iccid);

    const { name, country } = metadata ? parseMetadataOnly(metadata) : {name: "unknown", country: "WW"};

    var iconType = faDownload;
    var type = 'download';

    switch (row.profileManagementOperation) {
      case 0x10:
        iconType = faTrash;
        type = 'delete';
        break;
      case 0x20:
        iconType = faBan;
        type = 'disable';
        break;
      case 0x40:
        iconType = faCircleCheck;
        type = 'enable';
        break;
      case 0x80:
        iconType = faDownload;
        type = 'install';
        break;
    }

    const rowBg = theme.surfaceRow?.val || theme.background?.val || '#fff';
    const borderCol = theme.borderColor?.val || 'rgba(0,0,0,0.06)';
    const iconMuted = theme.color10?.val || '#8a8a8a';
    // badge colors by type
    const badgeBg = type === 'delete' ? (theme.backgroundDangerHeavy?.val || '#dc2626')
                    : type === 'disable' ? (theme.color10?.val || '#888')
                    : type === 'enable' ? (theme.accentColor?.val || '#a575f6')
                    : (theme.color?.val || '#555');
    const renderRight = () => (
      <TouchableOpacity
        onPress={async () => {
          const result = await adapter.sendNotification(row.seqNumber);
          if (result.result !== 0) {
            Alert.alert(t('main:notifications_send_failed'), t('main:notifications_send_failed_alert'));
            showToast(t('main:notifications_send_failed'), 'error');
          } else {
            showToast(t('main:notifications_send_success'), 'success');
          }
        }}
        activeOpacity={0.8}
        style={{ width: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: (theme.backgroundSuccessHeavy?.val || theme.accentColor?.val || '#22c55e'), borderTopRightRadius: 12, borderBottomRightRadius: 12 }}
      >
        <FontAwesomeIcon icon={faPaperPlane} style={{ color: theme.background?.val || '#fff' }} />
      </TouchableOpacity>
    );

    const renderLeft = () => (
      <TouchableOpacity
        onPress={() => Alert.alert(
          t('main:notifications_delete'),
          t('main:notifications_delete_alert'), [
            { text: t('main:notifications_delete_cancel'), onPress: () => {}, style: 'cancel' },
            { text: t('main:notifications_delete_ok'), style: 'destructive', onPress: async () => {
              const result = await adapter.sendNotification(row.seqNumber);
              if (result.result === 0) {
                await adapter.deleteNotification(row.seqNumber);
              } else {
                Alert.alert(t('main:notifications_send_failed'), t('main:notifications_send_failed_alert'));
              }
            }}
          ])}
        activeOpacity={0.8}
        style={{ width: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: (theme.backgroundDangerHeavy?.val || '#dc2626'), borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}
      >
        <FontAwesomeIcon icon={faTrash} style={{ color: theme.background?.val || '#fff' }} />
      </TouchableOpacity>
    );

    return (
      <View key={row.seqNumber}>
        <Swipeable renderLeftActions={renderLeft} renderRightActions={renderRight} overshootFriction={8} friction={2}>
          <TouchableOpacity>
            {/* Card surface inside to keep rounded corners */}
            <View style={{ borderRadius: 12, backgroundColor: rowBg, borderWidth: 1, borderColor: borderCol, flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, position: 'relative' }}>
              {/* Flag top-left */}


              {/* Main content */}
              <YStack style={{ flexGrow: 1 }}>
                <XStack gap={5}>
                  <Image
                    style={{width: 20 * PixelRatio.getFontScale(), height: 20 * PixelRatio.getFontScale()}}
                    source={Flags[country] || Flags.UN}
                  />
                  <Text color="$textDefault" numberOfLines={1} fontSize={14} flex={1}>
                    {metadata ? ` ${name}` : ` ${row.iccid}`}
                  </Text>
                  <Text color={badgeBg} fontSize={12}>
                    {type.toUpperCase()}
                  </Text>
                </XStack>

                <XStack gap={5}>
                  <YStack flex={1}>
                    <Text color="$color10" fontSize={12}>{row.notificationAddress}</Text>
                    <Text color="$color10" fontSize={12}>ICCID: {row.iccid}</Text>
                  </YStack>
                  <Text color="$textDefault" fontSize={12}>
                    #{row.seqNumber}
                  </Text>
                </XStack>
              </YStack>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </View>
    );
  }
  const handleProcessAllNotifications = () => {
    makeLoading(
      setLoading,
      async () => {
        showToast(t('main:notifications_processing_all'), 'success');
        await adapter.processNotifications('');
        showToast(t('main:notifications_processing_all_success'), 'success');
      }
    );
  };

  const sorted = Array.isArray(notifications) ?  [...notifications].sort((a, b) => b.seqNumber - a.seqNumber) : [];
  return (
    <Screen
      title={t('main:notifications_notifications')}
      subtitle={t('main:notifications_subtitle')}
      fixedHeader={
        <XStack justifyContent="flex-end" paddingHorizontal={20} paddingBottom={16} flexShrink={0}>
          <TButton
            onPress={handleProcessAllNotifications}
            backgroundColor="$accentColor"
            borderRadius={8}
            paddingHorizontal={16}
            paddingVertical={10}
          >
            <Text color={theme.background?.val || '#fff'} fontSize={14} fontWeight="600">
              {t('main:notifications_handle_all')}
            </Text>
          </TButton>
        </XStack>
      }
    >
      <YStack gap={4}>
        {sorted.map(item => renderRow(item))}
      </YStack>
    </Screen>
  );

}

export default Notifications;
