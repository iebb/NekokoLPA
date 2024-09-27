import {Card, Colors, Drawer, Switch, Text, View} from "react-native-ui-lib";
import {useDispatch, useSelector} from "react-redux";
import {EuiccList, selectAppConfig, setState} from "@/redux/reduxDataStore";
import {Profile} from "@/native/types";
import InfiLPA from "@/native/InfiLPA";
import {Alert, RefreshControl, ScrollView, TouchableOpacity} from "react-native";
import {parseMetadata} from "@/components/MainUI/ProfileList/parser";
import {useCallback, useState} from "react";
import {useTheme} from "@/theme";
import {useNavigation} from "@react-navigation/native";
import {useTranslation} from "react-i18next";
import BlockingLoader from "@/components/common/BlockingLoader";
import {findPhoneNumbersInText} from "libphonenumber-js/min";
import {Flags} from "@/assets/flags";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faPencil, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";


interface ProfileExt extends Profile {
  selected: boolean;
}

export default function ProfileSelector({ eUICC } : { eUICC: EuiccList }) {
  const device = eUICC.name;

  const { colors} = useTheme();
  const { t } = useTranslation(['profile']);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { stealthMode } = useSelector(selectAppConfig);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRefresh = useCallback(() => {
    dispatch(setState([{profileList: {
        profiles: [],
      }}, eUICC.name]));
    setRefreshing(true);
    InfiLPA.refreshProfileList(eUICC.name);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const profileList = eUICC.profiles;

  const profiles = profileList?.profiles?.map(
    (profile: Profile) => ({...profile, selected: profile.profileMetadataMap.STATE === "Enabled"})
  ) || []

  const isLoading = loading; // (status !== undefined && loadingStates.includes(status)) || ;

  return (
    <View
      style={{
        overflow: "hidden",
      }}
      flex-1
      flexG-1
      paddingB-10
    >
      {
        isLoading && (
          <BlockingLoader />
        )
      }
      <ScrollView
        bounces
        alwaysBounceVertical
        overScrollMode="always"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View gap-10>
          {
            profiles.map((profile: ProfileExt, i: number) => {
              const metadata = profile.profileMetadataMap;
              const numICCID = metadata.uICCID.replaceAll(/\D/g, '');
              const hueICCID = (parseInt(numICCID.substring(numICCID.length - 7), 10) * 17.84) % 360;
              const { tags, name, country } = parseMetadata(metadata, colors, t);

              const phoneNumbers = findPhoneNumbersInText(name);
              let replacedName = name;
              for(const p of phoneNumbers) {
                const match = name.substring(p.startsAt, p.endsAt);
                const formatted = p.number.formatInternational();

                if (stealthMode === 'medium') {
                  const ccPrefix = "+" + p.number.countryCallingCode + " ";
                  const toReplace = formatted.substring(ccPrefix.length);
                  replacedName = replacedName.replaceAll(
                    match, ccPrefix + toReplace.replaceAll(/\d/g, '*')
                  );
                } else {
                  replacedName = replacedName.replaceAll(
                    match, formatted
                  );
                }
              }

              const Flag = (Flags[country] || Flags.UN).default;


              return (
                <Drawer
                  key={`${metadata.ICCID}_${i}`}
                  style={{
                    borderRadius: 15,
                    overflow: "hidden",
                  }}
                  rightItems={profile.selected ? [] : [{
                    customElement: (
                      <FontAwesomeIcon icon={faTrash} style={{ color: colors.cardBackground, }} />
                    ),
                    width: 60,
                    background: Colors.red30,
                    onPress: () => Alert.alert(
                      t('profile:delete_profile'),
                      t('profile:delete_profile_alert_body'), [
                        {
                          text: t('profile:delete_tag_cancel'),
                          onPress: () => {},
                          style: 'cancel',
                        },
                        {
                          text: t('profile:delete_tag_ok'),
                          style: 'destructive',
                          onPress: () => {
                            Alert.alert(
                              t('profile:delete_profile_alert2'),
                              t('profile:delete_profile_alert2_body'), [
                                {
                                  text: t('profile:delete_tag_ok'),
                                  style: 'destructive',
                                  onPress: () => {
                                    setLoading(true);
                                    setTimeout(() => {
                                      try {
                                        InfiLPA.deleteProfileByIccId(device, metadata.ICCID);
                                      } finally {
                                        setTimeout(() => {
                                          setLoading(false);
                                        }, 100);
                                      }
                                    }, 10);
                                  }
                                },
                                {
                                  text: t('profile:delete_tag_cancel'),
                                  onPress: () => {},
                                  style: 'cancel',
                                },
                              ])
                          }
                        },
                      ])
                  }/*, {
                    customElement: (
                      <FontAwesomeIcon icon={faTrash} style={{ color: colors.cardBackground, }} />
                    ),
                    background: Colors.yellow30,
                    width: 60,
                    onPress: () => console.log('read pressed')
                  }*/]}
                  leftItem={{
                    customElement: (
                      <FontAwesomeIcon icon={faPencil} style={{ color: colors.cardBackground, }} />
                    ),
                    background: Colors.yellow30,
                    width: 60,
                    onPress: () => {
                      // @ts-ignore
                      navigation.navigate('Profile', {
                        ICCID: metadata.ICCID,
                        metadata: metadata,
                        eUICC: eUICC,
                      });
                    }
                  }}
                >
                  <Card
                    flex
                    style={{
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                    left
                    padding={false}
                    backgroundColor={colors.cardBackground}
                    enableShadow
                  >
                    <View
                      style={{
                        paddingVertical: 5,
                        gap: 5,
                        borderBottomColor: `hsl(${hueICCID}, 80%, 55%)`,
                        borderBottomWidth: 2,
                      }}
                      paddingH-15
                      margin-0
                    >
                      <View row flex width="100%">
                        <TouchableOpacity
                          style={{ flexShrink: 1, flexGrow: 1 }}
                        >
                          <View row>
                            <Flag
                              width={20}
                              height={20}
                            />
                            <Text color={colors.std200} marginL-5 style={{ fontSize: 16, marginTop: -2 }}>
                              {
                                (stealthMode === 'none' || stealthMode === 'medium') ? replacedName : (
                                  metadata?.PROVIDER_NAME
                                )
                              }
                            </Text>
                          </View>
                          <View row>
                            <Text text90L color={colors.std200}>
                              {metadata?.PROVIDER_NAME} / {metadata?.NAME}
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <View
                          style={{
                            padding: 5, width: 50,
                            flexShrink: 0, flexGrow: 0,
                          }}
                        >
                          <Switch
                            value={profile.selected}
                            disabled={isLoading}
                            padding-5
                            onValueChange={async (value2: boolean) => {
                              setLoading(true);
                              setTimeout(() => {
                                try {
                                  if (profile.selected) {
                                    InfiLPA.disableProfileByIccId(device, metadata.ICCID);
                                  } else {
                                    InfiLPA.enableProfileByIccId(device, metadata.ICCID);
                                  }
                                } finally {
                                  setTimeout(() => {
                                    setLoading(false);
                                  }, 100);
                                }
                              }, 10);
                            }}
                          />
                        </View>
                      </View>
                      <View>
                        <View row style={{ gap : 5 }}>
                          {tags.map((t, i) => {
                            return (
                              <View style={{ paddingHorizontal: 5, borderRadius: 5, backgroundColor: t.backgroundColor }} key={i}>
                                <Text color={colors.std200} style={{ color: t.color, fontSize: 10, fontWeight: 500}}>{
                                  stealthMode === 'none' ? t.value : stealthMode === 'medium' ? t.value : '***'
                                }</Text>
                              </View>
                            )
                          })}
                        </View>
                        {/*<Text text90L $textDefault color={colors.std200}>*/}
                        {/*  ICCID: {metadata?.uICCID.replaceAll(/(?<=\d{10})\d/g, '*')}*/}
                        {/*</Text>*/}
                      </View>
                    </View>
                  </Card>
                </Drawer>
              )
            })
          }
        </View>
      </ScrollView>
    </View>
  )
}