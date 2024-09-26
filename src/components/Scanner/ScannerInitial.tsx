import Title from "@/components/common/Title";
import Container from "@/components/common/Container";
import {Button, Checkbox, Colors, Text, TextField, View} from "react-native-ui-lib";
import {Camera, useCameraDevice, useCameraPermission, useCodeScanner} from "react-native-vision-camera";
import InfiLPA from "@/native/InfiLPA";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useTheme} from "@/theme";
import {makeLoading} from "@/components/utils/loading";
import BlockingLoader from "@/components/common/BlockingLoader";
import {LPACode} from "@/components/utils/lpaRegex";

export function ScannerInitial({ appLink, eUICC, finishAuthenticate }: any) {
  const device = eUICC.name;
  const { t } = useTranslation(['profile']);
  const { colors, gutters} = useTheme();

  const [smdp, setSmdp] = useState("");
  const [acToken, setAcToken] = useState("");
  const [oid, setOid] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [confirmationCodeReq, setConfirmationCodeReq] = useState(false);

  const [loading, setLoading] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();



  useEffect(() => {
    if (appLink) {
      processLPACode(appLink);
    }
  }, [appLink]);


  const processLPACode = (str: string) => {
    const match = str.match(LPACode);
    if (match) {
      const [
        _1, _2, LPA, SMDP, AC_TOKEN, OID, CCREQ, CONFIRMATION_CODE
      ] = match;
      setSmdp(SMDP);
      setAcToken(AC_TOKEN);
      setOid(OID);
      setConfirmationCodeReq(CCREQ === "1");
      setConfirmationCode(CONFIRMATION_CODE);
    }
  }

  useEffect(() => {
    if (!hasPermission) {
      requestPermission().then();
    }
  }, [hasPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      for(const code of codes) {
        const match = code.value!.match(LPACode);

        if (match) {
          const [_1, _2, LPA, SMDP, AC_TOKEN, OID, CONFIRMATION_CODE] = match;
          setSmdp(SMDP);
          setAcToken(AC_TOKEN);
          setOid(OID);
          setConfirmationCodeReq(CONFIRMATION_CODE === "1");
          setConfirmationCode("");
        }
      }
    }
  })
  const cameraDevice = useCameraDevice('back');

  const [size, setSize] = useState<number>(0);

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
          onLayout={(e) => {
            setSize(
              Math.min(e.nativeEvent.layout.width - 100, 200)
            );
          }}
        >
          <View center gap-10 marginV-10>
            <Text text70M color={colors.std200}>
              {t('profile:scan_qr_prompt')}
            </Text>
            <Text text70M color={colors.std200}>
              {t('profile:current_euicc', { device })}
            </Text>
          </View>
          <View center style={{ borderRadius: 30 }}>
            <View
              style={{ width: size, height: size, borderRadius: 20, overflow: "hidden" }}
            >
              {
                cameraDevice && hasPermission ? (
                  <Camera
                    device={cameraDevice}
                    isActive
                    codeScanner={codeScanner}
                    style={{ width: size, height: size}}
                  />
                ) : (
                  <Text color={colors.std200}>
                    {t('profile:camera_unsupported')}
                  </Text>
                )
              }
            </View>
          </View>
          <Button
            style={[gutters.marginVertical_12]}
            borderRadius={210}
            backgroundColor={colors.blue500}
            onPress={() => {
              makeLoading(
                setLoading,
                () => {
                  const authenticateResult = InfiLPA.authenticateWithCode(
                    device,
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
            <FontAwesomeIcon icon={faDownload} style={{ color: Colors.$backgroundDefault }} />
            <Text
              style={{ color: colors.blue50, marginLeft: 10 }}
            >{t('profile:ui_download')}</Text>
          </Button>
          <View style={{ padding: 10, display: "flex", gap: 0, paddingVertical: 10 }}>
            <TextField
              placeholder={'SM-DP'}
              floatingPlaceholder
              value={smdp}
              onChangeText={c => c.includes('$') ? processLPACode(c) : setSmdp(c)}
              enableErrors
              validate={['required']}
              validationMessage={['Field is required']}
              color={colors.std200}
              style={{ borderBottomWidth: 1, marginBottom: -10, borderColor: colors.std400 }}
            />
            <TextField
              placeholder={'Matching ID'}
              floatingPlaceholder
              value={acToken}
              onChangeText={c => c.includes('$') ? processLPACode(c) : setAcToken(c)}
              enableErrors
              color={colors.std200}
              style={{ borderBottomWidth: 1, marginBottom: -10, borderColor: colors.std400 }}
            />
            <TextField
              placeholder={'OID'}
              floatingPlaceholder
              value={oid}
              onChangeText={c => c.includes('$') ? processLPACode(c) : setOid(c)}
              enableErrors
              color={colors.std200}
              style={{ borderBottomWidth: 1, marginBottom: -10, borderColor: colors.std400 }}
            />
            <Checkbox
              label={t('profile:download_confcode_required')}
              value={confirmationCodeReq}
              labelStyle={{
                marginLeft: 10,
                color: colors.std200,
              }}
              onValueChange={v => setConfirmationCodeReq(v)}
            />
          </View>
        </View>
      </Container>
    </View>
  )
}