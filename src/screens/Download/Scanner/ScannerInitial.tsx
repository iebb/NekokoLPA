import Screen from "@/components/common/Screen";
import {Dimensions, View} from 'react-native';
import {Button as TButton, Card, Input, Text as TText, useTheme, View as TView, XStack, YStack} from 'tamagui';
import {Camera, useCameraDevice, useCameraPermission, useCodeScanner} from "react-native-vision-camera";
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import {Clipboard as ClipboardIcon, Download, Image as ImageIcon, QrCode, Search} from '@tamagui/lucide-icons';
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {makeLoading} from "@/components/utils/loading";
import {LPACode} from "@/utils/lpaRegex";
import {launchImageLibrary} from "react-native-image-picker";
import {Adapters} from "@/native/adapters/registry";
import {useSelector} from "react-redux";
import {selectDeviceState} from "@/redux/stateStore";
import {formatSize} from "@/utils/size";
import {useLoading} from "@/components/common/LoadingProvider";
import {useToast} from "@/components/common/ToastProvider";
import {toCIName} from "@/utils/friendlyName";
import Clipboard from '@react-native-clipboard/clipboard';

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

  const handleDiscovery = async () => {
    await makeLoading(
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
    );
  };

  return (
    <Screen title={t('main:profile_title_download_profile')}>
        <YStack gap={20}>
          {/* Device Info Card */}
          <Card backgroundColor="$surfaceSpecial" borderRadius={16} padding={16} borderWidth={0}>
            <YStack gap={8}>
              <TText color="$textDefault" fontSize={16} fontWeight={"600" as any}>
                {t('main:profile_current_euicc', { device: adapter.device.deviceName })}
              </TText>
              <XStack gap={8}>
                <TText color="$color6" fontSize={14} flex={1}>
                  {t('main:available_space', {
                    size: formatSize(euiccInfo2?.extCardResource?.freeNonVolatileMemory),
                  })}
                </TText>
                <TText color="$color6" fontSize={14} maxWidth="50%">
                  CI: {DeviceState.euiccInfo2?.euiccCiPKIdListForSigning.map((x: any) => toCIName(x)).join(', ')}
                </TText>
              </XStack>
            </YStack>
          </Card>

          {/* QR Scanner */}
          <TView
            borderRadius={16}
            padding={showCamera ? 0 : 24}
            backgroundColor="$surfaceSpecial"
            overflow="hidden"
            style={{
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {
              !showCamera && (
                <YStack gap={24} alignItems="center">
                  <XStack gap={20} alignItems="center" flexWrap="wrap" justifyContent="center">
                    <YStack gap={6} alignItems="center" justifyContent="center">
                      <TButton
                        w={64} h={64} backgroundColor="$btnBackground" borderRadius={16}
                        icon={<QrCode size={32} color="#ffffff" />}
                        onPress={() => setShowCamera(true)}
                      />
                      <TText color="$color6" fontSize={12}>Camera</TText>
                    </YStack>
                    <YStack gap={6} alignItems="center" justifyContent="center">
                      <TButton
                        w={64} h={64} backgroundColor="$btnBackground" borderRadius={16}
                        icon={<ImageIcon size={32} color="#ffffff" />}
                        onPress={() => {
                          launchImageLibrary({
                            mediaType: "photo",
                          }, (result) => {
                            if (result.assets) {
                              for(const a of result.assets) {
                                (async () => {
                                  try {
                                    if (a.uri) {
                                      const results: any[] = await BarcodeScanning.scan(a.uri);
                                      if (results && results.length > 0) {
                                        const r: any = results[0];
                                        const text = r?.rawValue ?? r?.displayValue ?? r?.text ?? r?.value;
                                        if (text) processLPACode(String(text));
                                        else console.log('No QR code text found.');
                                      } else {
                                        console.log('No barcode found.');
                                      }
                                    }
                                  } catch (e) {
                                    console.log('Failed to decode image with ML Kit:', e);
                                  }
                                })();
                                break;
                              }
                            }
                          });
                        }}
                      />
                      <TText color="$color6" fontSize={12}>Gallery</TText>
                    </YStack>
                    <YStack gap={6} alignItems="center" justifyContent="center">
                      <TButton
                        w={64} h={64} backgroundColor="$btnBackground" borderRadius={16}
                        icon={<ClipboardIcon size={32} color="#ffffff" />}
                        onPress={async () => {
                          try {
                            const text = await Clipboard.getString();
                            if (text && text.trim().length > 0) {
                              if (text.includes('$')) {
                                processLPACode(text);
                                showToast('Pasted from clipboard.', 'success');
                              } else {
                                showToast('No valid LPA string found.', 'success');
                              }
                            } else {
                              showToast('Clipboard is empty.', 'error');
                            }
                          } catch (e) {
                            console.log(e);
                          }
                        }}
                      />
                      <TText color="$color6" fontSize={12}>Paste</TText>
                    </YStack>
                    <YStack gap={6} alignItems="center" justifyContent="center">
                      <TButton
                        w={64} h={64} backgroundColor="$btnBackground" borderRadius={16}
                        icon={<Search size={32} color="#ffffff" />}
                        onPress={handleDiscovery}
                      />
                      <TText color="$color6" fontSize={12}>Discover</TText>
                    </YStack>
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
              <View>
                <Input
                  placeholder="SM-DP+ address"
                  value={smdp}
                  onChangeText={c => c.includes('$') ? processLPACode(c) : setSmdp(c.trim())}
                  backgroundColor="$background"
                  color={theme.textDefault?.val}
                  placeholderTextColor={theme.color6?.val}
                  borderRadius={12}
                />
              </View>
            </YStack>

            {/* Matching ID */}
            <YStack gap={8}>
              <Input
                placeholder="Matching ID (optional)"
                value={acToken}
                onChangeText={c => c.includes('$') ? processLPACode(c) : setAcToken(c)}
                borderWidth={1}
                borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#ddd'}
                backgroundColor="$background"
                color={theme.textDefault?.val}
                placeholderTextColor={theme.color6?.val}
                borderRadius={12}
              />
            </YStack>

            {/* IMEI */}
            <YStack gap={8}>
              <Input
                placeholder="IMEI (optional)"
                value={imei}
                onChangeText={c => setImei(c)}
                borderWidth={1}
                borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#ddd'}
                backgroundColor="$background"
                color={theme.textDefault?.val}
                placeholderTextColor={theme.color6?.val}
                borderRadius={12}
              />
            </YStack>
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
