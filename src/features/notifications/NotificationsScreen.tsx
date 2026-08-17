import React, {useEffect} from 'react';
import {Alert, Image, TouchableOpacity, View} from 'react-native';
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
import {fontFamily, fontSize, radius} from '@/shared/theme/tokens';
import Pill from '@/shared/ui/Pill';
import {preferences} from '@/shared/storage';
import {group, isRedactMode, maskIccid} from '@/shared/utils/redact';

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

  const stored = preferences.getString('redactMode');
  const redactMode = isRedactMode(stored) ? stored : 'none';

  const renderRow = (row: Notification) => {
    const metadata = profiles.find(p => p.iccid === row.iccid);

    const {name, country} = metadata
      ? parseMetadataOnly(metadata)
      : {name: 'unknown', country: 'WW'};

    const type = OPERATION_LABELS[row.profileManagementOperation] ?? 'download';

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
        }}>
        <Trash2 size={18} color={theme.background?.val} />
      </TouchableOpacity>
    );

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
        }}>
        <Send size={18} color={theme.onFilled?.val} />
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
            {/* No well: the operation and the profile it applies to are the
                row's subject, so they lead. The sequence number is a
                diagnostic and sits last, tertiary. */}
            <View style={{paddingHorizontal: 4, paddingVertical: 14}}>
              <XStack alignItems="center" gap={12}>
                <Image
                  style={{width: 26, height: 18, borderRadius: 3}}
                  source={Flags[country] || Flags.UN}
                />
                <YStack flex={1} minWidth={0} gap={5}>
                  <XStack alignItems="center" gap={8}>
                    <Pill tone={type.toLowerCase() === 'delete' ? 'danger' : 'neutral'}>{type}</Pill>
                    <Text
                      color="$textDefault"
                      numberOfLines={1}
                      fontSize={fontSize.lg}
                      fontWeight={'600' as any}
                      flexShrink={1}>
                      {metadata ? name : group(maskIccid(row.iccid, redactMode))}
                    </Text>
                  </XStack>
                  <Text
                    color="$color9"
                    fontFamily={fontFamily.mono as any}
                    fontSize={fontSize.sm}
                    numberOfLines={1}>
                    {group(maskIccid(row.iccid, redactMode))}
                  </Text>
                </YStack>
                <Text color="$color9" fontFamily={fontFamily.mono as any} fontSize={fontSize.sm}>
                  #{row.seqNumber}
                </Text>
              </XStack>
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

  /**
   * Queued notifications grouped by the SM-DP+ they are addressed to.
   *
   * Grouping by host is what makes the queue actionable: every entry under one
   * heading goes to the same server, so a run of failures reads as "that
   * server is unreachable" rather than as unrelated errors. Insertion order is
   * preserved, so groups stay in descending seqNumber like the flat list did.
   */
  const groups: {host: string; items: typeof sorted}[] = [];
  for (const row of sorted) {
    const host = row.notificationAddress || t('main:notifications_unknown_host');
    const existing = groups.find(g => g.host === host);
    if (existing) {
      existing.items.push(row);
    } else {
      groups.push({host, items: [row]});
    }
  }
  return (
    <Screen
      title={t('main:notifications_notifications')}
      subtitle={t('main:notifications_subtitle')}>
      <YStack gap={16}>
        {groups.map(group => (
          <YStack key={group.host} gap={8}>
            <XStack alignItems="baseline" justifyContent="space-between" gap={10} paddingHorizontal={4}>
              <Text
                color="$color9"
                fontFamily={fontFamily.mono as any}
                fontSize={fontSize.xs}
                numberOfLines={1}
                flexShrink={1}>
                {group.host}
              </Text>
              <Text color="$color9" fontSize={fontSize.sm} flexShrink={0}>
                {t('main:notifications_pending', {count: group.items.length})}
              </Text>
            </XStack>
            <YStack>
              {group.items.map((item, index) => (
                <YStack
                  key={item.seqNumber}
                  borderBottomWidth={index === group.items.length - 1 ? 0 : 1}
                  borderBottomColor="$borderColor">
                  {renderRow(item)}
                </YStack>
              ))}
            </YStack>
          </YStack>
        ))}

        {sorted.length > 0 && (
          <TouchableOpacity
            onPress={handleProcessAllNotifications}
            style={{
              backgroundColor: theme.primaryColor?.val,
              borderRadius: radius.md,
              paddingVertical: 13,
              alignItems: 'center',
              marginTop: 4,
            }}>
            <Text color={theme.onFilled?.val} fontSize={fontSize.lg} fontWeight={'600' as any}>
              {t('main:notifications_send_all', {count: sorted.length})}
            </Text>
          </TouchableOpacity>
        )}
      </YStack>
    </Screen>
  );
}

export default Notifications;
