import Title from "@/components/common/Title";
import Container from "@/components/common/Container";
import {BorderRadiuses, Checkbox, ListItem, Text, TextField, View} from "react-native-ui-lib";
import {useCameraPermission} from "react-native-vision-camera";
import InfiLPA from "@/native/InfiLPA";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faDownload, faSimCard} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useTheme} from "@/theme";
import {makeLoading} from "@/components/utils/loading";
import BlockingLoader from "@/components/common/BlockingLoader";
import {StyleSheet} from "react-native";
import {useSelector} from "react-redux";
import {EuiccList, RootState} from "@/redux/reduxDataStore";
import {LPACode} from "@/components/utils/lpaRegex";


export function ScannerEuicc({ appLink, eUICC, setEUICC, finishAuthenticate }: any) {
  const device = eUICC?.name;
  const { t } = useTranslation(['main', 'profile']);
  const { colors, gutters} = useTheme();
  const [loading, setLoading] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();

  const [smdp, setSmdp] = useState("");
  const [acToken, setAcToken] = useState("");
  const [oid, setOid] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [confirmationCodeReq, setConfirmationCodeReq] = useState(false);

  const { euiccList, currentEuicc} = useSelector((state: RootState) => state.LPA);



  useEffect(() => {
    if (appLink) {
      const match = appLink.match(LPACode);
      const [
        _1, LPA, SMDP, AC_TOKEN, OID, CCREQ, CONFIRMATION_CODE
      ] = match;
      console.log("cc", CONFIRMATION_CODE);
      setSmdp(SMDP);
      setAcToken(AC_TOKEN);
      setOid(OID);
      setConfirmationCodeReq(CCREQ === "1");
      setConfirmationCode(CONFIRMATION_CODE);
    }
  }, [appLink]);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission().then();
    }
  }, [hasPermission]);

  const renderRow = (row: EuiccList) => {
    const statusColor = row.available ? colors.green300 : colors.red300;

    return (
      <View
        key={row.name}
        style={{
          borderColor: colors.std200,
          borderWidth: 0.25,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <ListItem
          paddingV-10
          paddingH-5
          activeBackgroundColor={colors.std600}
          activeOpacity={0.3}
          height={64}
          onPress={() => {
            makeLoading(
              setLoading,
              () => {
                setEUICC(row);
                const authenticateResult = InfiLPA.authenticateWithCode(
                  row.name,
                  `LPA:1$${smdp}$${acToken}${(oid || confirmationCodeReq) ? "$" + oid : ""}${confirmationCodeReq ? "$1" : ""}`
                );
                finishAuthenticate({
                  authenticateResult,
                  confirmationCode
                });
              }
            )
          }}
        >
          <ListItem.Part left marginV-10 containerStyle={[{paddingLeft: 5}]}>
            <FontAwesomeIcon
              icon={
                row.name.startsWith("SIM") ? faSimCard : faDownload
              }
              style={{
                color: colors.std400,
                marginRight: 12,
                marginTop: -2,
              }}
              size={12}
            />
          </ListItem.Part>
          <ListItem.Part middle column containerStyle={[{paddingRight: 5}]}>
            <ListItem.Part containerStyle={{marginBottom: 5}}>
              <Text text70 style={{flex: 1, marginRight: 10}} numberOfLines={1} color={colors.std200}>
                {row.name}
              </Text>
              <Text text70 style={{marginTop: 2}} color={colors.std200}>
                {row.profiles.length} Profiles
              </Text>
            </ListItem.Part>
            <ListItem.Part containerStyle={{marginBottom: 5}}>
              <Text
                style={{flex: 1, marginRight: 10}}
                text90L
                color={colors.std200}
              >
                {
                  t('main:available_space', {
                    bytes: row.bytesFree !== null ? Intl.NumberFormat().format(row.bytesFree || 0) : "??"
                  })
                }
              </Text>
            </ListItem.Part>
            <ListItem.Part>
              <Text text90L color={statusColor} numberOfLines={1}>
                EID: {row.eid}
              </Text>
            </ListItem.Part>
          </ListItem.Part>
        </ListItem>
      </View>
    );
  }


  return (
    <View>
      <Title>{t('profile:title_download_profile')}</Title>
      {
        loading && (
          <BlockingLoader message={t('profile:loading_validating_profile')} />
        )
      }
      <Container>
        <View
          flex
          style={{ gap: 10 }}
        >
          <View style={{ padding: 10, display: "flex", gap: 0, paddingVertical: 10 }}>
            <TextField
              placeholder={'SM-DP'}
              floatingPlaceholder
              value={smdp}
              enableErrors
              readonly
              validate={['required']}
              validationMessage={['Field is required']}
              color={colors.std200}
              style={{ borderBottomWidth: 1, borderColor: colors.std400 }}
            />
            <TextField
              placeholder={'Matching ID'}
              floatingPlaceholder
              value={acToken}
              readonly
              enableErrors
              color={colors.std200}
              style={{ borderBottomWidth: 1, borderColor: colors.std400 }}
            />
            {
              // oid && (
              //   <TextField
              //     placeholder={'OID'}
              //     floatingPlaceholder
              //     value={oid}
              //     readonly
              //     enableErrors
              //     color={colors.std200}
              //     style={{ borderBottomWidth: 1, borderColor: colors.std400 }}
              //   />
              // )
            }
            {
              confirmationCodeReq && (
                <Checkbox
                  label={t('profile:download_confcode_required')}
                  value={confirmationCodeReq}
                  labelStyle={{
                    marginLeft: 10,
                    color: colors.std200,
                  }}
                  disabled
                />
              )
            }
          </View>
          <View center gap-20 marginV-10>
            <Text text60M color={colors.std200}>
              {t('profile:choose_reader', { device })}
            </Text>
          </View>
          <View marginH-10 flex gap-10>
            {
              euiccList?.map(renderRow)
            }
          </View>
        </View>
      </Container>
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    width: 54,
    height: 54,
    borderRadius: BorderRadiuses.br20,
    marginHorizontal: 14
  },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  }
});