import {parseMetadata} from "@/utils/parser";
import {findPhoneNumbersInText} from "libphonenumber-js/min";
import {preferences, sizeStats} from "@/utils/mmkv";
import {Card, Colors, Drawer, Switch, Text, View} from "react-native-ui-lib";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faPencil, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Alert, Image, PixelRatio, ToastAndroid, TouchableOpacity} from "react-native";
import {makeLoading} from "@/components/utils/loading";
import {Flags} from "@/assets/flags";
import {formatSize} from "@/utils/size";
import React, {useMemo, useCallback} from "react";
import {useTranslation} from "react-i18next";
import {useNavigation} from "@react-navigation/native";
import {Profile} from "@/native/types";
import {Adapters} from "@/native/adapters/registry";
import {useLoading} from "@/components/common/LoadingProvider";

interface ProfileExt extends Profile {
  selected: boolean;
}

// Extracted components
const ProfileTags = React.memo(({ tags, stealthMode }: { tags: any[]; stealthMode: string }) => (
  <View row gap-5 marginV-2>
    {tags.map((t, i) => (
      <View 
        style={{ paddingHorizontal: 5, borderRadius: 5, backgroundColor: t.backgroundColor }} 
        key={i}
      >
        <Text style={{ color: t.color, fontSize: 10, fontWeight: 500}}>
          {stealthMode === 'none' ? t.value : stealthMode === 'medium' ? t.value : '***'}
        </Text>
      </View>
    ))}
  </View>
));

const ProfileSubtitle = React.memo(({ 
  metadata, 
  mccMnc, 
  displaySubtitle 
}: { 
  metadata: any; 
  mccMnc: any; 
  displaySubtitle: string; 
}) => {
  const subtitleText = useMemo(() => {
    switch (displaySubtitle) {
      case "provider":
        return `${metadata?.serviceProviderName} / ${metadata?.profileName}`;
      case "operator":
        return `[${mccMnc.ISO}] ${mccMnc.Operator}`;
      case "code":
        return `[${mccMnc.ISO}] ${mccMnc.PLMN} ${mccMnc.TADIG}`;
      case "country":
        return `[${mccMnc.ISO}] ${mccMnc.Country}`;
      case "iccid":
        return `ICCID: ${metadata.iccid}`;
      default:
        return `${metadata?.serviceProviderName} / ${metadata?.profileName}`;
    }
  }, [metadata, mccMnc, displaySubtitle]);

  return (
    <Text text90L $textNeutral numberOfLines={1}>
      {subtitleText}
    </Text>
  );
});

