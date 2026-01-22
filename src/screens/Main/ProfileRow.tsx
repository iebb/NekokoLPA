import { parseMetadata } from "@/utils/parser";
import { findPhoneNumbersInText } from "libphonenumber-js/min";
import { preferences } from "@/utils/mmkv";
import { Swipeable } from 'react-native-gesture-handler';
import { Card, Stack, Switch, Text, useTheme, XStack, YStack } from 'tamagui';
// useTheme covers dynamic color; no need for useColorScheme here
import { Pencil, Trash2 } from '@tamagui/lucide-icons';
import { Alert, Image, PixelRatio, Pressable, ToastAndroid, TouchableOpacity } from "react-native";
import { makeLoading } from "@/components/utils/loading";
import { Flags } from "@/assets/flags";
import { formatSize, getEstimatedProfileSize, getExactProfileSize } from "@/utils/size";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { Profile } from "@/native/types";
import { Adapters } from "@/native/adapters/registry";
import { useLoading } from "@/components/common/LoadingProvider";
import { useSelector } from "react-redux";
import { selectDeviceState } from "@/redux/stateStore";

import { isSimplifiedMode } from "@/utils/featureConfig";

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
        borderRadius={4}
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
    <Text color="$color6" numberOfLines={1} fontSize={12}>
      {subtitleText}
    </Text>
  );
});

