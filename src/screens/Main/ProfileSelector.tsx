import { YStack, View as TView } from 'tamagui';
import {useSelector} from "react-redux";
import {Profile} from "@/native/types";
import {RefreshControl, ScrollView} from "react-native";
import React, {useState, useMemo, useCallback} from "react";
import {Adapters} from "@/native/adapters/registry";
import {selectDeviceState} from "@/redux/stateStore";
import {ProfileRow} from "@/screens/Main/ProfileRow";

export default function ProfileSelector({ deviceId } : { deviceId: string }) {
  const DeviceState = useSelector(selectDeviceState(deviceId));
  const [refreshing, setRefreshing] = useState(false);
  const profiles = useMemo(() => {
    const profileList = DeviceState.profiles;
    if (!profileList?.map) return [];

    return profileList.map((profile: Profile) => ({
      ...profile,
      selected: profile.profileState === 1
    }));
  }, [DeviceState.profiles]);

  const adapter = Adapters[deviceId];

  // Memoize refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await adapter.refresh();
    } finally {
      setRefreshing(false);
    }
  }, [adapter]);


  return (
    <TView flex={1} minHeight={0} paddingBottom={10}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16, paddingTop: 4 }}
        bounces
        alwaysBounceVertical
        overScrollMode="always"
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        showsVerticalScrollIndicator
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        <YStack gap={10}>
          {profiles.map((p, i) => (
            <ProfileRow
              deviceId={deviceId}
              profile={p}
              key={p.iccid || i}
            />
          ))}
        </YStack>
      </ScrollView>
    </TView>
  );
}
