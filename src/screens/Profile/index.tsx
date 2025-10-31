import React, {useEffect, useState} from 'react';
import {Alert, Image, Platform, ToastAndroid, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import Screen from '@/components/common/Screen';
import type {RootScreenProps} from "@/screens/navigation";
import {Button as TButton, Input, Text as TText, useTheme, XStack, YStack} from 'tamagui';
import AppSheet from '@/components/common/AppSheet';
import {useSelector} from "react-redux";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faCopy, faPencil, faTimes} from "@fortawesome/free-solid-svg-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import {dateToDate6, parseMetadata, Tag} from "@/utils/parser";
import DateTimePicker from '@react-native-community/datetimepicker';
import {resolveMccMnc, T_PLMN} from "@/data/mccMncResolver";
import {Flags} from "@/assets/flags";
import {makeLoading} from "@/components/utils/loading";
import {Adapters} from "@/native/adapters/registry";
import {selectDeviceState} from "@/redux/stateStore";
import {getUTF8Length} from "@/utils/encoding";
import {useLoading} from "@/components/common/LoadingProvider";

// Metadata Row Component
function MetadataRow({
                       label,
                       value,
                       theme,
                       flag,
                       onCopy
                     }: {
  label: string;
  value?: string;
  theme: any;
  flag?: any;
  onCopy?: (value: string) => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => value && onCopy?.(value)}
      activeOpacity={0.7}
    >
      <YStack paddingVertical={10}>
        <XStack alignItems="center" justifyContent="space-between" gap={12}>
          <TText color="$color10" fontSize={12} style={{ minWidth: 100, flexShrink: 0 }}>
            {label}
          </TText>
          <XStack alignItems="center" gap={8} flex={1} flexShrink={1}>
            <TText
              color="$textDefault"
              fontSize={15}
              fontWeight="600"
              flex={1}
              numberOfLines={1}
              style={{ textAlign: 'right' }}
            >
              {value || '[empty]'}
            </TText>
            {flag && (
              <Image
                style={{width: 18, height: 18}}
                source={flag}
              />
            )}
            {value && (
              <FontAwesomeIcon
                icon={faCopy}
                size={12}
                style={{ color: theme.color10?.val || '#999' }}
              />
            )}
          </XStack>
        </XStack>
      </YStack>
    </TouchableOpacity>
  );
}

