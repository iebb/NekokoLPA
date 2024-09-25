import ProfileMenu from "@/components/MainUI/ProfileMenu";
import ProfileSelector from "@/components/MainUI/ProfileList/ProfileSelector";
import ErrorToast from "@/components/ErrorToast";
import {Text, View} from "react-native-ui-lib";
import React, {useCallback, useState} from "react";
import {useSelector} from "react-redux";
import {EuiccList, RootState} from "@/redux/reduxDataStore";
import {useTheme} from "@/theme";
import {RefreshControl, ScrollView} from "react-native";
import InfiLPA from "@/native/InfiLPA";
import {useTranslation} from "react-i18next";
import {EuiccInfo2} from "@/native/types";

export function EUICCPage({ eUICC } : { eUICC: EuiccList }) {
  const { colors } = useTheme();
  const { t } = useTranslation(['main']);
  const {euiccList} = useSelector((state: RootState) => state.LPA);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    InfiLPA.refreshEUICC();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  console.log("re-render euicc", eUICC);


  if (!euiccList.map(x => x.name).includes(eUICC.name)) {
    return (
      <ScrollView
        bounces
        alwaysBounceVertical
        overScrollMode="always"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View flex paddingT-20 gap-20>
          <Text color={colors.std200} center text70L>
            {t('main:unsupported_device', {name: eUICC})}
          </Text>
          <Text color={colors.std200} center>
            {t('main:insert_supported_sim', {name: eUICC})}
          </Text>
        </View>
      </ScrollView>
    );
  }
  return (
    <View flex flexG style={{ gap: 10 }}>
      <ProfileMenu eUICC={eUICC} />
      <ProfileSelector eUICC={eUICC} />
    </View>
  )
}