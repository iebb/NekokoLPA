import Title from "@/components/common/Title";
import Container from "@/components/common/Container";
import {Button, Checkbox, Colors, Text, TextField, View} from "react-native-ui-lib";
import {Camera, useCameraDevice, useCameraPermission, useCodeScanner} from "react-native-vision-camera";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faDownload, faPhotoFilm} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useTheme} from "@/theme";
import {makeLoading} from "@/components/utils/loading";
import BlockingLoader from "@/components/common/BlockingLoader";
import {LPACode} from "@/components/utils/lpaRegex";
import {launchImageLibrary} from "react-native-image-picker";
import QrImageReader from 'react-native-qr-image-reader';
import {Dimensions} from "react-native";
import {Adapters} from "@/native/adapters/registry";

export function ScannerInitial({ appLink, eUICC, deviceId, finishAuthenticate }: any) {
  const device = eUICC.name;
  const { t } = useTranslation(['profile']);
  const { colors } = useTheme();

  const [smdp, setSmdp] = useState("");
  const [acToken, setAcToken] = useState("");
  const [oid, setOid] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [confirmationCodeReq, setConfirmationCodeReq] = useState(false);

  const [loading, setLoading] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();

  const adapter = Adapters[deviceId];


  useEffect(() => {
    if (appLink) {
      processLPACode(appLink);
    }
  }, [appLink]);


  const processLPACode = (str: string) => {
    const match = str.match(LPACode);
    if (match) {
      const [
        _1, LPA, SMDP, AC_TOKEN, OID, CCREQ, CONFIRMATION_CODE
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
        processLPACode(code.value!);
      }
    }
  })


  const cameraDevice = useCameraDevice('back');

  const size = Math.min(250, Dimensions.get('window').width - 50);

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
          <View center gap-5 marginV-10>
            <Text text70M color={colors.std200}>
              {t('profile:scan_qr_prompt')}
            </Text>
            <Text text70M color={colors.std200}>
              {t('profile:current_euicc', { device: adapter.device.deviceName })}
            </Text>
          </View>
          <View center style={{ borderRadius: 30 }}>
            {
              cameraDevice && hasPermission ? (
                <View
                  style={{ width: size, height: size, borderRadius: 20, overflow: "hidden" }}
                >
                  <Button
                    round
                    style={{ borderRadius: 20, position: "absolute", top: 0, right: 0, zIndex: 100 }}
                    onPress={() => {
                      launchImageLibrary({
                        mediaType: "photo",
                      }, (result) => {
                        if (result.assets) {
                          for(const a of result.assets) {
                            QrImageReader.decode({ path: a.uri })
                              .then(({result}) => {
                                processLPACode(result!);
                              })
                              .catch(error => console.log(error || 'No QR code found.'));
                          }

                        }
                      });
                    }}
                    backgroundColor={colors.blue500}
                  >
                    <FontAwesomeIcon icon={faPhotoFilm} style={{ color: Colors.$backgroundDefault }} />
                  </Button>
                  <Camera
                    device={cameraDevice}
                    isActive
                    codeScanner={codeScanner}
                    style={{ width: size, height: size}}
                  />
                </View>
              ) : (
                <Text color={colors.std200}>
                  {t('profile:camera_unsupported')}
                </Text>
              )
            }

          </View>
          <Button
            marginV-12
            borderRadius={210}
            backgroundColor={colors.blue500}
            onPress={() => {
              makeLoading(
                setLoading,
                async () => {
                  const authenticateResult = await adapter.authenticateProfile(
                    smdp, acToken
                  );
                  finishAuthenticate({
                    authenticateResult,
                    smdp,
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
              style={{ borderBottomWidth: 1, borderColor: colors.std400 }}
            />
            <TextField
              placeholder={'Matching ID'}
              floatingPlaceholder
              value={acToken}
              onChangeText={c => c.includes('$') ? processLPACode(c) : setAcToken(c)}
              enableErrors
              color={colors.std200}
              style={{ borderBottomWidth: 1, borderColor: colors.std400 }}
            />
            {/*<TextField*/}
            {/*  placeholder={'OID'}*/}
            {/*  floatingPlaceholder*/}
            {/*  value={oid}*/}
            {/*  onChangeText={c => c.includes('$') ? processLPACode(c) : setOid(c)}*/}
            {/*  enableErrors*/}
            {/*  color={colors.std200}*/}
            {/*  style={{ borderBottomWidth: 1, marginBottom: -10, borderColor: colors.std400 }}*/}
            {/*/>*/}
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