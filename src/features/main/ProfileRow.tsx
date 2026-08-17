import {parseMetadata} from '@/shared/utils/parser';
import {findPhoneNumbersInText} from 'libphonenumber-js/min';
import {preferences} from '@/shared/storage';
import {Swipeable} from 'react-native-gesture-handler';
import {Text, useTheme, XStack, YStack} from 'tamagui';
// useTheme covers dynamic color; no need for useColorScheme here
import {Pencil, Trash2} from '@tamagui/lucide-icons';
import {Alert, Image, Pressable, ToastAndroid, TouchableOpacity} from 'react-native';
import {makeLoading} from '@/shared/utils/loading';
import {Flags} from '@/assets/flags';
import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {Profile} from '@/lpa/types/profile';
import {Adapters} from '@/lpa/adapters/registry';
import {useLoading} from '@/app/providers/LoadingProvider';

import {isSimplifiedMode} from '@/shared/config/features';
import {fontSize, radius} from '@/shared/theme/tokens';
import Toggle from '@/shared/ui/Toggle';
import {group, isRedactMode, maskIccid, RedactMode} from '@/shared/utils/redact';

interface ProfileExt extends Profile {
  selected: boolean;
}

// Extracted components
const ProfileTags = React.memo(({tags, stealthMode}: {tags: any[]; stealthMode: string}) => (
  <XStack gap={5} marginVertical={2}>
    {tags.map((t, i) => (
      <XStack
        key={i}
        paddingHorizontal={5}
        borderRadius={radius.xs}
        backgroundColor={t.backgroundColor}>
        <Text fontSize={fontSize.xs} fontWeight={'500' as any} color={t.color}>
          {stealthMode === 'none' ? t.value : stealthMode === 'medium' ? t.value : '***'}
        </Text>
      </XStack>
    ))}
  </XStack>
));

const ProfileSubtitle = React.memo(
  ({
    metadata,
    mccMnc,
    displaySubtitle,
    stealthMode,
  }: {
    metadata: any;
    mccMnc: any;
    displaySubtitle: string;
    stealthMode: RedactMode;
  }) => {
    const subtitleText = useMemo(() => {
      switch (displaySubtitle) {
        case 'provider':
          return `${metadata?.serviceProviderName} / ${metadata?.profileName}`;
        case 'operator':
          return `[${mccMnc.ISO}] ${mccMnc.Operator}`;
        case 'code':
          return `[${mccMnc.ISO}] ${mccMnc.PLMN} ${mccMnc.TADIG}`;
        case 'country':
          return `[${mccMnc.ISO}] ${mccMnc.Country}`;
        case 'iccid':
          return `ICCID: ${group(maskIccid(metadata.iccid, stealthMode))}`;
        default:
          return `${metadata?.serviceProviderName} / ${metadata?.profileName}`;
      }
    }, [metadata, mccMnc, displaySubtitle, stealthMode]);

    // Theme-aware; no direct Appearance usage needed

    return (
      <Text color="$color6" numberOfLines={1} fontSize={fontSize.sm}>
        {subtitleText}
      </Text>
    );
  },
);

