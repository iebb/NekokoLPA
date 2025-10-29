import {parseMetadata} from "@/utils/parser";
import {findPhoneNumbersInText} from "libphonenumber-js/min";
import {preferences, sizeStats} from "@/utils/mmkv";
import { Drawer } from "react-native-ui-lib";
import { Card, Switch, Text, XStack, YStack, Stack, useTheme } from 'tamagui';
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
  <XStack gap={5} marginVertical={2}>
    {tags.map((t, i) => (
      <XStack
        key={i}
        paddingHorizontal={5}
        borderRadius={5}
        backgroundColor={t.backgroundColor}
      >
        <Text fontSize={10} fontWeight={"500" as any} color={t.color}>
          {stealthMode === 'none' ? t.value : stealthMode === 'medium' ? t.value : '***'}
        </Text>
      </XStack>
    ))}
  </XStack>
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

  // Theme-aware; no direct Appearance usage needed

  return (
    <Text color="$color10" numberOfLines={1} fontSize={11}>
      {subtitleText}
    </Text>
  );
});

export const ProfileRow = ({profile, deviceId} : {profile: ProfileExt, deviceId: string}) => {
  const { t } = useTranslation(['main']);
  const adapter = Adapters[deviceId];
  const { setLoading, isLoading } = useLoading();
  const navigation = useNavigation();
  const theme = useTheme();

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

  // Row surface tone handled via theme token `$surfaceRow`

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
        <FontAwesomeIcon icon={faTrash} style={{ color: (theme.backgroundDefault?.val || '#fff') }} />
      ),
      width: 60,
      background: theme.backgroundDangerHeavy?.val || '#ff6b6b',
      onPress: handleDeletePress,
    }],
    [profile.selected, handleDeletePress, theme.backgroundDefault?.val, theme.backgroundDangerHeavy?.val]
  );

  const primaryColor = useMemo(() => {
    return preferences.getString('themeColor') ?? (useTheme().textPrimary?.val || '#6c5ce7');
  }, []);

  // Unified switch colors (selected vs base). Base tuned for dark theme to be less bright.
  const switchBaseColor = useMemo(() => {
    return (theme.color7?.val || theme.outlineDisabledHeavy?.val || theme.outlineNeutral?.val || '#777');
  }, [theme.color7?.val, theme.outlineDisabledHeavy?.val, theme.outlineNeutral?.val]);

  const switchTrackColor = profile.selected ? primaryColor : switchBaseColor;
  const switchBorderColor = profile.selected ? primaryColor : switchBaseColor;

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
          <FontAwesomeIcon icon={faPencil} style={{ color: (theme.backgroundDefault?.val || '#fff') }} />
        ),
        background: theme.backgroundSuccessLight?.val || '#f3c969',
        width: 60,
        onPress: handleEditPress,
      }}
    >
      <Card backgroundColor="$surfaceRow" padding={0}>
        <YStack paddingTop={5} paddingLeft={15} paddingRight={10} gap={5}>
          <XStack width="100%" alignItems="flex-start">
            <TouchableOpacity
              style={{ flexShrink: 1, flexGrow: 1 }}
              onPress={handleProfilePress}
            >
              <XStack gap={6} alignItems="center">
                <Image
                  style={{
                    width: 20 * PixelRatio.getFontScale(),
                    height: 20 * PixelRatio.getFontScale()
                  }}
                  source={Flags[country] || Flags.UN}
                />
                <Text color="$textDefault" fontSize={16} style={{ marginTop: -2 }} numberOfLines={1}>
                  {displayName}
                </Text>
              </XStack>
              <XStack>
                <ProfileSubtitle
                  metadata={metadata}
                  mccMnc={mccMnc}
                  displaySubtitle={displaySubtitle}
                />
              </XStack>
              <ProfileTags tags={tags} stealthMode={stealthMode} />
            </TouchableOpacity>

            <XStack padding={5} width={50}>
              <Switch
                checked={profile.selected}
                disabled={isLoading !== false}
                size={"$2.5" as any}
                style={{ 
                  marginTop: -5,
                  borderWidth: 0.5,
                  borderColor: switchBorderColor,
                }}
                backgroundColor={switchTrackColor}
                onCheckedChange={(val: boolean) => handleSwitchChange(!!val)}
              >
                <Switch.Thumb 
                  backgroundColor={theme.backgroundDefault?.val || '#ffffff'}
                  style={{ borderWidth: 0.5, borderColor: switchBorderColor }}
                />
              </Switch>
            </XStack>

            {Size > 1536 && (
              <Text
                color="$textNeutral"
                fontSize={10}
                style={{ position: "absolute", right: 2, bottom: 0 }}
                numberOfLines={1}
              >
                {formatSize(Size)}
              </Text>
            )}
          </XStack>
        </YStack>

        <Stack height={2} backgroundColor={`hsl(${hueICCID}, 50%, 50%)`} />
      </Card>
    </Drawer>
  );
};
