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

    return profileList.map((profile: Profile) => ({
      ...profile,
      selected: profile.profileState === 1
    }));
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
  const calculateOrders = useCallback((newOrder: Array<Profile & { selected: boolean }>, oldOrder: Array<Profile & { selected: boolean }>) => {
    // Parse orders from existing profiles (old order)
    const oldProfilesWithOrders = oldOrder.map(profile => {
      const parsed = parseMetadataOnly(profile);
      return {
        profile,
        order: parsed.order,
        name: parsed.name
      };
    });

    // Create a map of old positions by iccid
    const oldPositionMap = new Map<string, number>();
    oldProfilesWithOrders.forEach((p, idx) => {
      if (p.profile.iccid) {
        oldPositionMap.set(p.profile.iccid, idx);
      }
    });

    // Parse new profiles
    const newProfilesWithOrders = newOrder.map(profile => {
      const parsed = parseMetadataOnly(profile);
      const oldProfile = oldProfilesWithOrders.find(op => op.profile.iccid === profile.iccid);
      return {
        profile,
        order: parsed.order,
        name: parsed.name,
        oldOrder: oldProfile?.order ?? -1
      };
    });

    // Check if any profile doesn't have order set (order = -1)
    const hasUnordered = newProfilesWithOrders.some(p => p.oldOrder === -1);

    if (hasUnordered) {
      // Assign orders evenly from 'ccc' (1406) to 'xxx' (16169)
      const minOrder = 2 * 26 * 26 + 2 * 26 + 2; // 'ccc' = 1406
      const maxOrder = 23 * 26 * 26 + 23 * 26 + 23; // 'xxx' = 16169
      const total = newOrder.length;
      const step = total > 1 ? Math.floor((maxOrder - minOrder) / (total - 1)) : 0;

      return newProfilesWithOrders.map((p, index) => ({
        ...p,
        order: minOrder + (index * step)
      }));
    } else {
      // All profiles have orders, calculate based on position
      type ProfileWithOrder = {
        profile: Profile & { selected: boolean };
        order: number;
        name: string;
        oldOrder: number;
      };

      const result: ProfileWithOrder[] = [];

      for (let index = 0; index < newProfilesWithOrders.length; index++) {
        const p = newProfilesWithOrders[index];
        if (index === 0) {
          // First position: assign 'aaa' (0)
          result.push({ ...p, order: 0 });
        } else if (index === newProfilesWithOrders.length - 1) {
          // Last position: assign 'zzz' (17575)
          result.push({ ...p, order: 17575 });
        } else {
          // Middle position: average of previous profile's calculated order and next profile's old order
          const prevOrder = result[index - 1]?.order ?? 0;
          const nextProfile = newProfilesWithOrders[index + 1];
          // Use next profile's old order if available, otherwise use previous order + estimated step
          let nextOrder: number;
          if (nextProfile.oldOrder !== -1) {
            nextOrder = nextProfile.oldOrder;
          } else {
            // Estimate: use previous order + average step
            const remainingProfiles = newProfilesWithOrders.length - index - 1;
            const remainingSpace = 17575 - prevOrder;
            nextOrder = remainingProfiles > 0 ? prevOrder + Math.floor(remainingSpace / (remainingProfiles + 1)) : 17575;
          }
          result.push({ ...p, order: Math.floor((prevOrder + nextOrder) / 2) });
        }
      }

      // Handle first position: update previous first profile
      const movedToFirst = newProfilesWithOrders[0];
      const oldFirstProfile = oldProfilesWithOrders[0];
      if (movedToFirst && oldFirstProfile && movedToFirst.profile.iccid !== oldFirstProfile.profile.iccid) {
        // Find the old first profile in the new order
        const oldFirstNewIndex = result.findIndex((r: ProfileWithOrder) => r.profile.iccid === oldFirstProfile.profile.iccid);
        if (oldFirstNewIndex >= 0) {
          const secondOrder = result[1]?.order ?? 0;
          result[oldFirstNewIndex].order = Math.floor((0 + secondOrder) / 2);
        }
      }

      // Handle last position: update previous last profile
      const movedToLast = newProfilesWithOrders[newProfilesWithOrders.length - 1];
      const oldLastProfile = oldProfilesWithOrders[oldProfilesWithOrders.length - 1];
      if (movedToLast && oldLastProfile && movedToLast.profile.iccid !== oldLastProfile.profile.iccid) {
        // Find the old last profile in the new order
        const oldLastNewIndex = result.findIndex((r: ProfileWithOrder) => r.profile.iccid === oldLastProfile.profile.iccid);
        if (oldLastNewIndex >= 0) {
          const previousLastOrder = result[result.length - 2]?.order ?? 17575;
          result[oldLastNewIndex].order = Math.floor((previousLastOrder + 17575) / 2);
        }
      }

      // Check if any adjacent profiles have order difference < 1, and reassign if needed
      let needsReassignment = false;
      for (let i = 0; i < result.length - 1; i++) {
        const currentOrder = result[i].order;
        const nextOrder = result[i + 1].order;
        if (Math.abs(nextOrder - currentOrder) < 1) {
          needsReassignment = true;
          break;
        }
      }

      if (needsReassignment) {
        // Reassign orders evenly from 'ccc' (1406) to 'xxx' (16169) based on current positions
        const minOrder = 2 * 26 * 26 + 2 * 26 + 2; // 'ccc' = 1406
        const maxOrder = 23 * 26 * 26 + 23 * 26 + 23; // 'xxx' = 16169
        const total = result.length;
        const step = total > 1 ? Math.floor((maxOrder - minOrder) / (total - 1)) : 0;

        return result.map((p, index) => ({
          ...p,
          order: minOrder + (index * step)
        }));
      }

      return result;
    }
  }, []);

  // Handle drag end - update the order and save nicknames
  const handleDragEnd = useCallback(async ({ data }: { data: Array<Profile & { selected: boolean }> }) => {
    const oldOrder = [...orderedProfiles];
    setOrderedProfiles(data);

    // Find which profile was moved by comparing positions
    const oldPositionMap = new Map<string, number>();
    oldOrder.forEach((profile, index) => {
      if (profile.iccid) {
        oldPositionMap.set(profile.iccid, index);
      }
    });

    const movedProfileIccid = data.find((profile, newIndex) => {
      const oldIndex = profile.iccid ? oldPositionMap.get(profile.iccid) : -1;
      return oldIndex !== undefined && oldIndex !== newIndex;
    })?.iccid;

    // If no profile moved, skip updates
    if (!movedProfileIccid) {
      return;
    }

    const movedProfileNewIndex = data.findIndex(p => p.iccid === movedProfileIccid);
    const movedProfileOldIndex = oldOrder.findIndex(p => p.iccid === movedProfileIccid);

    // Calculate new orders based on old and new order
    const profilesWithOrders = calculateOrders(data, oldOrder);

    // Check if reassignment occurred (all profiles need updates if adjacent orders < 1)
    let needsReassignment = false;
    for (let i = 0; i < profilesWithOrders.length - 1; i++) {
      const currentOrder = profilesWithOrders[i].order;
      const nextOrder = profilesWithOrders[i + 1].order;
      if (Math.abs(nextOrder - currentOrder) < 1) {
        needsReassignment = true;
        break;
      }
    }

    // Find the moved profile and profiles that need updates
    const movedProfile = profilesWithOrders.find(p => p.profile.iccid === movedProfileIccid);
    const profilesToUpdate: typeof profilesWithOrders = [];

    if (needsReassignment) {
      // If reassignment occurred, update all profiles
      profilesToUpdate.push(...profilesWithOrders);
    } else if (movedProfile) {
      // Only update moved profile and displaced profiles
      // Always update the moved profile
      profilesToUpdate.push(movedProfile);

      // If moved to first position, also update the previous first profile
      if (movedProfileNewIndex === 0 && movedProfileOldIndex !== 0) {
        const previousFirst = profilesWithOrders.find(p =>
          p.profile.iccid === oldOrder[0]?.iccid && p.profile.iccid !== movedProfileIccid
        );
        if (previousFirst) {
          profilesToUpdate.push(previousFirst);
        }
      }

      // If moved to last position, also update the previous last profile
      if (movedProfileNewIndex === data.length - 1 && movedProfileOldIndex !== data.length - 1) {
        const previousLast = profilesWithOrders.find(p =>
          p.profile.iccid === oldOrder[oldOrder.length - 1]?.iccid && p.profile.iccid !== movedProfileIccid
        );
        if (previousLast) {
          profilesToUpdate.push(previousLast);
        }
      }
    }

    // Update nicknames sequentially (one by one) with loading indicator
    try {
      setLoading(true);

      for (const { profile, order, name } of profilesToUpdate) {
        // Get the current nickname without order suffix
        const currentName = name;
        // Add the order suffix
        const suffix = orderToBase26Suffix(order);
        const newNickname = `${currentName}^${suffix}`;

        // Save the new nickname (one at a time)
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
