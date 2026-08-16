import React, {useEffect} from 'react';
import {Alert, Image, PixelRatio, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Screen from '@/shared/ui/Screen';
import type {RootScreenProps} from '@/app/navigation/types';
import {Swipeable} from 'react-native-gesture-handler';
import {Text, useTheme, XStack, YStack} from 'tamagui';
import {useSelector} from 'react-redux';
import {selectDeviceState} from '@/store';
import {Adapters} from '@/lpa/adapters/registry';
import {Notification} from '@/lpa/types/euicc';
import {parseMetadataOnly} from '@/shared/utils/parser';
import {Flags} from '@/assets/flags';
import {Send, Trash2} from '@tamagui/lucide-icons';
import {useToast} from '@/app/providers/ToastProvider';
import {useLoading} from '@/app/providers/LoadingProvider';
import {makeLoading} from '@/shared/utils/loading';
import {Button as TButton} from 'tamagui';

/** GSMA profile-management operation bit flags, as reported by the card. */
const OPERATION_LABELS: Record<number, string> = {
  0x10: 'delete',
  0x20: 'disable',
  0x40: 'enable',
  0x80: 'install',
};

function Notifications({route}: RootScreenProps<'Notifications'>) {
  const {deviceId} = route.params;
  const DeviceState = useSelector(selectDeviceState(deviceId!));
  const {showToast} = useToast();
  const {t} = useTranslation(['main']);
  const {profiles = [], notifications} = DeviceState;
  const {setLoading} = useLoading();
  const theme = useTheme();

  const adapter = Adapters[deviceId];

  useEffect(() => {
    setLoading(true);
    adapter
      .getNotifications()
      .catch(error => console.error('[LPA] Failed to load notifications', error))
      .finally(() => setLoading(false));
  }, [adapter, setLoading]);

  const renderRow = (row: Notification) => {
    const metadata = profiles.find(p => p.iccid === row.iccid);

    const {name, country} = metadata
      ? parseMetadataOnly(metadata)
      : {name: 'unknown', country: 'WW'};

    const type = OPERATION_LABELS[row.profileManagementOperation] ?? 'download';

    const rowBg = theme.surfaceRow?.val || theme.background?.val;
    const borderCol = theme.borderColor?.val;
    const badgeBg =
      type === 'delete'
        ? theme.backgroundDangerHeavy?.val
        : type === 'disable'
        ? theme.color6?.val
        : type === 'enable'
        ? theme.primaryColor?.val
        : theme.color?.val;
    const renderRight = () => (
      <TouchableOpacity
        onPress={async () => {
          const result = await adapter.sendNotification(row.seqNumber);
          if (result.result !== 0) {
            Alert.alert(
              t('main:notifications_send_failed'),
              t('main:notifications_send_failed_alert'),
            );
            showToast(t('main:notifications_send_failed'), 'error');
          } else {
            showToast(t('main:notifications_send_success'), 'success');
          }
        }}
        activeOpacity={0.8}
        style={{
          width: 60,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.backgroundSuccessHeavy?.val || theme.primaryColor?.val,
          borderTopRightRadius: 12,
          borderBottomRightRadius: 12,
        }}>
        <Send size={18} color={theme.background?.val} />
      </TouchableOpacity>
    );

    const renderLeft = () => (
      <TouchableOpacity
        onPress={() =>
          Alert.alert(t('main:notifications_delete'), t('main:notifications_delete_alert'), [
            {text: t('main:notifications_delete_cancel'), onPress: () => {}, style: 'cancel'},
            {
              text: t('main:notifications_delete_ok'),
              style: 'destructive',
              onPress: async () => {
                const result = await adapter.sendNotification(row.seqNumber);
                if (result.result === 0) {
                  await adapter.deleteNotification(row.seqNumber);
                } else {
                  Alert.alert(
                    t('main:notifications_send_failed'),
                    t('main:notifications_send_failed_alert'),
                  );
                }
              },
            },
          ])
        }
        activeOpacity={0.8}
        style={{
          width: 60,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.backgroundDangerHeavy?.val,
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
        }}>
        <Trash2 size={18} color={theme.background?.val} />
      </TouchableOpacity>
    );

    return (
      <View key={row.seqNumber}>
        <Swipeable
          renderLeftActions={renderLeft}
          renderRightActions={renderRight}
          overshootFriction={8}
          friction={2}>
          <TouchableOpacity>
            {/* Card surface inside to keep rounded corners */}
            <View
              style={{
                borderRadius: 12,
                backgroundColor: rowBg,
                borderWidth: 1,
                borderColor: borderCol,
                flexDirection: 'row',
                paddingHorizontal: 16,
                paddingVertical: 12,
                position: 'relative',
              }}>
              {/* Flag top-left */}

              {/* Main content */}
              <YStack style={{flexGrow: 1}}>
                <XStack gap={5}>
                  <Image
                    style={{
                      width: 20 * PixelRatio.getFontScale(),
                      height: 20 * PixelRatio.getFontScale(),
                    }}
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
                    <Text color="$color6" fontSize={12}>
                      {row.notificationAddress}
                    </Text>
                    <Text color="$color6" fontSize={12}>
                      ICCID: {row.iccid}
                    </Text>
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
  };
  const handleProcessAllNotifications = () => {
    makeLoading(setLoading, async () => {
      showToast(t('main:notifications_processing_all'), 'success');
      await adapter.processNotifications('');
      showToast(t('main:notifications_processing_all_success'), 'success');
    });
  };

  const sorted = Array.isArray(notifications)
    ? [...notifications].sort((a, b) => b.seqNumber - a.seqNumber)
    : [];
  return (
    <Screen
      title={t('main:notifications_notifications')}
      subtitle={t('main:notifications_subtitle')}
      fixedHeader={
        <XStack justifyContent="flex-end" paddingHorizontal={20} paddingBottom={16} flexShrink={0}>
          <TButton
            onPress={handleProcessAllNotifications}
            backgroundColor="$btnBackground"
            borderRadius={8}
            paddingHorizontal={16}
            paddingVertical={10}>
            <Text color={theme.background?.val} fontSize={14} fontWeight="600">
              {t('main:notifications_handle_all')}
            </Text>
          </TButton>
        </XStack>
      }>
      <YStack gap={4}>{sorted.map(item => renderRow(item))}</YStack>
    </Screen>
  );
}

export default Notifications;
