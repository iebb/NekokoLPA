import {View as TView} from 'tamagui';
import {useSelector} from "react-redux";
import {Profile} from "@/native/types";
import {RefreshControl} from 'react-native-gesture-handler'
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Adapters} from "@/native/adapters/registry";
import {selectDeviceState} from "@/redux/stateStore";
import {ProfileRow} from "@/screens/Main/ProfileRow";
import DraggableFlatList from 'react-native-draggable-flatlist';
import {FlatList} from 'react-native-gesture-handler';
import {orderToBase26Suffix, parseMetadataOnly} from "@/utils/parser";
import {useLoading} from "@/components/common/LoadingProvider";

export default function ProfileSelector({ deviceId, rearrangeMode = false } : { deviceId: string, rearrangeMode?: boolean }) {
  const DeviceState = useSelector(selectDeviceState(deviceId));
  const [refreshing, setRefreshing] = useState(false);
  const [scrollEnable, setScrollEnable] = useState(true);
  const [orderedProfiles, setOrderedProfiles] = useState<Array<Profile & { selected: boolean }>>([]);
  const { setLoading } = useLoading();
  const adapter = Adapters[deviceId];

  const profiles = useMemo(() => {
    const profileList = DeviceState.profiles;
    if (!profileList?.map) return [];

    // Map and sort by parsed order (unordered -1 goes to the end)
    const mapped = profileList.map((profile: Profile) => ({
      ...profile,
      selected: profile.profileState === 1
    }));

    // Sort by order; treat -1 as Infinity so unordered appear at the end
    return [...mapped].sort((a, b) => {
      const pa = parseMetadataOnly(a).order;
      const pb = parseMetadataOnly(b).order;
      const oa = pa === -1 ? Number.POSITIVE_INFINITY : pa;
      const ob = pb === -1 ? Number.POSITIVE_INFINITY : pb;
      return oa - ob;
    });
  }, [DeviceState.profiles]);

  // Update ordered profiles when profiles change - preserve custom order if it exists
  useEffect(() => {
    if (profiles.length > 0) {
      // If we have existing order, try to preserve it
      if (orderedProfiles.length > 0) {
        // Map existing order to current profiles (preserve order)
        const ordered = orderedProfiles
          .map(existing => profiles.find(p => p.iccid === existing.iccid))
          .filter(Boolean) as Array<Profile & { selected: boolean }>;

        // Find new profiles that weren't in the ordered list
        const existingIccids = new Set(ordered.map(p => p.iccid));
        const newProfiles = profiles.filter(p => !existingIccids.has(p.iccid));

        // If all profiles are accounted for, use ordered + new, otherwise reset
        if (ordered.length + newProfiles.length === profiles.length) {
          setOrderedProfiles([...ordered, ...newProfiles]);
          return;
        }
      }
      // If no order exists or profiles changed significantly, use profiles as-is
      setOrderedProfiles(profiles);
    } else {
      setOrderedProfiles([]);
    }
    // Only depend on profiles array reference, not DeviceState.profiles directly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles]);

  // Memoize refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await adapter.refresh();
    } finally {
      setRefreshing(false);
    }
  }, [adapter]);

  // Calculate and assign orders to profiles
  // Returns profiles with new orders assigned evenly from ccc to xxx based on position
  const calculateOrders = useCallback((newOrder: Array<Profile & { selected: boolean }>, oldOrder: Array<Profile & { selected: boolean }>) => {
    const minOrder = 2 * 26 * 26 + 2 * 26 + 2; // 'ccc' = 1406
    const maxOrder = 23 * 26 * 26 + 23 * 26 + 23; // 'xxx' = 16169
    const total = newOrder.length;
    const step = total > 1 ? Math.floor((maxOrder - minOrder) / (total - 1)) : 0;

    // Parse current names from profiles
    return newOrder.map((profile, index) => {
      const parsed = parseMetadataOnly(profile);
      return {
        profile,
        order: minOrder + (index * step),
        name: parsed.name
      };
    });
  }, []);

  // Handle drag end - update the order and save nicknames
  const handleDragEnd = useCallback(async ({ data }: { data: Array<Profile & { selected: boolean }> }) => {
    const oldOrder = [...orderedProfiles];
    setOrderedProfiles(data);

    const positionsChanged = data.some((profile, newIndex) => {
      const oldIndex = oldOrder.findIndex(p => p.iccid === profile.iccid);
      return oldIndex !== newIndex;
    });

    // If no positions changed, skip updates
    if (!positionsChanged) {
      return;
    }

    const parsedOld = oldOrder.map(p => ({ iccid: p.iccid, ...parseMetadataOnly(p) }));
    const oldOrderByIccid = new Map<string, number>();
    parsedOld.forEach(p => { if (p.iccid) oldOrderByIccid.set(p.iccid, p.order); });
    const oldOrders = parsedOld.map(p => p.order);
    const hasUnordered = oldOrders.some(order => order === -1);
    const nonNegative = oldOrders.filter(o => o !== -1);
    const hasDuplicates = new Set(nonNegative).size !== nonNegative.length;

    // If there are unordered profiles or duplicates, update all profiles (even spacing ccc->xxx)
    const profilesWithOrders = calculateOrders(data, oldOrder);
    const profilesToUpdate: typeof profilesWithOrders = [];

    if (hasUnordered || hasDuplicates) {
      // Update all profiles
      profilesToUpdate.push(...profilesWithOrders);
    } else {
      // Only update the moved profile using average of neighbors (bounds: aaa=0, zzz=17575)
      const moved = data.find((profile, newIndex) => {
        const oldIndex = oldOrder.findIndex(p => p.iccid === profile.iccid);
        return oldIndex !== newIndex;
      });

      if (moved && moved.iccid) {
        const idx = data.findIndex(p => p.iccid === moved.iccid);
        const prev = idx > 0 ? data[idx - 1] : undefined;
        const next = idx < data.length - 1 ? data[idx + 1] : undefined;

        const prevOrder = prev && prev.iccid ? (oldOrderByIccid.get(prev.iccid) ?? 0) : 0;
        const nextOrder = next && next.iccid ? (oldOrderByIccid.get(next.iccid) ?? 17575) : 17575;

        const gap = nextOrder - prevOrder;
        if (gap <= 1) {
          // Not enough space, reassign all evenly
          profilesToUpdate.push(...profilesWithOrders);
        } else {
          const newOrderValue = Math.floor((prevOrder + nextOrder) / 2);
          const parsed = parseMetadataOnly(moved);
          profilesToUpdate.push({ profile: moved, order: newOrderValue, name: parsed.name });
        }
      }
    }

    // If no profiles need updating, skip
    if (profilesToUpdate.length === 0) {
      return;
    }

    // Update nicknames sequentially (one by one) with loading indicator
    try {
      setLoading(true);

      for (const { profile, order, name } of profilesToUpdate) {
        const suffix = orderToBase26Suffix(order);
        const newNickname = `${name}^${suffix}`;

        if (profile.iccid) {
          await adapter.setNicknameByIccId(profile.iccid, newNickname);
        }
      }

      // Refresh to get updated profiles
      await adapter.refresh();
    } catch (error) {
      console.error('Error updating profile orders:', error);
    } finally {
      setLoading(false);
    }
  }, [adapter, calculateOrders, orderedProfiles, setLoading]);


  const renderDraggableItem = useCallback(({ item, drag, isActive }: { item: Profile & { selected: boolean }; drag: () => void; isActive: boolean }) => {
    return (
      <TView style={{ marginBottom: 10 }}>
        <ProfileRow
          deviceId={deviceId}
          profile={item}
          drag={drag}
          isActive={isActive}
          press={(x: boolean) => setScrollEnable(!x)}
          rearrangeMode={true}
        />
      </TView>
    );
  }, [deviceId]);

  const renderRegularItem = useCallback(({ item }: { item: Profile & { selected: boolean } }) => {
    return (
      <TView style={{ marginBottom: 10 }}>
        <ProfileRow
          deviceId={deviceId}
          profile={item}
          drag={() => {}}
          isActive={false}
          press={() => {}}
          rearrangeMode={false}
        />
      </TView>
    );
  }, [deviceId]);

  // Removed debug handlers to improve performance

  if (rearrangeMode) {
    // Use DraggableFlatList in rearrange mode
    return (
      <DraggableFlatList
        scrollEnabled
        data={orderedProfiles}
        keyExtractor={(item) => item.iccid || String(item)}
        renderItem={renderDraggableItem}
        activationDistance={10}
        animationConfig={{
          damping: 20,
          stiffness: 300,
          mass: 0.5,
        }}
        bounces
        alwaysBounceVertical
        keyboardShouldPersistTaps="handled"
        scrollToOverflowEnabled
        showsVerticalScrollIndicator
        simultaneousHandlers={[]}
        onDragEnd={handleDragEnd}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />
    );
  }

  // Use regular FlatList in normal mode
  return (
    <FlatList
      data={orderedProfiles}
      keyExtractor={(item) => item.iccid || String(item)}
      renderItem={renderRegularItem}
      bounces
      alwaysBounceVertical
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    />
  );
}
