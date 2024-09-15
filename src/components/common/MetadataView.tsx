import {Text, View} from "react-native-ui-lib";
import React, {useEffect, useState} from "react";
import {useTheme} from "@/theme";
import {ProfileMetadataMap} from "@/native/types";
import {StyleSheet, ToastAndroid, TouchableOpacity} from "react-native";
import {resolveMccMnc, T_PLMN} from "@/data/mccMncResolver";
import {parseMetadata} from "@/components/MainUI/ProfileList/parser";
import {useTranslation} from "react-i18next";
import Clipboard from "@react-native-clipboard/clipboard";

export default function MetadataView({ metadata }: { metadata?: ProfileMetadataMap }) {
  const { colors} = useTheme();
  const { t } = useTranslation(['profile']);

  const [resolvedMccMnc, setResolvedMccMnc] = useState<T_PLMN | undefined>();
  useEffect(() => {
    if (metadata?.uMCC_MNC) {
      setResolvedMccMnc(resolveMccMnc(metadata?.uMCC_MNC));
    }
  }, [metadata, metadata?.NICKNAME]);

  if (!metadata) return null;
  const readableMccMnc = metadata.uMCC_MNC.replaceAll("F", " ");
  return (
    <View left style={{
      flexDirection: "column", display: "flex",
      justifyContent: "space-between", gap: 10,
    }}>
      <View style={styles.tableRow}>
        <Text style={styles.tableHeader} color={colors.std200}>
          {t("profile:name")}:
        </Text>
        <TouchableOpacity style={styles.tableColumnTO}
          onPress={() => {
            if (metadata.NAME) {
              Clipboard.setString(metadata.NAME);
              ToastAndroid.show('Copied', ToastAndroid.SHORT);
            }
          }}
        >
          <Text style={styles.tableColumn} color={colors.std200}>
            {metadata.NAME}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tableRow}>
        <Text style={styles.tableHeader} color={colors.std200}>
          {t("profile:provider")}:
        </Text>
        <TouchableOpacity style={styles.tableColumnTO}
          onPress={() => {
            if (metadata.PROVIDER_NAME) {
              Clipboard.setString(metadata.PROVIDER_NAME);
              ToastAndroid.show('Copied', ToastAndroid.SHORT);
            }
          }}
        >
          <Text style={styles.tableColumn} color={colors.std200}>
            {metadata.PROVIDER_NAME}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tableRow}>
        <Text style={styles.tableHeader} color={colors.std200}>
          {t("profile:plmn")}:
        </Text>
        <TouchableOpacity style={styles.tableColumnTO}
          onPress={() => {
            if (readableMccMnc) {
              Clipboard.setString(readableMccMnc);
              ToastAndroid.show('Copied', ToastAndroid.SHORT);
            }
          }}
        >
          <Text style={styles.tableColumn} color={colors.std200}>
            {readableMccMnc}
          </Text>
        </TouchableOpacity>
      </View>
      {
        resolvedMccMnc && (
          <>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader} color={colors.std200}>
                {t("profile:country")}:
              </Text>
              <TouchableOpacity style={styles.tableColumnTO}
                onPress={() => {
                  if (resolvedMccMnc.Country) {
                    Clipboard.setString(resolvedMccMnc.Country);
                    ToastAndroid.show('Copied', ToastAndroid.SHORT);
                  }
                }}
              >
                <Text style={styles.tableColumn} color={colors.std200}>
                  {resolvedMccMnc.Emoji} {resolvedMccMnc.Country}
                </Text>
              </TouchableOpacity>
            </View>
            {
              resolvedMccMnc.Operator && (
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeader} color={colors.std200}>
                    {t("profile:operator")}:
                  </Text>
                  <TouchableOpacity style={styles.tableColumnTO}
                    onPress={() => {
                      if (resolvedMccMnc.Operator) {
                        Clipboard.setString(resolvedMccMnc.Operator);
                        ToastAndroid.show('Copied', ToastAndroid.SHORT);
                      }
                    }}
                  >
                    <Text style={styles.tableColumn} color={colors.std200} adjustsFontSizeToFit >
                      {resolvedMccMnc.Operator}
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            }
            {
              resolvedMccMnc.Brand && (
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeader} color={colors.std200}>
                    {t("profile:brand")}:
                  </Text>
                  <TouchableOpacity style={styles.tableColumnTO}
                    onPress={() => {
                      if (resolvedMccMnc.Brand) {
                        Clipboard.setString(resolvedMccMnc.Brand);
                        ToastAndroid.show('Copied', ToastAndroid.SHORT);
                      }
                    }}
                  >
                    <Text style={styles.tableColumn} color={colors.std200} adjustsFontSizeToFit>
                      {resolvedMccMnc.Brand}
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            }
          </>
        )
      }
      <View style={styles.tableRow}>
        <Text style={styles.tableHeader} color={colors.std200}>
          {t("profile:iccid")}:
        </Text>
        <TouchableOpacity style={styles.tableColumnTO}
          onPress={() => {
            if (metadata.ICCID) {
              Clipboard.setString(metadata.uICCID);
              ToastAndroid.show('Copied', ToastAndroid.SHORT);
            }
          }}
        >
          <Text style={styles.tableColumn} color={colors.std200} adjustsFontSizeToFit>
            {metadata.uICCID}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  tableHeader:{ width: 75, flexGrow: 0, flexShrink: 0, fontSize: 17 },
  tableColumn:{ fontSize: 17 },
  tableColumnTO:{ flexGrow: 1, flexShrink: 0, flexBasis: 0 },
  tableRow:{ flexDirection: "row", flex: 1, gap: 10, maxWidth: "100%" },
})