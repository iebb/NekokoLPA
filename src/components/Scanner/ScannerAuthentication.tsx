import React, {useState} from 'react';
import {StyleSheet,} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme} from '@/theme';
import {Button, Colors, Text, TextField, View} from "react-native-ui-lib";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faCancel, faDownload} from "@fortawesome/free-solid-svg-icons";
import InfiLPA from "@/native/InfiLPA";
import BlockingLoader from "@/components/common/BlockingLoader";
import RemoteErrorView from "@/components/common/RemoteErrorView";
import MetadataView from "@/components/common/MetadataView";
import Title from "@/components/common/Title";
import Container from "@/components/common/Container";
import {makeLoading} from "@/components/utils/loading";


export function ScannerAuthentication(
  {
    authenticateResult,
    eUICC,
    goBack,
    confirmDownload,
    initialConfirmationCode
  }: any
) {
  const device = eUICC.name;
  const { t } = useTranslation(['profile']);
  const { colors, gutters} = useTheme();
  const [loading, setLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState(initialConfirmationCode);

  console.log(authenticateResult);

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
            <MetadataView metadata={authenticateResult.profileMetadata} />
            <View left style={{
              flexDirection: "column", display: "flex",
              justifyContent: "space-between", gap: 10
            }}>
              {
                (authenticateResult.isCcRequired || confirmationCode) && (
                  <View style={styles.tableRow} row>
                    <Text style={styles.tableHeader} color={colors.std200}>
                      {t('profile:conf_code')}:
                    </Text>
                    <TextField
                      placeholder={'Activation Code'}
                      value={confirmationCode}
                      onChangeText={c => setConfirmationCode(c)}
                      enableErrors
                      validate={['required']}
                      validationMessage={['Field is required']}
                      color={colors.std200}
                      style={{
                        ...styles.tableColumn,
                        borderColor: colors.std400,
                        borderBottomWidth: 1,
                        marginBottom: -10,
                        flexGrow: 1,
                        marginTop: -5,
                        marginLeft: -5
                    }}
                    />
                  </View>
                )
              }
            </View>
            <View flex>
              <View flex row style={{ gap: 10 }}>
                <Button
                  style={{ flex: 1, ...gutters.marginVertical_12 }}
                  backgroundColor={Colors.red20}
                  onPress={() => {
                    makeLoading(
                      setLoading,
                      () => {
                        InfiLPA.cancelSession(device);
                        goBack();
                      }
                    )
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCancel}
                    style={{ color: colors.constWhite }}
                  />
                  <Text
                    style={{ color: colors.constWhite, marginLeft: 10 }}
                  >{t('profile:ui_cancel')}</Text>
                </Button>
                <Button
                  style={{ flex: 10, ...gutters.marginVertical_12 }}
                  color={Colors.green50}
                  onPress={() => {
                    makeLoading(
                      setLoading,
                      () => {
                        const downloadResult = InfiLPA.downloadProfile(device, confirmationCode);
                        InfiLPA.refreshProfileList(device);
                        confirmDownload({
                          downloadResult
                        });
                      }
                    )
                  }}
                >
                  <FontAwesomeIcon
                    icon={faDownload}
                    style={{ color: colors.constWhite }}
                  />
                  <Text
                    style={{ color: colors.constWhite, marginLeft: 10 }}
                  >{t('profile:ui_download')}</Text>
                </Button>
              </View>
            </View>
          </Container>
        ) : (
          <Container>
            <View flex style={{ gap: 20 }}>
              <Text center text60 color={colors.std200}>
                {t('profile:download_failure')}
              </Text>
              <RemoteErrorView remoteError={authenticateResult?.remoteError} />
              <View flex>
                <View flex style={{ flexDirection: "row", gap: 10 }}>
                  <Button
                    style={{ flex: 1, ...gutters.marginVertical_12 }}
                    backgroundColor={colors.gray600}
                    onPress={() => {
                      goBack();
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCancel}
                      style={{ color: colors.constWhite }}
                    />
                    <Text
                      style={{ color: colors.constWhite, marginLeft: 10 }}
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
