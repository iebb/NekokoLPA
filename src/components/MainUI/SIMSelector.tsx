import {ActionSheet, LoaderScreen, Text, View} from "react-native-ui-lib";
import React, {useCallback, useMemo, useState} from "react";
import InfiLPA from "@/native/InfiLPA";
import {useDispatch, useSelector} from "react-redux";
import {EuiccList, RootState, selectAppConfig} from "@/redux/reduxDataStore";
import {useTheme} from "@/theme";
import TabController from "@/components/ui/tabController";
import {EUICCPage} from "@/components/MainUI/EUICCPage";
import {useTranslation} from "react-i18next";
import {Dimensions, RefreshControl, ScrollView} from "react-native";
import {faDownload, faSimCard} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import prompt from 'react-native-prompt-android';
import {setNickname} from "@/redux/reduxDataStore";
import {makeLoading} from "@/components/utils/loading";

export default function SIMSelector() {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { euiccList, currentEuicc} = useSelector((state: RootState) => state.LPA);
  const { nicknames } = useSelector(selectAppConfig);
  const { t } = useTranslation(['main']);
  const [refreshing, setRefreshing] = useState(false);
  const [euiccMenu, setEuiccMenu] = useState<EuiccList | null>(null);

  const initialIndex = useMemo(
    () => Math.max((euiccList || []).map(x => x.name).indexOf(currentEuicc), 0), [refreshing]
  );

  const onRefresh = useCallback(() => {
    makeLoading(setRefreshing, () => {
      InfiLPA.refreshEUICC();
    })
  }, []);

  if (!euiccList) {
    return (
      <LoaderScreen
        color={colors.blue500}
        size="large"
        loaderColor={colors.std200}
      />
    )
  }

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

  const width = Dimensions.get('window').width - 48

  return (
    <View
      flexG-1
      flexS-0
    >
      {
        euiccMenu !== null && (
          <ActionSheet
            title={`EID: ${euiccMenu?.eid}`}
            cancelButtonIndex={2}
            destructiveButtonIndex={1}
            options={[
              {
                label: t('main:set_nickname'),
                //iconSource: () => <FontAwesomeIcon icon={faDownload} />,
                onPress: () => {
                  prompt(
                    t('main:set_nickname'),
                    t('main:set_nickname_prompt'),
                    [
                      {text: 'Cancel', onPress: () => {

                        }, style: 'cancel'},
                      {text: 'OK', onPress: nickname => {
                        // @ts-ignore
                          dispatch(setNickname({ [euiccMenu?.eid] : nickname}));
                        }},
                    ],
                    {
                      cancelable: true,
                      defaultValue: nicknames[euiccMenu.eid!],
                      placeholder: 'placeholder'
                    }
                  );
                }},
              {
                label: 'Cancel',
                //iconSource: () => <FontAwesomeIcon icon={faDownload} />,
                onPress: () => setEuiccMenu(null)
              }
            ]}
            visible={euiccMenu != null}
            useNativeIOS
            onDismiss={() => setEuiccMenu(null)}
          />
        )
      }
      <View
        key={euiccList.map(x => x.name).join("|")}
        flexG-1
        flexS-0
      >
        {
          width > 0 && (
            <TabController
              items={
                euiccList.map((eUICC, _idx) => ({
                  label: (eUICC.eid && nicknames[eUICC.eid!]) ? (
                    (eUICC.name.length > 10 ? eUICC.name.substring(0, 10) : eUICC.name) + "\n" + nicknames[eUICC.eid!]
                  ) : (
                    eUICC.name
                  ),
                  onLongPress: () => {
                    setEuiccMenu(eUICC);
                  },
                  icon: (
                    <FontAwesomeIcon
                      icon={
                        eUICC.name.startsWith("SIM") ? faSimCard : faDownload
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
                    margin: 0,
                    fontSize: 12,
                    lineHeight: 16,
                  },
                  selectedLabelStyle: {
                    padding: 0,
                    margin: 0,
                    fontSize: 12,
                    lineHeight: 16,
                    fontWeight: '500',
                  },
                  iconColor: colors.std400,
                  labelColor: colors.std400,
                  selectedLabelColor: colors.purple300,
                  selectedIconColor: colors.purple300,
                  width: euiccList.length <= 3 ? width / euiccList.length : undefined,
                }))
              }
              initialIndex={initialIndex}
            >
              <TabController.TabBar
                backgroundColor={colors.cardBackground}
                labelColor={colors.purple300}
                containerWidth={width}
                containerStyle={{
                  width: '100%',
                  overflow: "hidden",
                  borderRadius: 20,
                  marginBottom: 10,
                  height: 40,
                }}
              />
              <View flexG>
                {
                  euiccList.map((euicc, _idx) => (
                    <TabController.TabPage index={_idx} key={euicc.name}>
                      <EUICCPage eUICC={euicc} />
                    </TabController.TabPage>
                  ))
                }
              </View>
            </TabController>
          )
        }
      </View>
    </View>
  )
}