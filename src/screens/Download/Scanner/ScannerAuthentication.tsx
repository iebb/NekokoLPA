import React, {useState} from 'react';
import {StyleSheet,} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Button, Colors, Text, TextField, View} from "react-native-ui-lib";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faCancel, faDownload} from "@fortawesome/free-solid-svg-icons";
import BlockingLoader from "@/components/common/BlockingLoader";
import RemoteErrorView from "@/components/common/RemoteErrorView";
import MetadataView from "@/components/common/MetadataView";
import Title from "@/components/common/Title";
import Container from "@/components/common/Container";
import {makeLoading} from "@/components/utils/loading";
import {Adapters} from "@/native/adapters/registry";


export function ScannerAuthentication(
  {
    authenticateResult,
    deviceId,
    goBack,
    confirmDownload,
    initialConfirmationCode
  }: any
) {
  const { t } = useTranslation(['profile']);
  const [loading, setLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState(initialConfirmationCode);

  const adapter = Adapters[deviceId];

  return (
    <View>
      <Title>{t('profile:title_confirm_profile')}</Title>
      {
        loading && (
          <BlockingLoader message={t('profile:loading_download_profile')} />
        )
      }
      {
        (authenticateResult?.success) ? (
          <Container>
            <MetadataView metadata={authenticateResult.profile} />
            <View left column gap-10>
              {
                (authenticateResult.isCcRequired || confirmationCode) && (
                  <View style={styles.tableRow} row>
                    <Text style={styles.tableHeader}>
                      {t('profile:conf_code')}:
                    </Text>
                    <View style={styles.tableColumn}>
                      <TextField
                        placeholder={'Activation Code'}
                        value={confirmationCode}
                        onChangeText={c => setConfirmationCode(c)}
                        enableErrors
                        validate={['required']}
                        validationMessage={['Field is required']}
                        color={Colors.$textDefault}
                        placeholderTextColor={Colors.$textNeutralLight}
                        style={{
                          ...styles.tableColumn,
                          color: Colors.$textDefault,
                          borderColor: Colors.$outlineDisabledHeavy,
                          borderBottomWidth: 1,
                          marginBottom: -10,
                          marginTop: -5,
                          marginLeft: -5,
                        }}
                      />
                    </View>
                  </View>
                )
              }
            </View>
            <View flex>
              <View flex row style={{ gap: 10 }}>
                <Button
                  flex-1
                  marginV-12
                  backgroundColor={Colors.red20}
                  onPress={() => {
                    makeLoading(
                      setLoading,
                      async () => {
                        const cancelResult = await adapter.cancelSession(authenticateResult._internal);
                        console.log(cancelResult);
                        goBack();
                      }
                    )
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCancel}
                    style={{ color: Colors.white }}
                  />
                  <Text
                    marginL-10
                    color={Colors.white}
                  >{t('profile:ui_cancel')}</Text>
                </Button>
                <Button
                  style={{ flex: 10 }}
                  marginV-12
                  color={Colors.green50}
                  onPress={() => {
                    makeLoading(
                      setLoading,
                      async () => {
                        const downloadResult = await adapter.downloadProfile(authenticateResult._internal, confirmationCode);
                        await adapter.processNotifications(authenticateResult.profile.iccid);
                        // InfiLPA.refreshProfileList(device);
                        confirmDownload({
                          downloadResult
                        });
                      }
                    )
                  }}
                >
                  <FontAwesomeIcon
                    icon={faDownload}
                    style={{ color: Colors.white }}
                  />
                  <Text
                    style={{ color: Colors.white, marginLeft: 10 }}
                  >{t('profile:ui_download')}</Text>
                </Button>
              </View>
            </View>
          </Container>
        ) : (
          <Container>
            <View flex style={{ gap: 20 }}>
              <Text center text60>
                {t('profile:download_failure')}
              </Text>
              <RemoteErrorView remoteError={authenticateResult} />
              <View flex>
                <View flex gap-10>
                  <Button
                    flex-1
                    marginV-12
                    backgroundColor={Colors.grey60}
                    onPress={() => {
                      goBack();
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCancel}
                      style={{ color: Colors.white }}
                    />
                    <Text
                      style={{ color: Colors.white, marginLeft: 10 }}
                    >{t('profile:ui_back')}</Text>
                  </Button>
                </View>
              </View>
            </View>
          </Container>
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  tableHeader:{ width: 80, flexGrow: 0, flexShrink: 0, fontSize: 17 },
  tableColumn:{ flexGrow: 1, flexShrink: 0, fontSize: 17 },
  tableRow:{ flexDirection: "row", flex: 1, gap: 10 },
})
