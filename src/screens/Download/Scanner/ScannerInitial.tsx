import Title from "@/components/common/Title";
import Container from "@/components/common/Container";
import {Button, Checkbox, Colors, Text, TextField, View} from "react-native-ui-lib";
import {Camera, useCameraDevice, useCameraPermission, useCodeScanner} from "react-native-vision-camera";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faCamera, faDownload, faPhotoFilm} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {makeLoading} from "@/components/utils/loading";
import BlockingLoader from "@/components/common/BlockingLoader";
import {LPACode} from "@/utils/lpaRegex";
import {launchImageLibrary} from "react-native-image-picker";
import QrImageReader from 'react-native-qr-image-reader';
import {Dimensions, KeyboardAvoidingView, Platform} from "react-native";
import {Adapters} from "@/native/adapters/registry";
import {useSelector} from "react-redux";
import {selectDeviceState} from "@/redux/stateStore";
import {preferences} from "@/utils/mmkv";
import {formatSize} from "@/utils/size";

export function ScannerInitial({ appLink, deviceId, finishAuthenticate }: any) {
  const DeviceState = useSelector(selectDeviceState(deviceId));
  const cameraState = preferences.getString("useCamera");


  const [showCamera, setShowCamera] = useState(cameraState === 'always' || !cameraState);
  const onDemandCamera = cameraState === 'ondemand' && !showCamera;

  const { t } = useTranslation(['main']);
  const [acToken, setAcToken] = useState("");
  const [oid, setOid] = useState("");
  const [progress, setProgress] = useState({} as any);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [confirmationCodeReq, setConfirmationCodeReq] = useState(false);
  const [loading, setLoading] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const { eid, euiccAddress, euiccInfo2 } = DeviceState;
  const adapter = Adapters[deviceId];
  const [smdp, setSmdp] = useState('');

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
      <Title>{t('main:profile_title_download_profile')}</Title>
      {
        loading && (
          <BlockingLoader
            message={
              ((progress?.progress > 0) ? (
                t('main:progress_' + progress.message, progress)
              ) : (
                t('main:profile_loading_validating_profile')
              )) as string
            }
          />
        )
      }
      <Container>
        <KeyboardAvoidingView
          behavior='position'
          keyboardVerticalOffset={Platform.OS == 'ios' ? 80 : 0}
          style={{ gap: 10, flex: 1 }}
        >
          <View center gap-5 marginV-10>
            <Text $textDefault text70M>
              {t('main:profile_scan_qr_prompt')}
            </Text>
            <Text $textDefault text70M>
              {t('main:profile_current_euicc', { device: adapter.device.deviceName })}
            </Text>
            <Text $textDefault text70M>
              {t('main:available_space', {
                size: formatSize(euiccInfo2?.extCardResource?.freeNonVolatileMemory),
              })}
            </Text>
          </View>
          <View center style={{ borderRadius: 30 }}>
            <View style={{ width: cameraDevice && hasPermission && showCamera ? size : 80, height: cameraDevice && hasPermission && showCamera ? size : 40, borderRadius: 20, overflow: "hidden" }}>
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
                $textPrimary
                bg-$backgroundPrimary
              >
                <FontAwesomeIcon icon={faPhotoFilm} style={{ color: Colors.white }} />
              </Button>
              {
                onDemandCamera && (
                  <Button
                    round
                    style={{ borderRadius: 20, position: "absolute", top: 0, left: 0, zIndex: 100 }}
                    onPress={() => {
                      setShowCamera(true);
                    }}
                    $textPrimary
                    bg-$backgroundPrimary
                  >
                    <FontAwesomeIcon icon={faCamera} style={{ color: Colors.white }} />
                  </Button>
                )
              }
              {
                cameraDevice && hasPermission && showCamera && (
                  <Camera
                    device={cameraDevice}
                    isActive
                    codeScanner={codeScanner}
                    style={{ width: size, height: size}}
                  />
                )
              }
            </View>
          </View>
          <Button
            marginV-12
            borderRadius={210}
            bg-$backgroundPrimary
            disabled={smdp.length === 0 && !(euiccAddress?.defaultDpAddress)}
            onPress={() => {
              makeLoading(
                setLoading,
                async () => {
                  if (smdp.length == 0 && euiccAddress?.defaultDpAddress) {
                    setSmdp(euiccAddress?.defaultDpAddress);
                  } else if (smdp.length > 0) {
                    const authenticateResult = await adapter.authenticateProfile(
                      smdp, acToken, (e) => setProgress(e), ""
                    );
                    finishAuthenticate({
                      authenticateResult,
                      smdp,
                      confirmationCode
                    });
                  }
                }
              )
            }}
          >
            <FontAwesomeIcon icon={faDownload} style={{ color: Colors.white }} />
            <Text style={{ marginLeft: 10, color: Colors.white }}
            >{t('main:profile_ui_download')}</Text>
          </Button>
          <View style={{ padding: 10, display: "flex", gap: 0, paddingVertical: 10 }}>
            <TextField
              placeholder={'SM-DP+ Address'}
              floatingPlaceholder
              value={smdp}
              onChangeText={c => c.includes('$') ? processLPACode(c) : setSmdp(c.trim())}
              enableErrors
              validate={['required']}
              validationMessage={['Field is required']}

              style={{ borderBottomWidth: 0.5, borderColor: Colors.$outlineDisabledHeavy }}
            />
            <TextField
              placeholder={'Matching ID'}
              floatingPlaceholder
              value={acToken}
              onChangeText={c => c.includes('$') ? processLPACode(c) : setAcToken(c)}
              enableErrors

              style={{ borderBottomWidth: 0.5, borderColor: Colors.$outlineDisabledHeavy }}
            />
            {/*<TextField*/}
            {/*  placeholder={'OID'}*/}
            {/*  floatingPlaceholder*/}
            {/*  value={oid}*/}
            {/*  onChangeText={c => c.includes('$') ? processLPACode(c) : setOid(c)}*/}
            {/*  enableErrors*/}
            {/* */}
            {/*  style={{ borderBottomWidth: 1, marginBottom: -10, borderColor: Colors.grey40 }}*/}
            {/*/>*/}
            <Checkbox
              label={t('main:profile_download_confcode_required')}
              value={confirmationCodeReq}
              labelStyle={{
                marginLeft: 10,
              }}
              onValueChange={v => setConfirmationCodeReq(v)}
            />
          </View>
        </KeyboardAvoidingView>
      </Container>
    </View>
  )
}