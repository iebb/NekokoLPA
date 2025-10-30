import Title from "@/components/common/Title";
import { View } from 'react-native';
import { Button as TButton, Text as TText, Input, XStack, YStack, useTheme, Checkbox } from 'tamagui';
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
  const theme = useTheme();
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
    <YStack gap={10} flex={1}>
      <Title>{t('main:profile_title_download_profile')}</Title>
      <KeyboardAvoidingView
        behavior='position'
        keyboardVerticalOffset={Platform.OS == 'ios' ? 80 : 0}
        style={{ gap: 10, flex: 1 }}
      >
        <YStack alignItems="center" gap={5} marginVertical={10}>
          <TText color="$textDefault" fontSize={14} fontWeight={"500" as any}>
            {t('main:profile_scan_qr_prompt')}
          </TText>
          <TText color="$textDefault" fontSize={14} fontWeight={"500" as any}>
            {t('main:profile_current_euicc', { device: adapter.device.deviceName })} ({t('main:available_space', {
            size: formatSize(euiccInfo2?.extCardResource?.freeNonVolatileMemory),
          })})
          </TText>
        </YStack>
        <View style={{ alignItems: 'center', borderRadius: 30 }}>
          <View
            style={{
            width: sizeW,
            height: size,
            borderRadius: 20,
            overflow: "hidden",
            borderColor: theme.color10?.val || '#999',
            borderWidth: showCamera ? 0 : 2,
            borderStyle: 'dashed',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
          >
              {
                !showCamera && (
                  <XStack gap={40} alignItems="center">
                    <TouchableOpacity
                      onPress={() => {
                        if (!showCamera)
                          setShowCamera(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faCamera} size={40} style={{ color: theme.color10?.val || '#999' }} />
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
                      <FontAwesomeIcon icon={faPhotoFilm} size={40} style={{ color: theme.color10?.val || '#999' }} />
                    </TouchableOpacity>
                  </XStack>
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
        <TButton
          marginTop={36}
          marginVertical={12}
          borderRadius={210}
          disabled={smdp.length === 0 && !(euiccAddress?.defaultDpAddress)}
          backgroundColor={theme.accentColor?.val || theme.color?.val || '#6c5ce7'}
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
          <XStack alignItems="center" gap={10}>
            <FontAwesomeIcon icon={faDownload} style={{ color: theme.background?.val || '#fff' }} />
            <TText color={theme.background?.val || '#fff'} fontSize={16}>
              {t('main:profile_ui_download')}
            </TText>
          </XStack>
        </TButton>
        <YStack padding={10} gap={0} paddingVertical={10}>
          <XStack gap={10} alignItems="flex-start">
            <View style={{ flex: 1 }}>
              <TText color="$color10" fontSize={12} marginBottom={4}>
                SM-DP+ Address
              </TText>
              <Input
                placeholder="SM-DP+ Address"
                value={smdp}
                onChangeText={c => c.includes('$') ? processLPACode(c) : setSmdp(c.trim())}
                borderWidth={0.5}
                borderBottomWidth={0.5}
                borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
                backgroundColor="transparent"
                color={theme.textDefault?.val}
                placeholderTextColor={theme.color10?.val}
                fontSize={16}
                padding={0}
                paddingBottom={8}
              />
            </View>
            <View style={{ paddingTop: 10 }}>
              <TButton
                size="$3"
                padding={10}
                backgroundColor={theme.accentColor?.val || theme.color?.val || '#6c5ce7'}
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
              >
                <FontAwesomeIcon icon={faSearch as any} style={{color: theme.background?.val || '#fff'}}/>
              </TButton>
            </View>
          </XStack>
          <TText color="$color10" fontSize={12} marginBottom={4} marginTop={8}>
            Matching ID
          </TText>
          <Input
            placeholder="Matching ID"
            value={acToken}
            onChangeText={c => c.includes('$') ? processLPACode(c) : setAcToken(c)}
            borderWidth={0.5}
            borderBottomWidth={0.5}
            borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
            backgroundColor="transparent"
            color={theme.textDefault?.val}
            placeholderTextColor={theme.color10?.val}
            fontSize={16}
            padding={0}
            paddingBottom={8}
          />
          <TText color="$color10" fontSize={12} marginBottom={4} marginTop={8}>
            IMEI
          </TText>
          <Input
            placeholder="IMEI"
            value={imei}
            onChangeText={c => setImei(c)}
            borderWidth={0.5}
            borderBottomWidth={0.5}
            borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
            backgroundColor="transparent"
            color={theme.textDefault?.val}
            placeholderTextColor={theme.color10?.val}
            fontSize={16}
            padding={0}
            paddingBottom={8}
          />
          <XStack alignItems="center" gap={10} marginTop={8}>
            <Checkbox
              checked={confirmationCodeReq}
              onCheckedChange={(checked) => setConfirmationCodeReq(!!checked)}
              size="$4"
            >
              <Checkbox.Indicator />
            </Checkbox>
            <TText color="$textDefault" fontSize={14} onPress={() => setConfirmationCodeReq(!confirmationCodeReq)}>
              {t('main:profile_download_confcode_required')}
            </TText>
          </XStack>
        </YStack>
      </KeyboardAvoidingView>
    </YStack>
  )
}
