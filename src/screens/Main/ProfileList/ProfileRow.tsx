import {parseMetadata} from "@/utils/parser";
import {findPhoneNumbersInText} from "libphonenumber-js/min";
import {preferences, sizeStats} from "@/utils/mmkv";
import {Card, Colors, Drawer, Switch, Text, View} from "react-native-ui-lib";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faPencil, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Alert, Image, PixelRatio, TouchableOpacity} from "react-native";
import {makeLoading} from "@/components/utils/loading";
import {Flags} from "@/assets/flags";
import {formatSize} from "@/utils/size";
import React from "react";
import {useTranslation} from "react-i18next";
import {useNavigation} from "@react-navigation/native";
import {Profile} from "@/native/types";
import {Adapters} from "@/native/adapters/registry";


interface ProfileExt extends Profile {
  selected: boolean;
}


export const ProfileRow = ({profile, deviceId, isLoading, setLoading} : {profile: ProfileExt, deviceId: string, isLoading: boolean, setLoading: any}) => {
  const { t } = useTranslation(['main']);
  const adapter = Adapters[deviceId];

  const navigation = useNavigation();
  const stealthMode = preferences.getString("redactMode") ?? "none";
  const displaySubtitle = preferences.getString("displaySubtitle") ?? "profileProvider";
  const metadata = profile;
  const numICCID = metadata.iccid.replaceAll(/\D/g, '');
  const hueICCID = (parseInt(numICCID.substring(numICCID.length - 7), 10) * 17.84) % 360;
  const { tags, name, country, mccMnc } = parseMetadata(metadata, t);

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

  // useEffect(() => {
  //
  //   const searchString = (displaySubtitle === "provider") ? (
  //     `${metadata?.serviceProviderName} - ${mccMnc.Brand ?? mccMnc.Operator}`
  //   ) : (displaySubtitle === "operator") ? (
  //     `${mccMnc.Brand ?? mccMnc.Operator}`
  //   ) : (displaySubtitle === "code") ? (
  //     `${mccMnc.Brand ?? mccMnc.Operator}`
  //   ) : (displaySubtitle === "country") ? (
  //     null
  //   ) : (displaySubtitle === "iccid") ? (
  //     null
  //   ) : (
  //     `${metadata?.serviceProviderName}`
  //   )
  //
  //
  //   // if (searchString != null) {
  //   //   getUri(searchString).then(
  //   //     uri => setImageUri(uri)
  //   //   );
  //   // }
  // }, [mccMnc, metadata, displaySubtitle]);

  return (
    <Drawer
      key={`${metadata.iccid}`}
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
          t('main:profile_delete_profile'),
          t('main:profile_delete_profile_alert_body'), [
            {
              text: t('main:profile_delete_tag_cancel'),
              onPress: () => {},
              style: 'cancel',
            },
            {
              text: t('main:profile_delete_tag_ok'),
              style: 'destructive',
              onPress: () => {
                Alert.alert(
                  t('main:profile_delete_profile_alert2'),
                  t('main:profile_delete_profile_alert2_body'), [
                    {
                      text: t('main:profile_delete_tag_ok'),
                      style: 'destructive',
                      onPress: () => {
                        makeLoading(setLoading, async () => {
                          await adapter.deleteProfileByIccId(metadata.iccid);
                          await adapter.processNotifications(metadata.iccid);
                        })
                      }
                    },
                    {
                      text: t('main:profile_delete_tag_cancel'),
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
                {/*{*/}
                {/*  imageUri && (*/}
                {/*    <Image*/}
                {/*      source={{ uri: imageUri }}*/}
                {/*      style={{*/}
                {/*        marginRight: 4,*/}
                {/*        width: 12,*/}
                {/*        height: 12*/}
                {/*      }}*/}
                {/*    />*/}
                {/*  )*/}
                {/*}*/}
                <Text text90L $textNeutral numberOfLines={1}>
                  {
                    (displaySubtitle === "provider") ? (
                      `${metadata?.serviceProviderName} / ${metadata?.profileName}`
                    ) : (displaySubtitle === "operator") ? (
                      `[${mccMnc.ISO}] ${mccMnc.Operator}`
                    ) : (displaySubtitle === "code") ? (
                      `[${mccMnc.ISO}] ${mccMnc.PLMN} ${mccMnc.TADIG}`
                    ) : (displaySubtitle === "country") ? (
                      `[${mccMnc.ISO}] ${mccMnc.Country}`
                    ) : (displaySubtitle === "iccid") ? (
                      `ICCID: ${metadata.iccid}`
                    ) : (
                      `${metadata?.serviceProviderName} / ${metadata?.profileName}`
                    )
                  }
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
            </View>
            {
              (Size > 1536) && (
                <Text text100L $textDefault style={{ position: "absolute", right: 2, bottom: 0 }} numberOfLines={1}>
                  {formatSize(Size)}
                </Text>
              )
            }
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
};