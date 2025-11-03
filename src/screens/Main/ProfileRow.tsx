import {parseMetadata} from "@/utils/parser";
import {findPhoneNumbersInText} from "libphonenumber-js/min";
import {preferences, sizeStats} from "@/utils/mmkv";
import {Swipeable} from 'react-native-gesture-handler';
import {Card, Stack, Switch, Text, useTheme, XStack, YStack} from 'tamagui';
// useTheme covers dynamic color; no need for useColorScheme here
import {Pencil, Trash2, GripVertical} from '@tamagui/lucide-icons';
import {Alert, Image, PixelRatio, Pressable, ToastAndroid, TouchableOpacity, View} from "react-native";
import {makeLoading} from "@/components/utils/loading";
import {Flags} from "@/assets/flags";
import {formatSize} from "@/utils/size";
import React, {useCallback, useMemo} from "react";
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
    <Text color="$color10" numberOfLines={1} fontSize={11}>
      {subtitleText}
    </Text>
  );
});

const ProfileRowComponent = ({profile, deviceId, drag, isActive = false, press, rearrangeMode = false} : {profile: ProfileExt, deviceId: string, drag: any, isActive?: boolean, press?: (pressed: boolean) => void, rearrangeMode?: boolean}) => {
  const { t } = useTranslation(['main']);
  const adapter = Adapters[deviceId];
  const { setLoading, isLoading } = useLoading();
  const navigation = useNavigation<any>();
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
  const { tags, name, country, mccMnc, order } = useMemo(() =>
    parseMetadata(metadata, t),
    [metadata, t]
  );

  // Memoize ICCID calculations
  const { numICCID, hueICCID } = useMemo(() => {
    const iccid = String(metadata?.iccid ?? "");
    const numICCID = iccid.replaceAll(/\D/g, '');
    const hueICCID = numICCID.length >= 7
      ? (parseInt(numICCID.substring(numICCID.length - 7), 10) * 17.84) % 360
      : 0;
    return { numICCID, hueICCID };
  }, [metadata?.iccid]);

  // Memoize phone number processing
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
          const ccPrefix = "+" + p.number.countryCallingCode + " ";
          const toReplace = formatted.length > ccPrefix.length
            ? formatted.substring(ccPrefix.length)
            : "";
          result = result.replaceAll(
            match, ccPrefix + toReplace.replaceAll(/\d/g, '*')
          );
        } else {
          result = result.replaceAll(match, formatted);
        }
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
    // Disable navigation in rearrange mode
    if (rearrangeMode) return;
    // @ts-ignore
    navigation.navigate('Profile', {
      iccid: metadata.iccid,
      metadata: metadata,
      deviceId: deviceId,
    });
  }, [navigation, metadata, deviceId, rearrangeMode]);

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
                      setLoading("Loading Notifications");
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

  const renderRightActions = useCallback(() => {
    if (profile.selected) return null;
    return (
      <TouchableOpacity
        onPress={handleDeletePress}
        activeOpacity={0.8}
        style={{
          width: 60,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: (theme.backgroundDangerHeavy?.val || '#ff6b6b'),
          borderTopRightRadius: 12,
          borderBottomRightRadius: 12,
        }}
      >
        <Trash2 size={18} color={theme.backgroundDefault?.val || '#fff'} />
      </TouchableOpacity>
    );
  }, [handleDeletePress, profile.selected, theme.backgroundDangerHeavy?.val, theme.backgroundDefault?.val]);

  const renderLeftActions = useCallback(() => (
    <TouchableOpacity
      onPress={handleEditPress}
      activeOpacity={0.8}
      style={{
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: (theme.backgroundSuccessLight?.val || '#f3c969'),
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
      }}
    >
      <Pencil size={18} color={theme.backgroundDefault?.val || '#fff'} />
    </TouchableOpacity>
  ), [handleEditPress, theme.backgroundSuccessLight?.val, theme.backgroundDefault?.val]);

  // Use tamagui theme token directly (updates on theme change)
  const primaryColor = theme.buttonBackground?.val || theme.accentColor?.val;

  // Unified switch colors (selected vs base). Base tuned for dark theme to be less bright.
  const switchBaseColor = theme.color7?.val;

  const switchTrackColor = profile.selected ? primaryColor : switchBaseColor;
  const switchBorderColor = profile.selected ? primaryColor : switchBaseColor;

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      overshootFriction={8}
      friction={2}
      enabled={!isActive && !rearrangeMode}
    >
      <Card
        backgroundColor={isActive ? (theme.surfaceHover?.val || theme.color2?.val || '#1a1a1f') : '$surfaceSpecial'}
        borderWidth={0}
        borderRadius={12}
        overflow="hidden"
        padding={0}
        opacity={isActive ? 0.95 : 1}
        style={{
          transform: [{ scale: isActive ? 1.02 : 1 }],
          shadowColor: isActive ? (primaryColor || theme.accentColor?.val || '#a575f6') : 'transparent',
          shadowOffset: isActive ? { width: 0, height: 4 } : { width: 0, height: 0 },
          shadowOpacity: isActive ? 0.3 : 0,
          shadowRadius: isActive ? 8 : 0,
          elevation: isActive ? 8 : 0,
        }}
      >
        <YStack paddingTop={5} paddingLeft={rearrangeMode ? 0 : 15} paddingRight={15} gap={5}>
          <XStack width="100%" alignItems="flex-start" gap={8}>
            {rearrangeMode && (
              <TouchableOpacity
                onLongPress={drag}
                onPressIn={() => press?.(true)}
                onPressOut={() => press?.(false)}
                delayLongPress={100}
                style={{ padding: 8 }}
                activeOpacity={0.6}
              >
                <GripVertical size={18} color={theme.color10?.val || '#888'} />
              </TouchableOpacity>
            )}

            {/* Main content - scrollable area, no drag interference */}
            <Pressable
              style={{ flexShrink: 1, flexGrow: 1 }}
              onPress={handleProfilePress}
              delayLongPress={10000}
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
            </Pressable>

            <XStack padding={5} width={50}>
              <Switch
                checked={profile.selected}
                disabled={isLoading}
                size={"$2.5" as any}
                style={{
                  marginTop: -4,
                  borderWidth: 0.5,
                  borderColor: switchBorderColor,
                }}
                backgroundColor={switchTrackColor}
                onCheckedChange={(val: boolean) => handleSwitchChange(val)}
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

        {/* Underline inside the card to avoid overflow past rounded corners */}
        <Stack height={2} width="100%" backgroundColor={`hsl(${hueICCID}, 50%, 50%)`} />
      </Card>
    </Swipeable>
  );
};

// Memoize ProfileRow to prevent unnecessary re-renders when rearrangeMode changes
export const ProfileRow = React.memo(ProfileRowComponent, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.profile.iccid === nextProps.profile.iccid &&
    prevProps.profile.profileState === nextProps.profile.profileState &&
    prevProps.profile.profileNickname === nextProps.profile.profileNickname &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.rearrangeMode === nextProps.rearrangeMode &&
    prevProps.deviceId === nextProps.deviceId
  );
});
