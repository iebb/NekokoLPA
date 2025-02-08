import {Colors, Text, View} from "react-native-ui-lib";
import React, {useEffect, useState} from "react";
import {ProfileMetadataMap} from "@/native/types";
import {Image, StyleSheet, ToastAndroid, TouchableOpacity} from "react-native";
import {resolveMccMnc, T_PLMN} from "@/data/mccMncResolver";
import {useTranslation} from "react-i18next";
import Clipboard from "@react-native-clipboard/clipboard";
import {Flags} from "@/assets/flags";

export default function MetadataView({ metadata }: { metadata?: ProfileMetadataMap }) {
  const { t } = useTranslation(['main']);

  const [resolvedMccMnc, setResolvedMccMnc] = useState<T_PLMN | undefined>();
  useEffect(() => {
    if (metadata?.profileOwnerMccMnc) {
      setResolvedMccMnc(resolveMccMnc(metadata?.profileOwnerMccMnc));
    }
  }, [metadata, metadata?.profileNickname]);

  if (!metadata) return null;
  const readableMccMnc = metadata.profileOwnerMccMnc.replaceAll("F", " ");

  return (
    <View left flex gap-10>
      <View row flex-1 gap-12>
        <Text $textDefault style={styles.tableHeader}>
          {t("main:profile_name")}:
        </Text>
        <TouchableOpacity  
          onPress={() => {
            if (metadata.profileName) {
              Clipboard.setString(metadata.profileName);
              ToastAndroid.show('Copied', ToastAndroid.SHORT);
            }
          }}
        >
          <Text $textDefault flexG text70L>
            {metadata.profileName}
          </Text>
        </TouchableOpacity>
      </View>
      <View row flex-1 gap-12>
        <Text $textDefault style={styles.tableHeader}>
          {t("main:profile_provider")}:
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (metadata.serviceProviderName) {
              Clipboard.setString(metadata.serviceProviderName);
              ToastAndroid.show('Copied', ToastAndroid.SHORT);
            }
          }}
        >
          <Text $textDefault flexG text70L>
            {metadata.serviceProviderName}
          </Text>
        </TouchableOpacity>
      </View>
      <View row flex-1 gap-12>
        <Text $textDefault style={styles.tableHeader}>
          {t("main:profile_plmn")}:
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (readableMccMnc) {
              Clipboard.setString(readableMccMnc);
              ToastAndroid.show('Copied', ToastAndroid.SHORT);
            }
          }}
        >
          <Text $textDefault flexG text70L>
            {readableMccMnc}
          </Text>
        </TouchableOpacity>
      </View>
      {
        resolvedMccMnc && (
          <>
            <View row flex-1 gap-12>
              <Text $textDefault style={styles.tableHeader}>
                {t("main:profile_country")}:
              </Text>
              <TouchableOpacity
                style={{display: "flex", flexDirection: "row", gap: 5}}
                onPress={() => {
                  if (resolvedMccMnc.Country) {
                    Clipboard.setString(resolvedMccMnc.Country);
                    ToastAndroid.show('Copied', ToastAndroid.SHORT);
                  }
                }}
              >
                <Image
                  style={{width: 20, height: 20}}
                  source={Flags[resolvedMccMnc?.ISO1 || "UN"] || Flags.UN}
                />
                <Text $textDefault flexG text70L>
                  {resolvedMccMnc.Country}
                </Text>
              </TouchableOpacity>
            </View>
            {
              resolvedMccMnc.Operator && (
                <View row flex-1 gap-12>
                  <Text $textDefault style={styles.tableHeader}>
                    {t("main:profile_operator")}:
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (resolvedMccMnc.Operator) {
                        Clipboard.setString(resolvedMccMnc.Operator);
                        ToastAndroid.show('Copied', ToastAndroid.SHORT);
                      }
                    }}
                  >
                    <Text $textDefault flexG text70L adjustsFontSizeToFit >
                      {resolvedMccMnc.Operator}
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            }
            {
              resolvedMccMnc.Brand && (
                <View row flex-1 gap-12>
                  <Text $textDefault style={styles.tableHeader}>
                    {t("main:profile_brand")}:
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (resolvedMccMnc.Brand) {
                        Clipboard.setString(resolvedMccMnc.Brand);
                        ToastAndroid.show('Copied', ToastAndroid.SHORT);
                      }
                    }}
                  >
                    <Text $textDefault flexG text70L adjustsFontSizeToFit>
                      {resolvedMccMnc.Brand}
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            }
          </>
        )
      }
      <View row flex-1 gap-12>
        <Text $textDefault style={styles.tableHeader}>
          {t("main:profile_iccid")}:
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (metadata.iccid) {
              Clipboard.setString(metadata.iccid);
              ToastAndroid.show('Copied', ToastAndroid.SHORT);
            }
          }}
        >
          <Text $textDefault flexG text70L adjustsFontSizeToFit>
            {metadata.iccid}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  tableHeader:{ width: 100, flexGrow: 0, flexShrink: 0, fontSize: 17 },
})