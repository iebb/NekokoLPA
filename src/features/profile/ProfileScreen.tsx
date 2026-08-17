import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Image, Platform, ToastAndroid, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';
import Screen from '@/shared/ui/Screen';
import type {RootScreenProps} from '@/app/navigation/types';
import {Button as TButton, Input, Text as TText, useTheme, XStack, YStack} from 'tamagui';
import AppSheet from '@/shared/ui/AppSheet';
import DatePicker from '@/shared/ui/DatePicker';
import {useSelector} from 'react-redux';
import {Copy, X} from '@tamagui/lucide-icons';
import Clipboard from '@react-native-clipboard/clipboard';
import {dateToDate6, parseMetadata, Tag} from '@/shared/utils/parser';
import {resolveMccMnc, T_PLMN} from '@/data/mccMncResolver';
import {Flags} from '@/assets/flags';
import {makeLoading} from '@/shared/utils/loading';
import {Adapters} from '@/lpa/adapters/registry';
import {selectDeviceState} from '@/store';
import {getUTF8Length} from '@/shared/utils/encoding';
import {useLoading} from '@/app/providers/LoadingProvider';
import {fontSize, radius, tracking} from '@/shared/theme/tokens';
import SectionLabel from '@/shared/ui/SectionLabel';

// Metadata Row Component
function MetadataRow({
  label,
  value,
  theme,
  flag,
  onCopy,
}: {
  label: string;
  value?: string;
  theme: any;
  flag?: any;
  onCopy?: (value: string) => void;
}) {
  return (
    <TouchableOpacity onPress={() => value && onCopy?.(value)} activeOpacity={0.7}>
      <YStack paddingVertical={10}>
        <XStack alignItems="center" justifyContent="space-between" gap={12}>
          <TText color="$color6" fontSize={fontSize.sm} style={{minWidth: 100, flexShrink: 0}}>
            {label}
          </TText>
          <XStack alignItems="center" gap={8} flex={1} flexShrink={1}>
            <TText
              color="$textDefault"
              fontSize={fontSize.md}
              fontWeight="600"
              flex={1}
              numberOfLines={1}
              style={{textAlign: 'right'}}>
              {value || '[empty]'}
            </TText>
            {flag && <Image style={{width: 18, height: 18}} source={flag} />}
            {value && <Copy size={12} color={theme.color6?.val} />}
          </XStack>
        </XStack>
      </YStack>
    </TouchableOpacity>
  );
}