const ProfileRowComponent = ({ profile, deviceId }: { profile: ProfileExt, deviceId: string }) => {
  const { t } = useTranslation(['main']);
  const adapter = Adapters[deviceId];
  const { setLoading, isLoading } = useLoading();
  const navigation = useNavigation<any>();
  const theme = useTheme();

  const DeviceState = useSelector(selectDeviceState(deviceId));
  const eid = DeviceState?.eid || "";

  const stealthMode = useMemo(() => preferences.getString("redactMode") ?? "none", []);
  const isSimplified = isSimplifiedMode();

  const displaySubtitle = useMemo(() =>
    isSimplified ? "provider" : (preferences.getString("displaySubtitle") ?? "profileProvider"),
    [isSimplified]);

  const { tags, name, country, mccMnc } = useMemo(() => parseMetadata(profile, t), [profile, t]);

  const { hueICCID } = useMemo(() => {
    const iccid = String(profile?.iccid ?? "");
    const numICCID = iccid.replace(/\D/g, ''); // Using replace for better compatibility
    const hue = numICCID.length >= 7 ? (parseInt(numICCID.substring(numICCID.length - 7), 10) * 17.84) % 360 : 0;
    return { hueICCID: hue };
  }, [profile?.iccid]);

  const replacedName = useMemo(() => {
    if (!name) return "";
    const phoneNumbers = findPhoneNumbersInText(name, country as any);
    let result = name;
    for (const p of phoneNumbers) {
      if (p.startsAt >= 0 && p.endsAt <= name.length) {
        const match = name.substring(p.startsAt, p.endsAt);
        if (match[0] !== "+") continue;
        const formatted = p.number.formatInternational();
        if (stealthMode === 'medium') {
          const ccPrefix = `+${p.number.countryCallingCode} `;
          const toReplace = formatted.length > ccPrefix.length ? formatted.substring(ccPrefix.length) : "";
          result = result.split(match).join(ccPrefix + toReplace.replace(/\d/g, '*')); // Using split/join as replaceAll polyfill
        } else {
          result = result.split(match).join(formatted);
        }
      }
    }
    return result;
  }, [name, country, stealthMode]);

  const Size = useMemo(() => getExactProfileSize(profile.iccid || ""), [profile.iccid]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile', { iccid: profile.iccid, metadata: profile, deviceId });
  }, [navigation, profile, deviceId]);

  const handleDeletePress = useCallback(() => {
    Alert.alert(t('main:profile_delete_profile'), t('main:profile_delete_profile_alert_body'), [
      { text: t('main:profile_delete_tag_cancel'), style: 'cancel' },
      {
        text: t('main:profile_delete_tag_ok'), style: 'destructive', onPress: () => {
          Alert.alert(t('main:profile_delete_profile_alert2'), t('main:profile_delete_profile_alert2_body'), [
            {
              text: t('main:profile_delete_tag_ok'), style: 'destructive', onPress: () => {
                makeLoading(setLoading, async () => {
                  setLoading("Deleting Profile");
                  await adapter.deleteProfileByIccId(profile.iccid);
                  setLoading("Loading Notifications");
                  await adapter.processNotifications(profile.iccid);
                  setLoading(false);
                });
              }
            },
            { text: t('main:profile_delete_tag_cancel'), style: 'cancel' },
          ]);
        }
      }
    ]);
  }, [t, setLoading, adapter, profile.iccid]);

  const handleSwitchChange = useCallback(async () => {
    const isOMAPI = adapter.device.type === "omapi";
    const protectionEnabled = isSimplified || preferences.getString("disableProtection") !== 'off';

    makeLoading(setLoading, async () => {
      if (profile.selected) {
        if (!isOMAPI || !protectionEnabled) {
          await adapter.disableProfileByIccId(profile.iccid);
        } else {
          ToastAndroid.show(`Disabling Profile on Android may have unintended effects.`, ToastAndroid.SHORT);
        }
      } else {
        await adapter.enableProfileByIccId(profile.iccid);
      }
    });
  }, [profile.selected, adapter, profile.iccid, setLoading, isSimplified]);

  const displayName = useMemo(() => (stealthMode === 'none' || stealthMode === 'medium') ? replacedName : profile?.serviceProviderName, [stealthMode, replacedName, profile?.serviceProviderName]);

  const renderRightActions = useCallback(() => {
    if (profile.selected) return null;
    return (
      <TouchableOpacity onPress={handleDeletePress} activeOpacity={0.8} style={{
        width: 60, justifyContent: 'center', alignItems: 'center',
        backgroundColor: (theme.backgroundDangerHeavy?.val || '#ff6b6b'),
        borderTopRightRadius: 12, borderBottomRightRadius: 12,
      }}>
        <Trash2 size={18} color={theme.backgroundDefault?.val || '#fff'} />
      </TouchableOpacity>
    );
  }, [handleDeletePress, profile.selected, theme.backgroundDangerHeavy?.val, theme.backgroundDefault?.val]);

  const renderLeftActions = useCallback(() => (
    <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.8} style={{
      width: 60, justifyContent: 'center', alignItems: 'center',
      backgroundColor: (theme.backgroundSuccessLight?.val || '#f3c969'),
      borderTopLeftRadius: 12, borderBottomLeftRadius: 12,
    }}>
      <Pencil size={18} color={theme.backgroundDefault?.val || '#fff'} />
    </TouchableOpacity>
  ), [handleProfilePress, theme.backgroundSuccessLight?.val, theme.backgroundDefault?.val]);

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      overshootFriction={8}
      friction={2}
      containerStyle={{
        borderRadius: 12,
        backgroundColor: theme.surfaceSpecial?.val
      }}
    >
      <Card
        backgroundColor="$surfaceSpecial"
        borderWidth={0}
        borderRadius={12}
        overflow="hidden"
        paddingTop={4}
        elevation={2}
      >
        <YStack paddingHorizontal={12}>
          <XStack width="100%" alignItems="center" gap={10}>
            {/* Flag and Main Info */}
            <Pressable style={{ flex: 1 }} onPress={handleProfilePress}>
              <YStack gap={3}>
                <XStack alignItems="center">
                  <Image
                    style={{
                      width: 22.5 * PixelRatio.getFontScale(),
                      height: 15 * PixelRatio.getFontScale(),
                      marginRight: 7.5,
                      borderRadius: 2
                    }}
                    source={Flags[country] || Flags.UN}
                  />
                  <Text
                    color="$textDefault"
                    fontSize={17}
                    fontWeight="600"
                    numberOfLines={1}
                    flex={1}
                  >
                    {displayName}
                  </Text>
                </XStack>
                <ProfileSubtitle metadata={profile} mccMnc={mccMnc} displaySubtitle={displaySubtitle} />
              </YStack>
            </Pressable>

            {/* Switch Control */}
            <XStack alignItems="center" gap={10}>
              {Size > 1536 && (
                <Text color="$color8" fontSize={11} fontWeight="500">
                  {formatSize(Size)}
                </Text>
              )}
              <Switch
                checked={profile.selected}
                disabled={isLoading}
                size={"$2.5" as any}
                onCheckedChange={handleSwitchChange}
                borderColor={profile.selected ? "$primaryColor" : "$color6"}
                backgroundColor={profile.selected ? "$primaryColor" : "$color6"}
              >
                <Switch.Thumb backgroundColor="$backgroundDefault" elevation={2} />
              </Switch>
            </XStack>
          </XStack>

          <ProfileTags tags={tags} stealthMode={stealthMode} />
        </YStack>

        {/* Status indicator bar */}
        <YStack height={2} width="100%" position="relative">
          <YStack
            fullscreen
            backgroundColor={`hsl(${hueICCID}, 70%, 50%)`}
            opacity={0.3}
          />
          <YStack
            height="100%"
            width="100%"
            backgroundColor={`hsl(${hueICCID}, 80%, 50%)`}
            borderRadius={999}
          />
        </YStack>
      </Card>
    </Swipeable>
  );
};

export const ProfileRow = React.memo(ProfileRowComponent, (prevProps, nextProps) => (
  prevProps.profile.iccid === nextProps.profile.iccid &&
  prevProps.profile.profileState === nextProps.profile.profileState &&
  prevProps.profile.profileNickname === nextProps.profile.profileNickname &&
  prevProps.deviceId === nextProps.deviceId
));

