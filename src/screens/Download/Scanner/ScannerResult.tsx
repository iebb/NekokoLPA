import React, {useState} from 'react';
import {StyleSheet,} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Button, Colors, Text, TextField, View} from "react-native-ui-lib";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faArrowLeftLong, faCancel, faCheck, faCheckCircle} from "@fortawesome/free-solid-svg-icons";
import RemoteErrorView from "@/components/common/RemoteErrorView";
import MetadataView from "@/components/common/MetadataView";
import Title from "@/components/common/Title";
import Container from "@/components/common/Container";
import {makeLoading} from "@/components/utils/loading";
import BlockingLoader from "@/components/common/BlockingLoader";
import {Adapters} from "@/native/adapters/registry";


export function ScannerResult(
  {
    authenticateResult,
    downloadResult,
    deviceId,
    goBack,
    initialConfirmationCode
  }: any
) {
  const { t } = useTranslation(['main']);
  const [loading, setLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState(initialConfirmationCode);
  const adapter = Adapters[deviceId];

  return (
    <View>
      <Title>{t('main:profile_title_download_profile')}</Title>
      {
        loading && (
          <BlockingLoader />
        )
      }
      {
        (downloadResult?.success) ?
          (
            <Container>
              <View center style={{ marginVertical: 20 }}>
                <FontAwesomeIcon icon={faCheckCircle} size={80} color={Colors.green30} />
              </View>
              <Text center text60>
                {t('main:profile_download_success')}
              </Text>
              <MetadataView metadata={authenticateResult.profile} />
              <View left style={{
                marginTop: 50,
                flexDirection: "column", display: "flex",
                justifyContent: "space-between", gap: 10
              }}>
                {
                  (authenticateResult.isCcRequired) && (
                    <View style={styles.tableRow}>
                      <Text style={styles.tableHeader}>
                        {t('main:profile_conf_code')}:
                      </Text>
                      <TextField
                        placeholder={'Activation Code'}
                        value={confirmationCode}
                        onChangeText={c => setConfirmationCode(c)}
                        enableErrors
                        validate={['required']}
                        validationMessage={['Field is required']}
                        style={{...styles.tableColumn, borderBottomWidth: 1, flexGrow: 1, marginTop: -5 }}
                      />
                    </View>
                  )
                }
              </View>
              <View flex>
                <View flex row gap-10>
                  <Button
                    marginV-12 flex
                    backgroundColor={Colors.$backgroundNeutralHeavy}
                    onPress={() => {
                      goBack();
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faArrowLeftLong}
                      style={{ color: Colors.white }}
                    />
                    <Text
                      marginL-10
                      color={Colors.white}
                    >{t('main:profile_ui_back')}</Text>
                  </Button>
                  <Button
                    marginV-12 flex
                    backgroundColor={Colors.green500}
                    onPress={() => {
                      makeLoading(
                        setLoading,
                        async () => {
                          await adapter.enableProfileByIccId(authenticateResult.profile.iccid);
                          goBack();
                        }
                      )
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCheck}
                      style={{ color: Colors.white }}
                    />
                    <Text
                      marginL-10
                      color={Colors.white}
                    >{t('main:profile_ui_enable')}</Text>
                  </Button>
                </View>
              </View>
            </Container>
          ) : (
            <Container>
              <View flex style={{ gap: 20 }}>
                <Text center text60>
                  {t('main:profile_download_failure')}
                </Text>
                <RemoteErrorView remoteError={downloadResult} />
                <View flex>
                  <View flex style={{ flexDirection: "row", gap: 10 }}>
                    <Button
                      marginV-12 flex
                      backgroundColor={Colors.red20}
                      onPress={() => {
                        makeLoading(setLoading,
                          async () => {
                            await adapter.getProfiles();
                            goBack();
                          });
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faCancel}
                        style={{ color: Colors.white }}
                      />
                      <Text
                        marginL-10
                        color={Colors.white}
                      >{t('main:profile_ui_back')}</Text>
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
