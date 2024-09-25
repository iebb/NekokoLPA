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

  const [extCardResource, setExtCardResource] = useState<number[]>([0, 0, 0]);

  useEffect(() => {
    if (eUICC.euiccInfo2) {
      const ecr = eUICC.euiccInfo2.extCardResource.value;
      const data = [];
      for(let i = 0; i < ecr.length;) {
        i++;
        const dataLen = ecr[i++];
        let val = 0;
        for(let j = 0; j < dataLen; i++, j++) {
          val <<= 8;
          val += (ecr[i] & 0xff);
        }
        data.push(val);
      }
      setExtCardResource(data);
    }
  }, [eUICC.euiccInfo2]);

  if (!eUICC.euiccInfo2) return null;

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
              {t('main:available_space', { bytes: Intl.NumberFormat().format(extCardResource[1])})}
            </Text>
            <Text text100L color={colors.std50}>
              EID: {
                stealthMode === 'none' ? eUICC.eid : (eUICC.eid || '').replaceAll(
                  stealthMode === 'medium' ? /(?<=\d{16})\d(?=\d{6})/g : /./g, '*')
              }
            </Text>
          </View>
        </View>
        <View
          style={{ width: 40, flexBasis: 40 }}
          onLayout={e => console.log(e.nativeEvent.layout)}
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