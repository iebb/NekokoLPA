import {Card, Colors, Drawer, Switch, Text, View} from "react-native-ui-lib";
import {useSelector} from "react-redux";
import {Profile} from "@/native/types";
import {Alert, Image, PixelRatio, RefreshControl, ScrollView, TouchableOpacity} from "react-native";
import {parseMetadata} from "@/screens/Main/MainUI/ProfileList/parser";
import React, {useState} from "react";
import {useNavigation} from "@react-navigation/native";
import {useTranslation} from "react-i18next";
import BlockingLoader from "@/components/common/BlockingLoader";
import {findPhoneNumbersInText} from "libphonenumber-js/min";
import {Flags} from "@/assets/flags";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faPencil, faTrash} from "@fortawesome/free-solid-svg-icons";
import {makeLoading} from "@/components/utils/loading";
import {Adapters} from "@/native/adapters/registry";
import {selectDeviceState} from "@/redux/stateStore";
import {preferences, sizeStats} from "@/storage/mmkv";


interface ProfileExt extends Profile {
  selected: boolean;
}

export default function ProfileSelector({ deviceId } : { deviceId: string }) {

  const DeviceState = useSelector(selectDeviceState(deviceId));

  const { t } = useTranslation(['profile']);
  const navigation = useNavigation();
  const stealthMode = preferences.getString("redactMode") ?? "none";
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const profileList = DeviceState.profiles;

  const profiles = ((profileList as any)?.map ? profileList : []).map(
    (profile: Profile) => ({...profile, selected: profile.profileState === 1})
  ) || []

  const isLoading = loading; // (status !== undefined && loadingStates.includes(status)) || ;
  
  const adapter = Adapters[deviceId];

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
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            adapter.initialize();
          }} />
        }
      >
        <View gap-10>
          {
            profiles.map((profile: ProfileExt, i: number) => {
              const metadata = profile;
              const numICCID = metadata.iccid.replaceAll(/\D/g, '');
              const hueICCID = (parseInt(numICCID.substring(numICCID.length - 7), 10) * 17.84) % 360;
              const { tags, name, country } = parseMetadata(metadata, t);

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

              let Size = 0;
              if (metadata?.iccid) {
                Size = sizeStats.getNumber(metadata?.iccid) || 0;
              }


              return (
                <Drawer
                  key={`${metadata.iccid}_${i}`}
                  style={{
                    borderRadius: 15,
                    overflow: "hidden",
                  }}
                  rightItems={profile.selected ? [] : [{
                    customElement: (
                      <FontAwesomeIcon icon={faTrash} style={{ color: Colors.$backgroundDefault, }} />
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
                                    makeLoading(setLoading, async () => {
                                      await adapter.deleteProfileByIccId(metadata.iccid);
                                    })
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
                  }]}
                  leftItem={{
                    customElement: (
                      <FontAwesomeIcon icon={faPencil} style={{ color: Colors.$backgroundDefault, }} />
                    ),
                    background: Colors.yellow30,
                    width: 60,
                    onPress: () => {
                      // @ts-ignore
                      navigation.navigate('Profile', {
                        iccid: metadata.iccid,
                        metadata: metadata,
                        deviceId: deviceId,
                      });
                    }
                  }}
                >
                  <Card
                    style={{ backgroundColor: Colors.cardBackground }}
                  >
                    <View
                      paddingT-5
                      paddingL-15
                      paddingR-10
                      margin-0
                      gap-5
                    >
                      <View row flex width="100%">
                        <TouchableOpacity
                          style={{ flexShrink: 1, flexGrow: 1 }}
                          onPress={() => {
                            // @ts-ignore
                            navigation.navigate('Profile', {
                              iccid: metadata.iccid,
                              metadata: metadata,
                              deviceId: deviceId,
                            });
                          }}
                        >
                          <View row gap-2>
                            <Image
                              style={{width: 20 * PixelRatio.getFontScale(), height: 20 * PixelRatio.getFontScale()}}
                              source={Flags[country] || Flags.UN}
                            />
                            <Text marginL-5 text70L $textDefault style={{ marginTop: -2 }}>
                              {
                                (stealthMode === 'none' || stealthMode === 'medium') ? replacedName : (
                                  metadata?.serviceProviderName
                                )
                              }
                            </Text>
                          </View>
                          <View row>
                            <Text text90L $textDefault>
                              {metadata?.serviceProviderName} / {metadata?.profileName}
                            </Text>
                          </View>
                          <View>
                            <View row gap-5 marginV-2>
                              {tags.map((t, i) => {
                                return (
                                  <View style={{ paddingHorizontal: 5, borderRadius: 5, backgroundColor: t.backgroundColor }} key={i}>
                                    <Text style={{ color: t.color, fontSize: 10, fontWeight: 500}}>{
                                      stealthMode === 'none' ? t.value : stealthMode === 'medium' ? t.value : '***'
                                    }</Text>
                                  </View>
                                )
                              })}
                            </View>
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
                            style={{ marginTop: -5 }}
                            padding-5
                            onValueChange={async (value2: boolean) => {
                              makeLoading(setLoading, async () => {
                                if (profile.selected) {
                                  await adapter.disableProfileByIccId(metadata.iccid);
                                } else {
                                  await adapter.enableProfileByIccId(metadata.iccid);
                                }
                              })
                            }}
                          />
                          {
                            Size > 1000 && (
                              <Text text100L $textDefault style={{ position: "absolute", right: 5, bottom: 0 }}>
                                ~{(Size / 1024).toFixed(1)}kB
                              </Text>
                            )
                          }
                        </View>
                      </View>
                    </View>
                    <View
                      style={{ height: 2, backgroundColor: `hsl(${hueICCID}, 50%, 50%)`}}
                    />
                    {/*<View*/}
                    {/*  style={{ height: 2, overflow: "hidden" }}*/}
                    {/*  row*/}
                    {/*>*/}
                    {/*  {*/}
                    {/*    _.range(screenWidth / 25 + 2).map(i => (*/}
                    {/*      <Image*/}
                    {/*        key={i}*/}
                    {/*        source={Flags[country] || Flags.UN}*/}
                    {/*        resizeMode="contain"*/}
                    {/*        style={{ height: 25, width: 25, marginTop: -10, marginLeft: -2, transform: [{rotate: '45deg'}] }}*/}
                    {/*      />*/}
                    {/*    ))*/}
                    {/*  }*/}
                    {/*</View>*/}
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