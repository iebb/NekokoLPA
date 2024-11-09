import {SegmentedControl, Text, View} from "react-native-ui-lib";
import React, {useCallback, useState} from "react";
import InfiLPA from "@/native/InfiLPA";
import {useDispatch, useSelector} from "react-redux";
import {EuiccList, RootState, selectAppConfig} from "@/redux/reduxDataStore";
import {useTheme} from "@/theme";
import {EUICCPage} from "@/components/MainUI/EUICCPage";
import {useTranslation} from "react-i18next";
import {RefreshControl, ScrollView} from "react-native";
import {makeLoading} from "@/components/utils/loading";

export default function SIMSelector() {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { euiccList, currentEuicc} = useSelector((state: RootState) => state.LPA);
  const { nicknames } = useSelector(selectAppConfig);
  const { t } = useTranslation(['main']);
  const [refreshing, setRefreshing] = useState(false);
  const [euiccMenu, setEuiccMenu] = useState<EuiccList | null>(null);

  const onRefresh = useCallback(() => {
    makeLoading(setRefreshing, () => {
      InfiLPA.refreshEUICC();
    })
  }, []);
  const [index, setIndex] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(0);

  if (!euiccList?.length) {
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
            {t('main:no_device')}
          </Text>
          <Text color={colors.std200} center>
            {t('main:insert_supported_sim')}
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <View
      flexG-1
      flexS-0
    >
      {/*{*/}
      {/*  euiccMenu !== null && (*/}
      {/*    <ActionSheet*/}
      {/*      title={`EID: ${euiccMenu?.eid}`}*/}
      {/*      cancelButtonIndex={2}*/}
      {/*      destructiveButtonIndex={1}*/}
      {/*      options={[*/}
      {/*        {*/}
      {/*          label: t('main:set_nickname'),*/}
      {/*          onPress: () => {*/}
      {/*            prompt(*/}
      {/*              t('main:set_nickname'),*/}
      {/*              t('main:set_nickname_prompt'),*/}
      {/*              [*/}
      {/*                {text: 'Cancel', onPress: () => {}, style: 'cancel'},*/}
      {/*                {text: 'OK', onPress: nickname => {*/}
      {/*                  // @ts-ignore*/}
      {/*                    dispatch(setNickname({ [euiccMenu?.eid] : nickname}));*/}
      {/*                  }},*/}
      {/*              ],*/}
      {/*              {*/}
      {/*                cancelable: true,*/}
      {/*                defaultValue: nicknames[euiccMenu.eid!],*/}
      {/*                placeholder: 'placeholder'*/}
      {/*              }*/}
      {/*            );*/}
      {/*          }},*/}
      {/*        {*/}
      {/*          label: 'Cancel',*/}
      {/*          //iconSource: () => <FontAwesomeIcon icon={faDownload} />,*/}
      {/*          onPress: () => setEuiccMenu(null)*/}
      {/*        }*/}
      {/*      ]}*/}
      {/*      visible={euiccMenu != null}*/}
      {/*      useNativeIOS*/}
      {/*      onDismiss={() => setEuiccMenu(null)}*/}
      {/*    />*/}
      {/*  )*/}
      {/*}*/}
      <View
        key={euiccList.map(x => x.name).join("|")}
        flexS-0
        paddingB-10
      >
        <ScrollView
          horizontal={true}
          onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
        >
          <View style={{ minWidth: layoutWidth }}>
            <SegmentedControl
              activeColor={colors.purple300}
              outlineColor={colors.purple300}
              preset={SegmentedControl.presets.DEFAULT}
              initialIndex={index}
              onChangeIndex={setIndex}
              segments={
                euiccList.map((eUICC, _idx) => ({
                  label: (eUICC.eid && nicknames[eUICC.eid!]) ? (
                    (eUICC.name.length > 10 ? eUICC.name.substring(0, 10) : eUICC.name) + "\n" + nicknames[eUICC.eid!]
                  ) : (
                    eUICC.name
                  ),
                }))}
            />
          </View>
        </ScrollView>
      </View>
      {
        euiccList.map((eUICC, _idx) => {
          return (
            <View style={{ display: (_idx === index) ? "flex" : "none"}} flex key={_idx}>
              <EUICCPage eUICC={euiccList[_idx]} />
            </View>
          )
        })
      }
    </View>
  )
}