import ProfileMenu from "@/components/MainUI/ProfileMenu";
import ProfileSelector from "@/components/MainUI/ProfileList/ProfileSelector";
import {LoaderScreen, View} from "react-native-ui-lib";
import React from "react";
import {useSelector} from "react-redux";
import {EuiccList, RootState} from "@/redux/reduxDataStore";
import {useTheme} from "@/theme";

export function EUICCPage({ eUICC } : { eUICC: EuiccList }) {
  const { colors } = useTheme();
  if (!eUICC) return null;
  const {euiccList} = useSelector((state: RootState) => state.LPA);

  if (!euiccList) {
    return (
      <LoaderScreen
        color={colors.blue500}
        size="large"
        loaderColor={colors.std200}
      />
    )
  }

  return (
    <View flex flexG style={{ gap: 10 }}>
      <ProfileMenu eUICC={eUICC} />
      <ProfileSelector eUICC={eUICC} />
    </View>
  )
}