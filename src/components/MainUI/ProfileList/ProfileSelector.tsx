import {Card, Switch, Text, View} from "react-native-ui-lib";
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import {selectAppConfig, selectEuicc, setState} from "@/redux/reduxDataStore";
import {Profile} from "@/native/types";
import InfiLPA from "@/native/InfiLPA";
import {RefreshControl, ScrollView} from "react-native";
import {ActionStatus} from "@/native/consts";
import {parseMetadata} from "@/components/MainUI/ProfileList/parser";
import {useCallback, useEffect, useState} from "react";
import {useTheme} from "@/theme";
import {useNavigation} from "@react-navigation/native";
import {useTranslation} from "react-i18next";
import BlockingLoader from "@/components/common/BlockingLoader";
import {findPhoneNumbersInText} from "libphonenumber-js/min";
import {SvgUri, SvgXml} from "react-native-svg";
import {Flags} from "@/assets/flags";


interface ProfileExt extends Profile {
  selected: boolean;
}

const loadingStates = [
  ActionStatus.ENABLE_PROFILE_STARTED,
  ActionStatus.DISABLE_PROFILE_STARTED,
  ActionStatus.DELETE_PROFILE_STARTED,
  ActionStatus.SET_NICKNAME_STARTED,
  ActionStatus.GET_PROFILE_LIST_STARTED,
];

export default function ProfileSelector({ eUICC = "SIM1" }) {

  const { colors} = useTheme();
  const { t } = useTranslation(['profile']);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { stealthMode } = useSelector(selectAppConfig);


  const { profileList, status} = useSelector(selectEuicc(eUICC), shallowEqual);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    dispatch(setState([{profileList: {
        selectedProfile: [],
        availableProfiles: []
    }}, eUICC]));
    setRefreshing(true);
    InfiLPA.refreshProfileList(eUICC);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);


  useEffect(() => {
    if (status === ActionStatus.GET_PROFILE_LIST_FINISHED) {
      setRefreshing(false);
    }
  }, [status]);

  const profiles = profileList ? [
    ...profileList.selectedProfile.map((profile: Profile) => ({...profile, selected: true})),
    ...profileList.availableProfiles.map((profile: Profile) => ({...profile, selected: false})),
  ] : []

  const isLoading = status !== undefined && loadingStates.includes(status);

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
                <Card
                  flex
                  left
                  onPress={() => {
                    // @ts-ignore
                    navigation.navigate('Profile', {
                      ICCID: metadata.ICCID,
                      metadata: metadata,
                      eUICC: eUICC,
                    });
                  }}
                  key={`${metadata.ICCID}_${i}`}
                  padding={false}
                  backgroundColor={colors.cardBackground}
                  enableShadow
                  style={{
                    borderRadius: 10,
                    borderBottomColor: `hsl(${hueICCID}, 80%, 55%)`,
                    borderBottomWidth: 2,
                  }}
                >
                  <View style={{ paddingLeft: 15, paddingVertical: 5, paddingRight: 10, gap: 5 }} paddingH-0 margin-0>
                    <View row flex width="100%">
                      <View style={{ flexShrink: 1, flexGrow: 1 }}>
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
                      </View>
                      <View
                        style={{
                          padding: 5, width: 50,
                          flexShrink: 0, flexGrow: 0
                        }}
                      >
                        <Switch
                          value={profile.selected}
                          disabled={isLoading}
                          padding-5
                          onValueChange={(value2: boolean) => {
                            if (profile.selected) {
                              InfiLPA.disableProfileByIccId(metadata.ICCID);
                            } else {
                              InfiLPA.enableProfileByIccId(metadata.ICCID);
                            }
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
              )
            })
          }
        </View>
      </ScrollView>
    </View>
  )
}