import Screen from "@/components/common/Screen";
import {Dimensions, TouchableOpacity, View} from 'react-native';
import {
  Button as TButton,
  Card,
  Checkbox,
  Input,
  Text as TText,
  useTheme,
  View as TView,
  XStack,
  YStack
} from 'tamagui';
import {Camera, useCameraDevice, useCameraPermission, useCodeScanner} from "react-native-vision-camera";
import { decodeBase64 } from 'vision-camera-zxing';
import {Camera as CameraIcon, Download, Image as ImageIcon, QrCode, Search} from '@tamagui/lucide-icons';
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {makeLoading} from "@/components/utils/loading";
import {LPACode} from "@/utils/lpaRegex";
import {launchImageLibrary} from "react-native-image-picker";
// Use Vision Camera's code scanner for decoding images
// Using ZXing integration for live and image decoding
import {Adapters} from "@/native/adapters/registry";
import {useSelector} from "react-redux";
import {selectDeviceState} from "@/redux/stateStore";
import {formatSize} from "@/utils/size";
import {useLoading} from "@/components/common/LoadingProvider";
import {useToast} from "@/components/common/ToastProvider";

export function ScannerInitial({ appLink, deviceId, finishAuthenticate }: any) {
  const theme = useTheme();
  const DeviceState = useSelector(selectDeviceState(deviceId));

  const { showToast } = useToast();
  const { setLoading } = useLoading();

  const [showCamera, setShowCamera] = useState(false);

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

  // No license required for ZXing

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      for (const code of codes) {
        if (code.value) {
          processLPACode(code.value);
          break;
        }
      }
    }
  });


  const cameraDevice = useCameraDevice('back');

  const size = Math.min(250, Dimensions.get('window').width - 50);
  const sizeW = Math.min(size * 4/3, Dimensions.get('window').width - 50);

  return (
    <Screen title={t('main:profile_title_download_profile')}>
        <YStack gap={20}>
          {/* Device Info Card */}
          <Card backgroundColor="$surfaceSpecial" borderRadius={16} padding={16} borderWidth={0}>
            <YStack gap={8}>
              <TText color="$textDefault" fontSize={16} fontWeight={"600" as any}>
                {t('main:profile_current_euicc', { device: adapter.device.deviceName })}
              </TText>
              <TText color="$color6" fontSize={14}>
                {t('main:available_space', {
                  size: formatSize(euiccInfo2?.extCardResource?.freeNonVolatileMemory),
                })}
              </TText>
            </YStack>
          </Card>

          {/* QR Scanner */}
          <TView
            borderRadius={16}
            padding={showCamera ? 0 : 24}
            backgroundColor="$surfaceSpecial"
            overflow="hidden"
            style={{
              borderColor: showCamera ? (theme.outlineNeutral?.val || theme.borderColor?.val || '#ddd'): null,
              borderWidth: showCamera ? 4 : 2,
              borderStyle: 'dashed',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {
              !showCamera && (
                <YStack gap={24} alignItems="center">
                  <QrCode size={48} color={theme.color6?.val || '#999'} />
                  <XStack gap={32} alignItems="center">
                    <TouchableOpacity
                      onPress={() => {
                        if (!showCamera)
                          setShowCamera(true);
                      }}
                      style={{ alignItems: 'center', gap: 8 }}
                    >
                      <View style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        backgroundColor: theme.primaryColor?.val || '#a575f6',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <CameraIcon size={32} color="#ffffff" />
                      </View>
                      <TText color="$color6" fontSize={12} marginTop={4}>
                        Camera
                      </TText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        launchImageLibrary({
                          mediaType: "photo",
                          includeBase64: true,
                        }, (result) => {
                          if (result.assets) {
                            for(const a of result.assets) {
                              (async () => {
                                try {
                                  if (a.base64) {
                                    const results: any[] = await decodeBase64(a.base64, { multiple: true });
                                    if (results && results.length > 0) {
                                      const r: any = results[0];
                                      const text = r?.value ?? r?.text ?? r?.displayValue;
                                      if (text) processLPACode(String(text));
                                      else console.log('No QR code text found.');
                                    } else {
                                      console.log('No barcode found.');
                                    }
                                  }
                                } catch (e) {
                                  console.log('Failed to decode image with ZXing:', e);
                                }
                              })();
                              break;
                            }
                          }
                        });
                      }}
                      style={{ alignItems: 'center', gap: 8 }}
                    >
                      <View style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        backgroundColor: theme.primaryColor?.val || '#a575f6',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <ImageIcon size={32} color="#ffffff" />
                      </View>
                      <TText color="$color6" fontSize={12} marginTop={4}>
                        Gallery
                      </TText>
                    </TouchableOpacity>
                  </XStack>
                </YStack>
              )
            }
            {
              cameraDevice && hasPermission && showCamera && (
                <Camera
                  device={cameraDevice}
                  isActive
                  codeScanner={codeScanner}
                  style={{  width: "100%", minHeight: size }}
                />
              )
            }
          </TView>
        {/* Input Form Card */}
        <Card backgroundColor="$surfaceSpecial" borderRadius={16} padding={20} borderWidth={0}>
          <YStack gap={20}>
            {/* SM-DP+ Address */}
            <YStack gap={8}>
              <TText color="$color6" fontSize={13} fontWeight={"500" as any} textTransform="uppercase" letterSpacing={0.5}>
                SM-DP+ Address
              </TText>
              <XStack gap={10} alignItems="flex-end">
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder="Enter SM-DP+ address or scan QR code"
                    value={smdp}
                    onChangeText={c => c.includes('$') ? processLPACode(c) : setSmdp(c.trim())}
                    borderWidth={1}
                    borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#ddd'}
                    backgroundColor="$background"
                    color={theme.textDefault?.val}
                    placeholderTextColor={theme.color6?.val}
                    fontSize={15}
                    padding={12}
                    borderRadius={12}
                  />
                </View>
                <TButton
                  size="$4"
                  width={48}
                  height={48}
                  padding={0}
                  backgroundColor="$btnBackground"
                  borderRadius={12}
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
                  <Search size={20} color="$btnForeground" />
                </TButton>
              </XStack>
            </YStack>

            {/* Matching ID */}
            <YStack gap={8}>
              <TText color="$color6" fontSize={13} fontWeight={"500" as any} textTransform="uppercase" letterSpacing={0.5}>
                Matching ID
              </TText>
              <Input
                placeholder="Enter matching ID (optional)"
                value={acToken}
                onChangeText={c => c.includes('$') ? processLPACode(c) : setAcToken(c)}
                borderWidth={1}
                borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#ddd'}
                backgroundColor="$background"
                color={theme.textDefault?.val}
                placeholderTextColor={theme.color6?.val}
                fontSize={15}
                padding={12}
                borderRadius={12}
              />
            </YStack>

            {/* IMEI */}
            <YStack gap={8}>
              <TText color="$color6" fontSize={13} fontWeight={"500" as any} textTransform="uppercase" letterSpacing={0.5}>
                IMEI
              </TText>
              <Input
                placeholder="Enter IMEI (optional)"
                value={imei}
                onChangeText={c => setImei(c)}
                borderWidth={1}
                borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#ddd'}
                backgroundColor="$background"
                color={theme.textDefault?.val}
                placeholderTextColor={theme.color6?.val}
                fontSize={15}
                padding={12}
                borderRadius={12}
              />
            </YStack>

            {/* Confirmation Code Checkbox */}
            <XStack alignItems="center" gap={12} paddingTop={4}>
              <Checkbox
                checked={confirmationCodeReq}
                onCheckedChange={(checked) => setConfirmationCodeReq(!!checked)}
                size="$4"
                borderColor={theme.outlineNeutral?.val}
                backgroundColor="$background"
              >
                <Checkbox.Indicator backgroundColor="$btnBackground" />
              </Checkbox>
              <TText color="$textDefault" fontSize={14} onPress={() => setConfirmationCodeReq(!confirmationCodeReq)} flex={1}>
                {t('main:profile_download_confcode_required')}
              </TText>
            </XStack>
          </YStack>
        </Card>

        {/* Download Button */}
        <TButton
          marginTop={8}
          marginBottom={12}
          height={56}
          borderRadius={16}
          disabled={smdp.length === 0 && !(euiccAddress?.defaultDpAddress)}
          backgroundColor="$btnBackground"
          opacity={smdp.length === 0 && !(euiccAddress?.defaultDpAddress) ? 0.5 : 1}
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
          <XStack alignItems="center" gap={12}>
            <Download size={20} color="$btnForeground" />
            <TText color="$btnForeground" fontSize={17} fontWeight={"600" as any}>
              {t('main:profile_ui_download')}
            </TText>
          </XStack>
        </TButton>
        </YStack>
    </Screen>
  )
}
