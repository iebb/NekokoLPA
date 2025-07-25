import Title from "@/components/common/Title";
import Container from "@/components/common/Container";
import {Button, Checkbox, Colors, Text, TextField, View} from "react-native-ui-lib";
import {Camera, useCameraDevice, useCameraPermission, useCodeScanner} from "react-native-vision-camera";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faCamera, faDownload, faPhotoFilm, faSearch} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {makeLoading} from "@/components/utils/loading";
import {LPACode} from "@/utils/lpaRegex";
import {launchImageLibrary} from "react-native-image-picker";
import QrImageReader from 'react-native-qr-image-reader';
import {Dimensions, KeyboardAvoidingView, Platform, TouchableOpacity} from "react-native";
import {Adapters} from "@/native/adapters/registry";
import {useSelector} from "react-redux";
import {selectDeviceState} from "@/redux/stateStore";
import {preferences} from "@/utils/mmkv";
import {formatSize} from "@/utils/size";
import {useLoading} from "@/components/common/LoadingProvider";
import {useToast} from "@/components/common/ToastProvider";

export function ScannerInitial({ appLink, deviceId, finishAuthenticate }: any) {
  const DeviceState = useSelector(selectDeviceState(deviceId));
  const cameraState = preferences.getString("useCamera");


  const { showToast } = useToast();
  const { setLoading } = useLoading();

  const [showCamera, setShowCamera] = useState(cameraState === 'always');

  const { t } = useTranslation(['main']);
  const [acToken, setAcToken] = useState("");
  const [oid, setOid] = useState("");
  const [imei, setImei] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [confirmationCodeReq, setConfirmationCodeReq] = useState(false);
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
        break;
      }
    }
  })


  const cameraDevice = useCameraDevice('back');

  const size = Math.min(250, Dimensions.get('window').width - 50);
  const sizeW = Math.min(size * 4/3, Dimensions.get('window').width - 50);

  return (
    <View>
      <Title>{t('main:profile_title_download_profile')}</Title>
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
              {t('main:profile_current_euicc', { device: adapter.device.deviceName })} ({t('main:available_space', {
              size: formatSize(euiccInfo2?.extCardResource?.freeNonVolatileMemory),
            })})
            </Text>
          </View>
          <View center style={{ borderRadius: 30 }}>
            <View
              style={{
              width: sizeW,
              height: size,
              borderRadius: 20,
              overflow: "hidden",
              borderColor: Colors.$textNeutralLight,
              borderWidth: showCamera ? 0 : 2,
              borderStyle: 'dashed',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            >
                {
                  !showCamera && (
                    <View row gap-40>
                      <TouchableOpacity
                        onPress={() => {
                          if (!showCamera)
                            setShowCamera(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faCamera} size={40} style={{ color: Colors.$textNeutralLight }} />
                      </TouchableOpacity>
                      <TouchableOpacity
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
                                break;
                              }
                            }
                          });
                        }}
                      >
                        <FontAwesomeIcon icon={faPhotoFilm} size={40} style={{ color: Colors.$textNeutralLight }} />
                      </TouchableOpacity>
                    </View>
                  )
                }
              {
                cameraDevice && hasPermission && showCamera && (
                  <Camera
                    device={cameraDevice}
                    isActive
                    codeScanner={codeScanner}
                    style={{ width: sizeW, height: size}}
                  />
                )
              }
            </View>
          </View>
          <Button
            marginT-36
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
                      smdp, acToken, (e: any) => setLoading(
                        t(`main:progress_${e.message}`, e) as string ?? t('main:profile_loading_validating_profile')
                      ), imei.length === 15 ? imei : "356303455555555"
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
            <View style={{ display: "flex", flexDirection: "row" }}>
              <View style={{ flex: 1 }}>
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
              </View>
              <View style={{ flex: 0, paddingTop: 10 }}>
                <Button
                  size={'small'}
                  padding-10
                  iconSource={
                    style => <FontAwesomeIcon icon={faSearch as any} style={{color: (style as any)[0].tintColor}}/>
                  }
                  onPress={() => {
                    makeLoading(
                      setLoading,
                      async () => {

                        const authenticateResult = await adapter.smdsDiscovery(
                          (e: any) => setLoading(
                            t(`main:progress_${e.message}`, e) as string ?? t('main:profile_loading_validating_profile')
                          )
                        );

                        setTimeout(() => {
                          if (authenticateResult.success) {
                            if (authenticateResult.smdp_list.length === 1) {
                              setSmdp(authenticateResult.smdp_list[0]);
                              showToast('SM-DP Discovered.', 'success');
                            } else if (authenticateResult.smdp_list.length === 0) {
                              showToast('Discovered nothing.', 'success');
                            } else {
                              setSmdp(authenticateResult.smdp_list[0]);
                              showToast('Multiple SM-DPs has been discovered.', 'success');
                            }
                          } else {
                            showToast('Failed to discover SM-DPs.', 'error');
                          }
                        }, 100);


                  }
                    )
                  }}
                  iconOnRight
                  animateLayout
                  animateTo={'left'}
                />
              </View>
            </View>
            <TextField
              placeholder={'Matching ID'}
              floatingPlaceholder
              value={acToken}
              onChangeText={c => c.includes('$') ? processLPACode(c) : setAcToken(c)}
              enableErrors

              style={{ borderBottomWidth: 0.5, borderColor: Colors.$outlineDisabledHeavy }}
            />
            <TextField
              placeholder={'IMEI'}
              floatingPlaceholder
              value={imei}
              onChangeText={c => setImei(c)}
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
