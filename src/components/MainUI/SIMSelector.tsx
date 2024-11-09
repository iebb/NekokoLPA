import {SegmentedControl, Text, View} from "react-native-ui-lib";
import React, {useCallback, useState} from "react";
import InfiLPA from "@/native/InfiLPA";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/redux/reduxDataStore";
import {selectAppConfig} from "@/redux/configStore";
import {useTheme} from "@/theme";
import {EUICCPage} from "@/components/MainUI/EUICCPage";
import {useTranslation} from "react-i18next";
import {RefreshControl, ScrollView} from "react-native";
import {makeLoading} from "@/components/utils/loading";
import {EuiccList, selectDeviceState, selectDeviceStates} from "@/redux/stateStore";
import {Adapters} from "@/native/adapters/registry";

export default function SIMSelector() {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { internalList } = useSelector((state: RootState) => state.LPA);
  const deviceStates = useSelector(selectDeviceStates);
  const { nicknames } = useSelector(selectAppConfig);
  const { t } = useTranslation(['main']);
  const [refreshing, setRefreshing] = useState(false);
  const [euiccMenu, setEuiccMenu] = useState<EuiccList | null>(null);

  const onRefresh = useCallback(() => {
    // makeLoading(setRefreshing, () => {
    //   InfiLPA.refreshEUICC();
    // })
  }, []);
  const [index, setIndex] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const selected = index < internalList.length ? internalList[index] : null;

  if (!internalList?.length) {
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

  const segments = [...internalList.map((name, _idx) => {
    const adapter = Adapters[name];
    return {
      label: (Adapters.eid && nicknames[adapter.eid]) ? (
        adapter.device.deviceName + "\n" + nicknames[adapter.eid]
      ) : (
        adapter.device.deviceName
      ),
    };
  }), {
    label: '+',
  }];

  console.log(segments);

  /*
  {
        euiccMenu !== null && (
          <ActionSheet
            title={`EID: ${euiccMenu?.eid}`}
            cancelButtonIndex={2}
            destructiveButtonIndex={1}
            options={[
              {
                label: t('main:set_nickname'),
                onPress: () => {
                  prompt(
                    t('main:set_nickname'),
                    t('main:set_nickname_prompt'),
                    [
                      {text: 'Cancel', onPress: () => {}, style: 'cancel'},
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
   */


  return (
    <View
      flexG-1
      flexS-0
    >
      <View
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
              backgroundColor={colors.std800}
              activeBackgroundColor={colors.std800}
              inactiveColor={colors.std200}
              preset={SegmentedControl.presets.DEFAULT}
              initialIndex={index}
              onChangeIndex={setIndex}
              segments={segments}
            />
          </View>
        </ScrollView>
      </View>
      {
        selected && (
          <View flex key={selected}>
            <EUICCPage deviceId={selected} />
          </View>
        )
      }
    </View>
  )
}