export const ProfileRow = ({profile, deviceId} : {profile: ProfileExt, deviceId: string}) => {
  const { t } = useTranslation(['main']);
  const adapter = Adapters[deviceId];
  const { setLoading, isLoading } = useLoading();
  const navigation = useNavigation();
  
  // Memoize preferences
  const stealthMode = useMemo(() => 
    preferences.getString("redactMode") ?? "none", 
    []
  );
  const displaySubtitle = useMemo(() => 
    preferences.getString("displaySubtitle") ?? "profileProvider", 
    []
  );

  // Memoize metadata processing
  const metadata = profile;
  const { tags, name, country, mccMnc } = useMemo(() => 
    parseMetadata(metadata, t), 
    [metadata, t]
  );

  // Memoize ICCID calculations
  const { numICCID, hueICCID } = useMemo(() => {
    const numICCID = metadata.iccid.replaceAll(/\D/g, '');
    const hueICCID = (parseInt(numICCID.substring(numICCID.length - 7), 10) * 17.84) % 360;
    return { numICCID, hueICCID };
  }, [metadata.iccid]);

  // Memoize phone number processing
  const replacedName = useMemo(() => {
    const phoneNumbers = findPhoneNumbersInText(name, country as any);
    let result = name;
    
    for (const p of phoneNumbers) {

      const match = name.substring(p.startsAt, p.endsAt);
      if (match[0] !== "+") continue;
      const formatted = p.number.formatInternational();

      if (stealthMode === 'medium') {
        const ccPrefix = "+" + p.number.countryCallingCode + " ";
        const toReplace = formatted.substring(ccPrefix.length);
        result = result.replaceAll(
          match, ccPrefix + toReplace.replaceAll(/\d/g, '*')
        );
      } else {
        result = result.replaceAll(match, formatted);
      }
    }
    
    return result;
  }, [name, country, stealthMode]);

  // Memoize size calculation
  const Size = useMemo(() => {
    if (metadata?.iccid) {
      return sizeStats.getNumber(metadata?.iccid) || 0;
    }
    return 0;
  }, [metadata?.iccid]);

  // Memoize handlers
  const handleProfilePress = useCallback(() => {
    // @ts-ignore
    navigation.navigate('Profile', {
      iccid: metadata.iccid,
      metadata: metadata,
      deviceId: deviceId,
    });
  }, [navigation, metadata, deviceId]);

  const handleEditPress = useCallback(() => {
    handleProfilePress();
  }, [handleProfilePress]);

  const handleDeletePress = useCallback(() => {
    Alert.alert(
      t('main:profile_delete_profile'),
      t('main:profile_delete_profile_alert_body'), 
      [
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
              t('main:profile_delete_profile_alert2_body'), 
              [
                {
                  text: t('main:profile_delete_tag_ok'),
                  style: 'destructive',
                  onPress: () => {
                    makeLoading(setLoading, async () => {
                      setLoading("Deleting Profile");
                      await adapter.deleteProfileByIccId(metadata.iccid);
                      setLoading("Processing Notifications");
                      await adapter.processNotifications(metadata.iccid);
                      setLoading(false);
                    });
                  }
                },
                {
                  text: t('main:profile_delete_tag_cancel'),
                  onPress: () => {},
                  style: 'cancel',
                },
              ]
            );
          }
        },
      ]
    );
  }, [t, setLoading, adapter, metadata.iccid]);

  const handleSwitchChange = useCallback(async (value2: boolean) => {
    makeLoading(setLoading, async () => {
      if (profile.selected) {
        if (adapter.device.type !== "omapi" || preferences.getString("disableProtection") === 'off') {
          await adapter.disableProfileByIccId(metadata.iccid);
        } else {
          ToastAndroid.show(`Disabling Profile on Android may have unintended effects.`, ToastAndroid.SHORT);
        }
      } else {
        await adapter.enableProfileByIccId(metadata.iccid);
      }
    });
  }, [profile.selected, adapter, metadata.iccid, setLoading]);

  // Memoize display name
  const displayName = useMemo(() => {
    return (stealthMode === 'none' || stealthMode === 'medium') 
      ? replacedName 
      : metadata?.serviceProviderName;
  }, [stealthMode, replacedName, metadata?.serviceProviderName]);

  // Memoize right items for drawer
  const rightItems = useMemo(() => 
    profile.selected ? [] : [{
      customElement: (
        <FontAwesomeIcon icon={faTrash} style={{ color: Colors.$backgroundDefault }} />
      ),
      width: 60,
      background: Colors.red30,
      onPress: handleDeletePress,
    }], 
    [profile.selected, handleDeletePress]
  );

  return (
    <Drawer
      key={`${metadata.iccid}`}
      style={{
        borderRadius: 15,
        overflow: "hidden",
      }}
      rightItems={rightItems}
      leftItem={{
        customElement: (
          <FontAwesomeIcon icon={faPencil} style={{ color: Colors.$backgroundDefault }} />
        ),
        background: Colors.yellow30,
        width: 60,
        onPress: handleEditPress,
      }}
    >
      <Card style={{ backgroundColor: Colors.cardBackground }}>
        <View paddingT-5 paddingL-15 paddingR-10 margin-0 gap-5>
          <View row flex width="100%">
            <TouchableOpacity
              style={{ flexShrink: 1, flexGrow: 1 }}
              onPress={handleProfilePress}
            >
              <View row gap-2>
                <Image
                  style={{
                    width: 20 * PixelRatio.getFontScale(), 
                    height: 20 * PixelRatio.getFontScale()
                  }}
                  source={Flags[country] || Flags.UN}
                />
                <Text marginL-5 text70 $textDefault style={{ marginTop: -2 }}>
                  {displayName}
                </Text>
              </View>
              
              <View row>
                <ProfileSubtitle 
                  metadata={metadata} 
                  mccMnc={mccMnc} 
                  displaySubtitle={displaySubtitle} 
                />
              </View>
              
              <View>
                <ProfileTags tags={tags} stealthMode={stealthMode} />
              </View>
            </TouchableOpacity>
            
            <View
              style={{
                padding: 5, 
                width: 50,
                flexShrink: 0, 
                flexGrow: 0,
              }}
            >
              <Switch
                value={profile.selected}
                disabled={isLoading !== false}
                style={{ marginTop: -5 }}
                padding-5
                onValueChange={handleSwitchChange}
              />
            </View>
            
            {Size > 1536 && (
              <Text 
                text100L 
                $textDefault 
                style={{ position: "absolute", right: 2, bottom: 0 }} 
                numberOfLines={1}
              >
                {formatSize(Size)}
              </Text>
            )}
          </View>
        </View>
        
        <View
          style={{ height: 2, backgroundColor: `hsl(${hueICCID}, 50%, 50%)`}}
        />
      </Card>
    </Drawer>
  );
};
