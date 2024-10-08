import {Button, Card, Text, View} from "react-native-ui-lib";
import {useEffect, useState} from "react";
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import {EuiccList, selectEuicc, setState} from "@/redux/reduxDataStore";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faPlus} from '@fortawesome/free-solid-svg-icons'
import {useTheme} from "@/theme";
import {useNavigation} from "@react-navigation/native";
import {useTranslation} from "react-i18next";
import Clipboard from '@react-native-clipboard/clipboard';
import {ToastAndroid} from "react-native";
import {nextValue, selectAppConfig} from "@/redux/reduxDataStore";


export default function ProfileMenu({ eUICC } : { eUICC: EuiccList }) {
  const { colors } = useTheme();
  const { t } = useTranslation(['main']);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { stealthMode } = useSelector(selectAppConfig);
  const [layout, setLayout] = useState({
    width: 0,
    height: 0
  });

  return (
    <View
      onLayout={e => setLayout(e.nativeEvent.layout)}
    >
      <Card
        style={{
          borderRadius: 10,
          borderColor: colors.std800,
          borderWidth: 1,
          overflow: "hidden",
          width: "100%",
        }}
        row
        backgroundColor={colors.cardBackground}
        enableShadow
        onPress={
          () => {
            ToastAndroid.show('EID Copied', ToastAndroid.SHORT);
            Clipboard.setString(eUICC.eid!)
          }
        }
        onLongPress={
          () => {
            dispatch(nextValue('stealthMode'))
          }
        }
      >
        <View style={{ flexGrow: 1 }}>
          <View paddingH-15 paddingV-3 style={{ overflow: 'hidden', width: layout.width - 50 }}>
            <Text text100L color={colors.std50}>
              {t('main:available_space', {
                bytes: eUICC.bytesFree !== null ? Intl.NumberFormat().format(eUICC.bytesFree || 0) : "??"
              })} / SGP.22 v{eUICC.version}
            </Text>
            <Text text100L color={colors.std50}>
              {
                stealthMode === 'none' ? `EID: ` + eUICC.eid : `EUM: ${eUICC.eid?.substring(0, 8)}`
              }
            </Text>
          </View>
        </View>
        <View
          style={{ width: 40, flexBasis: 40 }}
        >
          <Button
            borderRadius={0}
            fullWidth
            round
            style={{ flex: 1, width: 40 }}
            size="small"
            onPress={() => {
              dispatch(setState([{authenticateResult: null, downloadResult: null}, eUICC.name]));
              // @ts-ignore
              navigation.navigate('Scanner', {
                eUICC: eUICC,
              });
            }}
          >
            <FontAwesomeIcon icon={faPlus} style={{ color: colors.cardBackground, }} />
          </Button>
        </View>
      </Card>
    </View>
  )
}