function Profile({ route,  navigation }: RootScreenProps<'Profile'>) {
  const theme = useTheme();
  const { t } = useTranslation(['main']);
  const { deviceId, iccid } = route.params;


  const adapter = Adapters[deviceId];

  const [tags, setTags] = useState<Tag[]>([]);
  const { isLoading, setLoading } = useLoading();
  const [nickname, setNickname] = useState('');
  const [country, setCountry] = useState('');
  const [resolvedMccMnc, setResolvedMccMnc] = useState<T_PLMN | undefined>();

   const [tagModal, setTagModal] = useState<boolean>(false);
   const [renameModal, setRenameModal] = useState<boolean>(false);
  const [newTagType, setNewTagType] = useState('date');
  const [tagValue, setTagValue] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const DeviceState = useSelector(selectDeviceState(deviceId));
  const metadata = DeviceState?.profiles?.find(m => m.iccid === iccid);

  useEffect(() => {
    if (metadata) {
      const { tags, name, country } = parseMetadata(metadata, t, false);
      setTags(tags as any);
      setNickname(name);
      setCountry(country);
      if (metadata.profileOwnerMccMnc) {
        setResolvedMccMnc(resolveMccMnc(metadata.profileOwnerMccMnc));
      }
    }
  }, [metadata, t]);

  const tagChars = tags.length ? " " + (tags.map(t => t.rawValue)).join(" ") : "";

  const updateNickname = (n: string) => {
    makeLoading(setLoading, async () => {
      await adapter.setNicknameByIccId(iccid, n);
    });
  }

  const handleCopy = (value: string) => {
    if (Platform.OS === 'android' && value) {
      Clipboard.setString(value);
      ToastAndroid.show('Copied', ToastAndroid.SHORT);
    }
  }

  if (!metadata) {
    return null;
  }

  return (
    <Screen title={t('main:profile_profile_detail')} keyboardAvoiding={false} scrollViewProps={{ nestedScrollEnabled: true }}>
      <AppSheet open={tagModal} onOpenChange={setTagModal} title={t('main:profile_add_tag')}>
          <YStack gap={16}>
            {/* Toggle group */}
            <XStack alignItems="center" gap={12}>
              <TText color="$textDefault" fontSize={16}>{t('main:profile_add_tag_type')}:</TText>
              <XStack gap={8}>
                <TButton
                  onPress={() => setNewTagType('date')}
                  backgroundColor={newTagType === 'date' ? (theme.accentColor?.val) : 'transparent'}
                  borderWidth={1}
                  borderColor={newTagType === 'date' ? (theme.accentColor?.val) : (theme.outlineNeutral?.val || '#ccc')}
                  paddingHorizontal={12}
                  paddingVertical={8}
                  borderRadius={8}
                >
                  <TText color={newTagType === 'date' ? (theme.background?.val) : (theme.textDefault?.val)} fontSize={14}>
                    {t('main:profile_tags_date')}
                  </TText>
                </TButton>
                <TButton
                  onPress={() => setNewTagType('text')}
                  backgroundColor={newTagType === 'text' ? (theme.accentColor?.val) : 'transparent'}
                  borderWidth={1}
                  borderColor={newTagType === 'text' ? (theme.accentColor?.val) : (theme.outlineNeutral?.val || '#ccc')}
                  paddingHorizontal={12}
                  paddingVertical={8}
                  borderRadius={8}
                >
                  <TText color={newTagType === 'text' ? (theme.background?.val) : (theme.textDefault?.val)} fontSize={14}>
                    {t('main:profile_tags_text')}
                  </TText>
                </TButton>
              </XStack>
            </XStack>

            {/* Input area */}
            <YStack gap={12}>
              {newTagType === 'date' ? (
                <>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                    <Input
                      value={new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset()*60000).toISOString().slice(0,10)}
                      editable={false}
                      borderWidth={0}
                      borderBottomWidth={1}
                      borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
                      backgroundColor="transparent"
                      color={theme.textDefault?.val}
                      fontSize={16}
                      padding={0}
                    />
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event: any, date?: Date) => {
                        if (Platform.OS === 'android') {
                          setShowDatePicker(false);
                        }
                        if (date) {
                          setSelectedDate(date);
                          setTagValue(`d:${dateToDate6(date)}`);
                        }
                      }}
                    />
                  )}
                </>
              ) : newTagType === 'text' ? (
                <Input
                  placeholder={t('main:profile_tags_text_placeholder')}
                  onChangeText={c => {
                    const cleaned = c.replace(/\s+/g, '');
                    setTagValue(`t:${cleaned}`);
                  }}
                  borderWidth={0}
                  borderBottomWidth={1}
                  borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
                  backgroundColor="transparent"
                  color={theme.textDefault?.val}
                  placeholderTextColor={theme.color10?.val}
                  fontSize={16}
                  padding={0}
                  paddingBottom={8}
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
              backgroundColor="$accentColor"
            >
                <TText color={theme.background?.val || '#fff'} fontSize={16}>Save</TText>
            </TButton>
          </XStack>
          </YStack>
      </AppSheet>
      {/* Rename Profile Sheet */}
      <AppSheet open={renameModal} onOpenChange={setRenameModal} title={t('main:profile_rename_profile')}>
        <YStack gap={12}>
           <Input
             placeholder={t('main:profile_rename_profile')}
             value={nickname}
             onChangeText={c => setNickname(c)}
             borderWidth={0.5}
             borderBottomWidth={0.5}
             borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
             backgroundColor="transparent"
             color={theme.textDefault?.val}
             placeholderTextColor={theme.color10?.val}
             fontSize={16}
             padding={0}
             paddingBottom={8}
           />
           <XStack justifyContent="space-between" alignItems="center">
             <TText color="$color10" fontSize={11}>{`${getUTF8Length(nickname + tagChars)}/64`}</TText>
             <TButton
               disabled={isLoading}
               onPress={() => {
                 updateNickname(nickname + tagChars);
                 setRenameModal(false);
               }}
               backgroundColor="$accentColor"
             >
               <TText color={theme.background?.val || '#fff'} fontSize={14}>Save</TText>
             </TButton>
           </XStack>
        </YStack>
      </AppSheet>
        <YStack gap={20} flex={1}>
          {/* Header Section */}
           <YStack gap={8}>
             <XStack gap={8} alignItems="center" justifyContent="space-between">
               <XStack gap={8} alignItems="center" flex={1}>
              <Image
                style={{width: 24, height: 24}}
                source={Flags[country] || Flags.UN}
              />
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                  if (nickname && Platform.OS === 'android') {
                    Clipboard.setString(nickname);
                    ToastAndroid.show('Copied', ToastAndroid.SHORT);
                  }
                }}
              >
                <TText
                  color="$textDefault"
                  fontSize={22}
                  fontWeight="600"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {nickname}
                </TText>
              </TouchableOpacity>
               </XStack>
               <TButton
                 onPress={() => setRenameModal(true)}
                 backgroundColor={theme.surfaceSpecial?.val}
                 borderWidth={1}
                 borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
                 height={36}
                 minWidth={36}
                 padding={0}
                 borderRadius={8}
               >
                 <FontAwesomeIcon icon={faPencil} size={14} style={{ color: theme.color10?.val || '#777' }} />
               </TButton>
            </XStack>
            {metadata?.serviceProviderName && (
              <TText
                color="$color10"
                fontSize={14}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {metadata.serviceProviderName}
              </TText>
            )}
          </YStack>

          {/* Tags Section */}
           <YStack gap={10}>
             <TText color="$textDefault" fontSize={16} fontWeight="700">Tags</TText>
             <YStack backgroundColor="$surfaceSpecial" borderRadius={12} padding={12}>
             <XStack gap={8} flexWrap="wrap">
              {tags.map((tag, i) => {
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => Alert.alert(
                      t('main:profile_delete_tag'),
                      t('main:profile_delete_tag_alert', {tag: tag.value}), [
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
                              (nickname + " " + tags.filter(
                                tag_ => tag_.value !== tag.value
                              ).map(tag => tag.rawValue).join(" ")).trimEnd()
                            );
                          }
                        },
                      ])}
                  >
                    <XStack
                       alignItems="center"
                       borderWidth={1}
                       borderColor={theme.outlineNeutral?.val || '#ddd'}
                       backgroundColor={tag.backgroundColor}
                       paddingHorizontal={10}
                       paddingVertical={6}
                       borderRadius={999}
                       gap={6}
                    >
                      <TText color={tag.color} fontSize={14} fontWeight="500">
                        {tag.value}
                      </TText>
                      <FontAwesomeIcon icon={faTimes} size={10} style={{ color: tag.color }} />
                    </XStack>
                  </TouchableOpacity>
                )
              })}
             </XStack>
             <XStack justifyContent="flex-end" marginTop={8}>
               <TButton
                 onPress={() => setTagModal(true)}
                 backgroundColor="$accentColor"
                 borderRadius={8}
                 height={32}
                 paddingHorizontal={10}
               >
                 <TText color={theme.background?.val || '#fff'} fontSize={14}>Add tag</TText>
               </TButton>
             </XStack>
             </YStack>
          </YStack>

          {/* Rename Section */}
           {/* Rename handled via sheet */}

          {/* Metadata Section */}
          <YStack gap={8}>
            <TText color="$textDefault" fontSize={16} fontWeight="700">
              Profile Information
            </TText>
            <YStack backgroundColor="$surfaceSpecial" borderRadius={12} padding={20} gap={10}>
              {metadata && (
                <>
                  {metadata.iccid && (
                    <MetadataRow
                      label={t("main:profile_iccid")}
                      value={metadata.iccid}
                      theme={theme}
                      onCopy={handleCopy}
                    />
                  )}
                  {metadata.profileName && (
                    <MetadataRow
                      label={t("main:profile_name")}
                      value={metadata.profileName}
                      theme={theme}
                      onCopy={handleCopy}
                    />
                  )}
                  {metadata.serviceProviderName && (
                    <MetadataRow
                      label={t("main:profile_provider")}
                      value={metadata.serviceProviderName}
                      theme={theme}
                      onCopy={handleCopy}
                    />
                  )}
                  {metadata.profileOwnerMccMnc && (
                    <MetadataRow
                      label={t("main:profile_plmn")}
                      value={metadata.profileOwnerMccMnc.replaceAll("F", " ")}
                      theme={theme}
                      onCopy={handleCopy}
                    />
                  )}
                  {resolvedMccMnc && (
                    <>
                      <MetadataRow
                        label={t("main:profile_country")}
                        value={resolvedMccMnc.Country}
                        theme={theme}
                        flag={Flags[resolvedMccMnc?.ISO1 || "UN"] || Flags.UN}
                        onCopy={handleCopy}
                      />
                      {resolvedMccMnc.Operator && (
                        <MetadataRow
                          label={t("main:profile_operator")}
                          value={resolvedMccMnc.Operator}
                          theme={theme}
                          onCopy={handleCopy}
                        />
                      )}
                      {resolvedMccMnc.Brand && (
                        <MetadataRow
                          label={t("main:profile_brand")}
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
          {
            (metadata.profileState === 0) && (
              <YStack marginTop={20}>
                <TButton
                  backgroundColor="transparent"
                  onPress={() => Alert.alert(
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
                                  makeLoading(() => {
                                    setLoading(false);
                                    navigation.goBack();
                                  }, async () => {
                                    await adapter.deleteProfileByIccId(iccid);
                                    await adapter.processNotifications(iccid);
                                  });
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
                  }
                >
                  <TText color={theme.backgroundDangerHeavy?.val || '#dc2626'} fontSize={16}>
                    {t('main:profile_delete_profile')}
                  </TText>
                </TButton>
              </YStack>
            )
          }
        </YStack>
    </Screen>
  );
}

export default Profile;
