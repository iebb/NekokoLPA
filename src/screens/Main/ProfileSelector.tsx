import {View} from "react-native-ui-lib";
import {useSelector} from "react-redux";
import {Profile} from "@/native/types";
import {RefreshControl, ScrollView} from "react-native";
import React, {useState} from "react";
import BlockingLoader from "@/components/common/BlockingLoader";
import {Adapters} from "@/native/adapters/registry";
import {selectDeviceState} from "@/redux/stateStore";
import {ProfileRow} from "@/screens/Main/ProfileRow";

export default function ProfileSelector({ deviceId } : { deviceId: string }) {

  const DeviceState = useSelector(selectDeviceState(deviceId));
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const profileList = DeviceState.profiles;

  const profiles = ((profileList as any)?.map ? profileList : []).map(
    (profile: Profile) => ({...profile, selected: profile.profileState === 1})
  ) || []
  
  const adapter = Adapters[deviceId];

  return (
    <View
      style={{
        overflow: "hidden",
      }}
      flex-1
      flexG-1
      paddingB-10
    >
      {
        (loading || refreshing) && (
          <BlockingLoader />
        )
      }
      <ScrollView
        bounces
        alwaysBounceVertical
        overScrollMode="always"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            adapter.initialize();
            setRefreshing(false);
          }} />
        }
      >
        <View gap-10>
          {
            profiles.map((p, i) => <ProfileRow
              deviceId={deviceId} profile={p} key={i} isLoading={loading} setLoading={setLoading}
            />)
          }
        </View>
      </ScrollView>
    </View>
  )
}