import {SegmentedControl, Text, View} from "react-native-ui-lib";
import React, {useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/reduxDataStore";
import {selectAppConfig} from "@/redux/configStore";
import {useTheme} from "@/theme";
import {EUICCPage} from "@/components/MainUI/EUICCPage";
import {useTranslation} from "react-i18next";
import {ScrollView} from "react-native";
import {Adapters} from "@/native/adapters/registry";

export default function SIMSelector() {
  const { colors } = useTheme();
  const { internalList } = useSelector((state: RootState) => state.LPA);
  const { nicknames } = useSelector(selectAppConfig);
  const { t } = useTranslation(['main']);
  const [index, setIndex] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const selected = index < internalList.length ? internalList[index] : null;

  if (!internalList?.length) {
    return (
      <ScrollView
        bounces
        alwaysBounceVertical
        overScrollMode="always"
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
  })];

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
              backgroundColor={colors.std900}
              activeBackgroundColor={colors.std900}
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