function Profile({route, navigation}: RootScreenProps<'Profile'>) {
  const theme = useTheme();
  const {t} = useTranslation(['main']);
  const {deviceId, iccid} = route.params;

  const adapter = Adapters[deviceId];

  const [tags, setTags] = useState<Tag[]>([]);
  const {isLoading, setLoading} = useLoading();
  const [nickname, setNickname] = useState('');
  const [country, setCountry] = useState('');
  const [resolvedMccMnc, setResolvedMccMnc] = useState<T_PLMN | undefined>();

  const [tagModal, setTagModal] = useState<boolean>(false);
  const [renameModal, setRenameModal] = useState<boolean>(false);
  const [newTagType, setNewTagType] = useState('date');
  const [tagValue, setTagValue] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const DeviceState = useSelector(selectDeviceState(deviceId));
  const metadata = DeviceState?.profiles?.find(m => m.iccid === iccid);

  /** profileState 1 is the enabled profile; only one can be enabled at a time. */
  const isEnabled = metadata?.profileState === 1;

  const handleToggleEnabled = useCallback(() => {
    makeLoading(setLoading, async () => {
      if (isEnabled) {
        await adapter.disableProfileByIccId(iccid);
      } else {
        await adapter.enableProfileByIccId(iccid);
      }
    });
  }, [isEnabled, adapter, iccid, setLoading]);

  useEffect(() => {
    if (metadata) {
      const {tags, name, country} = parseMetadata(metadata, t, false);
      setTags(tags as any);
      setNickname(name);
      setCountry(country);
      if (metadata.profileOwnerMccMnc) {
        setResolvedMccMnc(resolveMccMnc(metadata.profileOwnerMccMnc));
      }
    }
  }, [metadata, t]);

  const tagChars = tags.length ? ' ' + tags.map(t => t.rawValue).join(' ') : '';

  const updateNickname = (n: string) => {
    makeLoading(setLoading, async () => {
      await adapter.setNicknameByIccId(iccid, n);
    });
  };

  const handleCopy = (value: string) => {
    if (Platform.OS === 'android' && value) {
      Clipboard.setString(value);
      ToastAndroid.show('Copied', ToastAndroid.SHORT);
    }
  };

  if (!metadata) {
    return null;
  }

  return (
    <Screen
      keyboardAvoiding={false}
      scrollViewProps={{nestedScrollEnabled: true}}>
      <AppSheet open={tagModal} onOpenChange={setTagModal} title={t('main:profile_add_tag')}>
        <YStack gap={16}>
          {/* Toggle group */}
          <XStack alignItems="center" gap={12}>
            <TText color="$textDefault" fontSize={fontSize.lg}>
              {t('main:profile_add_tag_type')}:
            </TText>
            <XStack gap={8}>
              <TButton
                onPress={() => {
                  setNewTagType('date');
                  setTagValue(`d:${dateToDate6(selectedDate)}`);
                }}
                backgroundColor={newTagType === 'date' ? theme.primaryColor?.val : 'transparent'}
                borderWidth={1}
                borderColor={
                  newTagType === 'date' ? theme.primaryColor?.val : theme.outlineNeutral?.val
                }
                paddingHorizontal={12}
                paddingVertical={8}
                borderRadius={radius.sm}>
                <TText
                  color={newTagType === 'date' ? theme.background?.val : theme.textDefault?.val}
                  fontSize={fontSize.md}>
                  {t('main:profile_tags_date')}
                </TText>
              </TButton>
              <TButton
                onPress={() => {
                  setNewTagType('text');
                  setTagValue('');
                }}
                backgroundColor={newTagType === 'text' ? theme.primaryColor?.val : 'transparent'}
                borderWidth={1}
                borderColor={
                  newTagType === 'text' ? theme.primaryColor?.val : theme.outlineNeutral?.val
                }
                paddingHorizontal={12}
                paddingVertical={8}
                borderRadius={radius.sm}>
                <TText
                  color={newTagType === 'text' ? theme.background?.val : theme.textDefault?.val}
                  fontSize={fontSize.md}>
                  {t('main:profile_tags_text')}
                </TText>
              </TButton>
            </XStack>
          </XStack>

          {/* Input area */}
          <YStack gap={12}>
            {newTagType === 'date' ? (
              <DatePicker
                value={selectedDate}
                onChange={date => {
                  setSelectedDate(date);
                  setTagValue(`d:${dateToDate6(date)}`);
                }}
                locale={i18n.language}
              />
            ) : newTagType === 'text' ? (
              <Input
                placeholder={t('main:profile_tags_text_placeholder')}
                onChangeText={c => {
                  const cleaned = c.replace(/\s+/g, '');
                  setTagValue(`t:${cleaned}`);
                }}
                paddingHorizontal={12}
                paddingVertical={10}
                borderRadius={radius.sm}
                borderWidth={1}
                borderColor={theme.outlineNeutral?.val || theme.borderColor?.val}
                backgroundColor="transparent"
                color={theme.textDefault?.val}
                placeholderTextColor={theme.color6?.val}
                fontSize={fontSize.lg}
              />
            ) : null}
          </YStack>
          <XStack justifyContent="flex-end" marginTop={8}>
            <TButton
              onPress={() => {
                if (tagValue.length) {
                  updateNickname(nickname + tagChars + ' ' + tagValue);
                  setTagValue('');
                }
                setTagModal(false);
              }}
              backgroundColor="$btnBackground">
              <TText color={theme.background?.val} fontSize={fontSize.lg}>
                Save
              </TText>
            </TButton>
          </XStack>
        </YStack>
      </AppSheet>
      {/* Rename Profile Sheet */}
      <AppSheet
        open={renameModal}
        onOpenChange={setRenameModal}
        title={t('main:profile_rename_profile')}>
        <YStack gap={12}>
          <Input
            placeholder={t('main:profile_rename_profile')}
            value={nickname}
            onChangeText={c => setNickname(c)}
            borderWidth={1}
            borderRadius={radius.sm}
            borderColor={theme.outlineNeutral?.val || theme.borderColor?.val}
            backgroundColor="transparent"
            color={theme.textDefault?.val}
            placeholderTextColor={theme.color6?.val}
            fontSize={fontSize.lg}
            paddingHorizontal={12}
            paddingVertical={10}
          />
          <XStack justifyContent="space-between" alignItems="center">
            <TText color="$color6" fontSize={fontSize.xs}>{`${getUTF8Length(
              nickname + tagChars,
            )}/64`}</TText>
            <TButton
              disabled={isLoading}
              onPress={() => {
                updateNickname(nickname + tagChars);
                setRenameModal(false);
              }}
              backgroundColor="$btnBackground">
              <TText color={theme.background?.val} fontSize={fontSize.md}>
                Save
              </TText>
            </TButton>
          </XStack>
        </YStack>
      </AppSheet>
      <YStack gap={20} flex={1}>
        {/* The profile's identity, then its state, then the two actions that
            change it. The name is the screen's title — a generic "Profile
            detail" heading above it said nothing and pushed the actual subject
            down the page. */}
        <YStack gap={14}>
          <YStack gap={8}>
            <XStack gap={10} alignItems="center">
              <Image style={{width: 30, height: 20, borderRadius: 3}} source={Flags[country] || Flags.UN} />
              <TouchableOpacity
                style={{flex: 1}}
                onPress={() => {
                  if (nickname && Platform.OS === 'android') {
                    Clipboard.setString(nickname);
                    ToastAndroid.show('Copied', ToastAndroid.SHORT);
                  }
                }}>
                <TText
                  color="$textDefault"
                  fontSize={fontSize.display}
                  fontWeight={'700' as any}
                  letterSpacing={tracking.title}
                  numberOfLines={1}
                  adjustsFontSizeToFit>
                  {nickname}
                </TText>
              </TouchableOpacity>
            </XStack>

            <XStack alignItems="center" gap={8}>
              <YStack
                width={8}
                height={8}
                borderRadius={radius.pill}
                backgroundColor={isEnabled ? '$backgroundSuccessHeavy' : '$color9'}
              />
              <TText color="$color6" fontSize={fontSize.md}>
                {isEnabled ? t('main:profile_state_enabled') : t('main:profile_state_disabled')}
              </TText>
            </XStack>
          </YStack>

          <XStack gap={10}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: isEnabled ? theme.surfaceSpecial?.val : theme.primaryColor?.val,
                borderRadius: radius.md,
                paddingVertical: 13,
                alignItems: 'center',
              }}
              onPress={handleToggleEnabled}>
              <TText
                color={isEnabled ? '$textDefault' : theme.onFilled?.val}
                fontSize={fontSize.lg}
                fontWeight={'600' as any}>
                {isEnabled ? t('main:profile_ui_disable') : t('main:profile_ui_enable')}
              </TText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: theme.borderColor?.val,
                backgroundColor: theme.surfaceRow?.val,
                borderRadius: radius.md,
                paddingVertical: 13,
                alignItems: 'center',
              }}
              onPress={() => setRenameModal(true)}>
              <TText color="$textDefault" fontSize={fontSize.lg} fontWeight={'500' as any}>
                {t('main:profile_ui_rename')}
              </TText>
            </TouchableOpacity>
          </XStack>
        </YStack>

        {/* Tags Section */}
        <YStack gap={10}>
          <YStack paddingLeft={4}>
            <SectionLabel>{t('main:profile_tags')}</SectionLabel>
          </YStack>
          <YStack backgroundColor="$surfaceRow" borderWidth={1} borderColor="$borderColor" borderRadius={radius.lg} padding={12}>
            <XStack gap={8} flexWrap="wrap">
              {tags.map((tag, i) => {
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() =>
                      Alert.alert(
                        t('main:profile_delete_tag'),
                        t('main:profile_delete_tag_alert', {tag: tag.value}),
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
                              updateNickname(
                                (
                                  nickname +
                                  ' ' +
                                  tags
                                    .filter(tag_ => tag_.value !== tag.value)
                                    .map(tag => tag.rawValue)
                                    .join(' ')
                                ).trimEnd(),
                              );
                            },
                          },
                        ],
                      )
                    }>
                    <XStack
                      alignItems="center"
                      borderWidth={1}
                      borderColor={theme.outlineNeutral?.val}
                      backgroundColor={tag.backgroundColor}
                      paddingHorizontal={10}
                      paddingVertical={6}
                      borderRadius={radius.pill}
                      gap={6}>
                      <TText color={tag.color} fontSize={fontSize.md} fontWeight="500">
                        {tag.value}
                      </TText>
                      <X size={10} color={tag.color} />
                    </XStack>
                  </TouchableOpacity>
                );
              })}
            </XStack>
            <XStack justifyContent="flex-end" marginTop={8}>
              <TButton
                onPress={() => setTagModal(true)}
                backgroundColor="$btnBackground"
                borderRadius={radius.sm}
                height={32}
                paddingHorizontal={10}>
                <TText color={theme.background?.val} fontSize={fontSize.md}>
                  Add tag
                </TText>
              </TButton>
            </XStack>
          </YStack>
        </YStack>

        {/* Rename Section */}
        {/* Rename handled via sheet */}

        {/* Metadata Section */}
        <YStack gap={8}>
          <YStack paddingLeft={4}>
            <SectionLabel>{t('main:profile_information')}</SectionLabel>
          </YStack>
          <YStack backgroundColor="$surfaceRow" borderWidth={1} borderColor="$borderColor" borderRadius={radius.lg} padding={16} gap={10}>
            {metadata && (
              <>
                {metadata.iccid && (
                  <MetadataRow
                    label={t('main:profile_iccid')}
                    value={metadata.iccid}
                    theme={theme}
                    onCopy={handleCopy}
                  />
                )}
                {metadata.profileName && (
                  <MetadataRow
                    label={t('main:profile_name')}
                    value={metadata.profileName}
                    theme={theme}
                    onCopy={handleCopy}
                  />
                )}
                {metadata.serviceProviderName && (
                  <MetadataRow
                    label={t('main:profile_provider')}
                    value={metadata.serviceProviderName}
                    theme={theme}
                    onCopy={handleCopy}
                  />
                )}
                {metadata.profileOwnerMccMnc && (
                  <MetadataRow
                    label={t('main:profile_plmn')}
                    value={metadata.profileOwnerMccMnc.replaceAll('F', ' ')}
                    theme={theme}
                    onCopy={handleCopy}
                  />
                )}
                {resolvedMccMnc && (
                  <>
                    <MetadataRow
                      label={t('main:profile_country')}
                      value={resolvedMccMnc.Country}
                      theme={theme}
                      flag={Flags[resolvedMccMnc?.ISO1 || 'UN'] || Flags.UN}
                      onCopy={handleCopy}
                    />
                    {resolvedMccMnc.Operator && (
                      <MetadataRow
                        label={t('main:profile_operator')}
                        value={resolvedMccMnc.Operator}
                        theme={theme}
                        onCopy={handleCopy}
                      />
                    )}
                    {resolvedMccMnc.Brand && (
                      <MetadataRow
                        label={t('main:profile_brand')}
                        value={resolvedMccMnc.Brand}
                        theme={theme}
                        onCopy={handleCopy}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </YStack>
        </YStack>

        {/* Delete Profile Section */}
        {metadata.profileState === 0 && (
          <YStack marginTop={20}>
            <TButton
              backgroundColor="transparent"
              onPress={() =>
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
                                // makeLoading calls its first argument twice —
                                // once with true up front, once with false when
                                // the work resolves. Passing the navigation in
                                // there popped the screen before the delete even
                                // started, left no loader on screen during it,
                                // and then fired a second GO_BACK with nothing
                                // left to pop ("not handled by any navigator").
                                makeLoading(setLoading, async () => {
                                  await adapter.deleteProfileByIccId(iccid);
                                  await adapter.processNotifications(iccid);
                                  navigation.goBack();
                                });
                              },
                            },
                            {
                              text: t('main:profile_delete_tag_cancel'),
                              onPress: () => {},
                              style: 'cancel',
                            },
                          ],
                        );
                      },
                    },
                  ],
                )
              }>
              <TText color={theme.backgroundDangerHeavy?.val} fontSize={fontSize.lg}>
                {t('main:profile_delete_profile')}
              </TText>
            </TButton>
          </YStack>
        )}
      </YStack>
    </Screen>
  );
}

export default Profile;