const ProfileRowComponent = ({profile, deviceId}: {profile: ProfileExt; deviceId: string}) => {
  const {t} = useTranslation(['main']);
  const adapter = Adapters[deviceId];
  const {setLoading, isLoading} = useLoading();
  const navigation = useNavigation<any>();
  const theme = useTheme();

  const stealthMode = useMemo<RedactMode>(() => {
    const stored = preferences.getString('redactMode');
    return isRedactMode(stored) ? stored : 'none';
  }, []);
  const isSimplified = isSimplifiedMode();

  const displaySubtitle = useMemo(
    () =>
      isSimplified ? 'provider' : preferences.getString('displaySubtitle') ?? 'profileProvider',
    [isSimplified],
  );

  const {tags, name, country, mccMnc} = useMemo(() => parseMetadata(profile, t), [profile, t]);

  const replacedName = useMemo(() => {
    if (!name) return '';
    const phoneNumbers = findPhoneNumbersInText(name, country as any);
    let result = name;
    for (const p of phoneNumbers) {
      if (p.startsAt >= 0 && p.endsAt <= name.length) {
        const match = name.substring(p.startsAt, p.endsAt);
        if (match[0] !== '+') continue;
        const formatted = p.number.formatInternational();
        if (stealthMode === 'medium') {
          const ccPrefix = `+${p.number.countryCallingCode} `;
          const toReplace =
            formatted.length > ccPrefix.length ? formatted.substring(ccPrefix.length) : '';
          result = result.split(match).join(ccPrefix + toReplace.replace(/\d/g, '*')); // Using split/join as replaceAll polyfill
        } else {
          result = result.split(match).join(formatted);
        }
      }
    }
    return result;
  }, [name, country, stealthMode]);


  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile', {iccid: profile.iccid, metadata: profile, deviceId});
  }, [navigation, profile, deviceId]);

  const handleDeletePress = useCallback(() => {
    Alert.alert(t('main:profile_delete_profile'), t('main:profile_delete_profile_alert_body'), [
      {text: t('main:profile_delete_tag_cancel'), style: 'cancel'},
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
                    setLoading('Deleting Profile');
                    await adapter.deleteProfileByIccId(profile.iccid);
                    setLoading('Loading Notifications');
                    await adapter.processNotifications(profile.iccid);
                    setLoading(false);
                  });
                },
              },
              {text: t('main:profile_delete_tag_cancel'), style: 'cancel'},
            ],
          );
        },
      },
    ]);
  }, [t, setLoading, adapter, profile.iccid]);

  const handleSwitchChange = useCallback(async () => {
    const isOMAPI = adapter.device.type === 'omapi';
    const protectionEnabled = isSimplified || preferences.getString('disableProtection') !== 'off';

    makeLoading(setLoading, async () => {
      if (profile.selected) {
        if (!isOMAPI || !protectionEnabled) {
          await adapter.disableProfileByIccId(profile.iccid);
        } else {
          ToastAndroid.show(
            `Disabling Profile on Android may have unintended effects.`,
            ToastAndroid.SHORT,
          );
        }
      } else {
        await adapter.enableProfileByIccId(profile.iccid);
      }
    });
  }, [profile.selected, adapter, profile.iccid, setLoading, isSimplified]);

  const displayName = useMemo(
    () =>
      stealthMode === 'none' || stealthMode === 'medium'
        ? replacedName
        : profile?.serviceProviderName,
    [stealthMode, replacedName, profile?.serviceProviderName],
  );

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
          backgroundColor: theme.backgroundDangerHeavy?.val,
          borderTopRightRadius: 12,
          borderBottomRightRadius: 12,
        }}>
        <Trash2 size={18} color={theme.onFilled?.val} />
      </TouchableOpacity>
    );
  }, [handleDeletePress, profile.selected, theme.backgroundDangerHeavy?.val, theme.onFilled?.val]);

  const renderLeftActions = useCallback(
    () => (
      <TouchableOpacity
        onPress={handleProfilePress}
        activeOpacity={0.8}
        style={{
          width: 60,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.backgroundSuccessLight?.val,
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
        }}>
        <Pencil size={18} color={theme.onFilled?.val} />
      </TouchableOpacity>
    ),
    [handleProfilePress, theme.backgroundSuccessLight?.val, theme.onFilled?.val],
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      overshootFriction={8}
      friction={2}
      containerStyle={{backgroundColor: theme.surfaceRow?.val}}>
      {/* One row of the profile group. The rounded card, drop shadow and
          per-profile hue stripe are gone: rank now comes from the group's
          hairlines and from the accent, which marks the active profile only. */}
      <YStack backgroundColor="$surfaceRow" paddingHorizontal={14} paddingVertical={14}>
        <XStack width="100%" alignItems="center" gap={11}>
          <YStack
            width={32}
            height={32}
            borderRadius={radius.sm}
            backgroundColor="$surfaceSpecial"
            alignItems="center"
            justifyContent="center"
            overflow="hidden">
            <Image
              style={{width: 21, height: 14, borderRadius: 2}}
              source={Flags[country] || Flags.UN}
            />
          </YStack>

          <Pressable style={{flex: 1}} onPress={handleProfilePress}>
            <YStack gap={3}>
              {/* A dot, not a pill. The uppercase mono badge grew with the
                  type scale into a block that outweighed the profile name it
                  was annotating; a dot states the same thing quietly, and the
                  switch on the right already carries the detail. */}
              <XStack alignItems="center" gap={8}>
                {profile.selected && (
                  <YStack
                    width={8}
                    height={8}
                    borderRadius={radius.pill}
                    backgroundColor="$primaryColor"
                  />
                )}
                <Text
                  color="$textDefault"
                  fontSize={fontSize.xl}
                  fontWeight={'600' as any}
                  numberOfLines={1}
                  flexShrink={1}>
                  {displayName}
                </Text>
              </XStack>
              <ProfileSubtitle
                metadata={profile}
                mccMnc={mccMnc}
                displaySubtitle={displaySubtitle}
                stealthMode={stealthMode}
              />
              <ProfileTags tags={tags} stealthMode={stealthMode} />
            </YStack>
          </Pressable>

          <Toggle
            value={profile.selected}
            disabled={isLoading}
            onPress={handleSwitchChange}
          />
        </XStack>
      </YStack>
    </Swipeable>
  );
};

export const ProfileRow = React.memo(
  ProfileRowComponent,
  (prevProps, nextProps) =>
    prevProps.profile.iccid === nextProps.profile.iccid &&
    prevProps.profile.profileState === nextProps.profile.profileState &&
    prevProps.profile.profileNickname === nextProps.profile.profileNickname &&
    prevProps.deviceId === nextProps.deviceId,
);
