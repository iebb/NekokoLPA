import {useTheme, View as TView} from 'tamagui';
import {radius} from '@/shared/theme/tokens';
import {useSelector} from 'react-redux';
import {Profile} from '@/lpa/types/profile';
import {RefreshControl} from 'react-native-gesture-handler';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Adapters} from '@/lpa/adapters/registry';
import {selectDeviceState} from '@/store';
import {ProfileRow} from '@/features/main/ProfileRow';
import {FlatList} from 'react-native-gesture-handler';
import {useLoading} from '@/app/providers/LoadingProvider';

export default function ProfileSelector({deviceId}: {deviceId: string}) {
  const DeviceState = useSelector(selectDeviceState(deviceId));
  const [refreshing, setRefreshing] = useState(false);
  const {setLoading} = useLoading();
  const theme = useTheme();
  const adapter = Adapters[deviceId];

  const profiles = useMemo(() => {
    const profileList = DeviceState.profiles;
    if (!profileList?.map) return [];

    return profileList.map((profile: Profile) => ({
      ...profile,
      selected: profile.profileState === 1,
    }));
  }, [DeviceState.profiles]);

  // Automatically remove legacy sorting suffixes (e.g., " ^abc")
  useEffect(() => {
    const toCleanup = profiles.filter(p =>
      /\s?\^[a-z]{3}$/i.test(
        p.profileNickname || p.profileName || (p as any).serviceProviderName || '',
      ),
    );

    if (toCleanup.length > 0) {
      (async () => {
        setLoading(true);
        try {
          for (const p of toCleanup) {
            const current =
              p.profileNickname || p.profileName || (p as any).serviceProviderName || '';
            const cleaned = current.replace(/\s?\^[a-z]{3}$/i, '').trim();
            if (p.iccid) await adapter.setNicknameByIccId(p.iccid, cleaned);
          }
          await adapter.refresh();
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [profiles, adapter, setLoading]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await adapter.refresh();
    } finally {
      setRefreshing(false);
    }
  }, [adapter]);

  // Rows sit flush inside one hairline-separated group, so the separator is
  // the 1px of container showing between them rather than a margin. The last
  // row must not add one, or the group gains a stray rule above its bottom
  // corner.
  const renderItem = useCallback(
    ({item, index}: {item: Profile & {selected: boolean}; index: number}) => (
      <TView style={{marginBottom: index === profiles.length - 1 ? 0 : 1}}>
        <ProfileRow deviceId={deviceId} profile={item} />
      </TView>
    ),
    [deviceId, profiles.length],
  );

  return (
    <FlatList
      style={{
        backgroundColor: theme.borderColor?.val,
        borderWidth: 1,
        borderColor: theme.borderColor?.val,
        borderRadius: radius.lg,
        overflow: 'hidden',
      }}
      data={profiles}
      keyExtractor={item => item.iccid || String(item)}
      renderItem={renderItem}
      bounces
      alwaysBounceVertical
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={10}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    />
  );
}
