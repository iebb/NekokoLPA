import {Text, View} from "react-native-ui-lib";
import React, {useCallback, useEffect, useState} from "react";
import InfiLPA from "@/native/InfiLPA";
import {useDispatch, useSelector} from "react-redux";
import {RootState, setGlobalState} from "@/redux/reduxDataStore";
import {useTheme} from "@/theme";
import TabController from "@/components/ui/tabController";
import {EUICCPage} from "@/components/MainUI/EUICCPage";
import {useTranslation} from "react-i18next";
import {RefreshControl, ScrollView} from "react-native";
import {faDownload, faSimCard} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";

export default function SIMSelector() {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const [width, setWidth] = useState<number>(0);
  const { euiccList: _euiccList, currentEuicc} = useSelector((state: RootState) => state.LPA);
  const { t } = useTranslation(['main']);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    InfiLPA.refreshEUICC();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const euiccList = Array.from(new Set(_euiccList)).filter(e => e.length);
  console.log("index", euiccList.indexOf(currentEuicc));


  if (!euiccList?.length) {
    return (
      <View>
        <ScrollView
          bounces
          alwaysBounceVertical
          overScrollMode="always"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View flex paddingT-20 gap-20 height={500}>
            <Text color={colors.std200} center text60L>
              {t('main:no_device')}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      onLayout={(e) => {
        setWidth(e.nativeEvent.layout.width);
      }}
      style={{
        flexGrow: 1,
        flexShrink: 0,
      }}
    >
      {
        width > 0 && (euiccList?.length >= 1 && (
          <TabController
            key={JSON.stringify(euiccList)}
            items={
              euiccList.map((name, _idx) => ({
                label: name,
                icon: (
                  <FontAwesomeIcon
                    icon={
                      name.startsWith("SIM") ? faSimCard : faDownload
                    }
                    style={{
                      color: colors.std400,
                      marginRight: 4,
                      marginTop: -2,
                    }}
                    size={12}
                  />
                ),
                labelStyle: {
                  padding: 0,
                  fontSize: name.length > 4 ? 12 : 14,
                  lineHeight: name.length > 4 ? 12 : 14,
                },
                selectedLabelStyle: {
                  padding: 0,
                  fontSize: name.length > 4 ? 12 : 14,
                  lineHeight: name.length > 4 ? 12 : 14,
                  fontWeight: '500',
                },
                iconColor: colors.std400,
                labelColor: colors.std400,
                selectedLabelColor: colors.purple300,
                selectedIconColor: colors.purple300,
                width: width / euiccList.length,
                onPress: () => {
                  if (euiccList.includes(name)) {
                    InfiLPA.selectEUICC(name);
                  }
                }
              }))
            }
            initialIndex={euiccList.indexOf(currentEuicc)}
          >
            <TabController.TabBar
              containerWidth={width}
              backgroundColor={colors.cardBackground}
              labelColor={colors.purple300}
              containerStyle={{
                overflow: "hidden",
                borderRadius: 20,
                marginBottom: 10,
              }}
            />
            <View flexG>
              {
                euiccList.map((name, _idx) => (
                  <TabController.TabPage index={_idx} lazy key={name}>
                    <EUICCPage eUICC={name} />
                  </TabController.TabPage>
                ))
              }
            </View>
          </TabController>
        ))
      }
    </View>
  )
}