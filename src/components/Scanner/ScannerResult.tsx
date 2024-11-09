import React, {useState} from 'react';
import {StyleSheet,} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme} from '@/theme';
import {Button, Colors, Text, TextField, View} from "react-native-ui-lib";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faArrowLeftLong, faCancel, faCheck, faCheckCircle} from "@fortawesome/free-solid-svg-icons";
import InfiLPA from "@/native/InfiLPA";
import RemoteErrorView from "@/components/common/RemoteErrorView";
import MetadataView from "@/components/common/MetadataView";
import Title from "@/components/common/Title";
import Container from "@/components/common/Container";
import {makeLoading} from "@/components/utils/loading";
import BlockingLoader from "@/components/common/BlockingLoader";


export function ScannerResult(
  {
    authenticateResult,
    downloadResult,
    eUICC,
    goBack,
    initialConfirmationCode
  }: any
) {
  const device = eUICC.name;
  const { t } = useTranslation(['profile']);
  const { colors, gutters} = useTheme();
  const [loading, setLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState(initialConfirmationCode);

  return (
    <View>
      <Title>{t('profile:title_download_profile')}</Title>
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
                <FontAwesomeIcon icon={faCheckCircle} size={80} color={colors.green500} />
              </View>
              <Text center text60 color={colors.std200}>
                {t('profile:download_success')}
              </Text>
              <MetadataView metadata={authenticateResult.profileMetadata} />
              <View left style={{
                marginTop: 50,
                flexDirection: "column", display: "flex",
                justifyContent: "space-between", gap: 10
              }}>
                {
                  (authenticateResult.isCcRequired) && (
                    <View style={styles.tableRow}>
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
                        style={{...styles.tableColumn, borderBottomWidth: 1, marginBottom: -10, flexGrow: 1, marginTop: -5 }}
                      />
                    </View>
                  )
                }
              </View>
              <View flex>
                <View flex style={{ flexDirection: "row", gap: 10 }}>
                  <Button
                    style={{ flex: 1, ...gutters.marginVertical_12 }}
                    backgroundColor={colors.gray500}
                    onPress={() => {
                      goBack();
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faArrowLeftLong}
                      style={{ color: colors.constWhite }}
                    />
                    <Text
                      style={{ color: colors.constWhite, marginLeft: 10 }}
                    >{t('profile:ui_back')}</Text>
                  </Button>
                  <Button
                    style={{ flex: 1, ...gutters.marginVertical_12 }}
                    backgroundColor={Colors.green500}
                    onPress={() => {
                      makeLoading(
                        setLoading,
                        () => {
                          InfiLPA.enableProfileByIccId(device, authenticateResult.profileMetadata.iccid);
                          goBack();
                        }
                      )
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCheck}
                      style={{ color: colors.constWhite }}
                    />
                    <Text
                      style={{ color: colors.constWhite, marginLeft: 10 }}
                    >{t('profile:ui_enable')}</Text>
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
                <RemoteErrorView remoteError={downloadResult?.remoteError} />
                <View flex>
                  <View flex style={{ flexDirection: "row", gap: 10 }}>
                    <Button
                      style={{ flex: 1, ...gutters.marginVertical_12 }}
                      backgroundColor={colors.gray500}
                      onPress={() => {
                        makeLoading(setLoading, () => {
                          InfiLPA.refreshProfileList(device);
                          goBack();
                        });
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
