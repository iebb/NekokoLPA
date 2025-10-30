import React, {useEffect, useState} from 'react';
// ColorPickerDialog removed
import {FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import SafeScreen from '@/theme/SafeScreen';
import PageContainer from '@/components/common/PageContainer';
import type {RootScreenProps} from "@/screens/navigation";
import Title from "@/components/common/Title";
import Svg, {Defs, LinearGradient as SvgLinearGradient, Rect, Stop} from 'react-native-svg';
import DraggableFlatList from "react-native-draggable-flatlist";
import {Adapt, Button as TButton, Input, Select, Slider, Text as TText, useTheme, XStack, YStack} from 'tamagui';
import AppSheet from '@/components/common/AppSheet';
import {preferences} from "@/utils/mmkv";
import {useAppTheme} from "@/theme/context";
import i18next from "i18next";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faPaintbrush, faTrash} from "@fortawesome/free-solid-svg-icons";
import {
  ESTK_SE0_LIST,
  ESTK_SE1_LIST,
  getAIDList,
  GSMA_AID,
  PRESET_AID_LIST,
  resetAIDsToPreset,
  setAIDList,
  setAIDsToEstkSe0,
  setAIDsToEstkSe1,
  setAIDsToGsmaOnly
} from "@/utils/aid";

export type SettingDataType = {
  key: string;
  options?: string[];
  type: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  validate?: (value: string) => boolean;
}

function SelectRow({row} : {row: SettingDataType}) {
  const { t } = useTranslation(['main']);
  const theme = useTheme();
  const currentValue = preferences.getString(row.key) ?? (row.defaultValue ?? '');
  const [v, setV] = useState<string>(currentValue);
  const [open, setOpen] = useState(false);

  // Update local state when preferences change
  useEffect(() => {
    const newValue = preferences.getString(row.key) ?? (row.defaultValue ?? '');
    if (newValue !== v) {
      setV(newValue);
    }
  }, [row.key, row.defaultValue, v]);

  const options = row.options || [];

  const currentLabel = row.options?.find(opt => opt === v)
    ? t(`main:settings_item_${row.key}_${v}`)
    : v;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.6}
        style={{ paddingVertical: 8 }}
        onPress={() => setOpen(true)}
      >
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <View>
              <TText color="$textDefault" fontSize={14}>
                {t(`main:settings_title_${row.key}`)}
              </TText>
            </View>
            <View style={{ flex: 1 }} />
          </View>
          <View style={{ flexDirection: 'row', width: '100%' }}>
            <View style={{ flex: 1 }} />
            <View>
              <TText color="$color10" fontSize={14}>
                {currentLabel} →
              </TText>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Hidden trigger Select that opens in a Sheet when row is tapped */}
      <Select open={open} onOpenChange={setOpen} value={v}
              onValueChange={(opt: string) => {
                setV(opt);
                preferences.set(row.key, opt);
                row.onChange?.(opt);
              }}
      >
        <Select.Trigger display="none">
          <Select.Value placeholder={currentLabel} />
        </Select.Trigger>

        <Adapt platform="touch">
          <AppSheet open={open} onOpenChange={setOpen} title={t(`main:settings_title_${row.key}`)}>
            <Adapt.Contents />
          </AppSheet>
        </Adapt>
        <Select.Content zIndex={200000}>
          <Select.Viewport>
            {options.map((opt, i) => (
              <Select.Item
                key={opt}
                value={opt}
                index={i}
                backgroundColor="transparent"
                pressStyle={{ backgroundColor: 'transparent' }}
              >
                <Select.ItemText>
                  {t(`main:settings_item_${row.key}_${opt}`)}
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select>
    </>
  );
}

function PickerRow({row} : {row: SettingDataType}) {
  const { t } = useTranslation(['main']);
  const theme = useTheme();
  const currentValue = preferences.getString(row.key) ?? (row.defaultValue ?? '');
  const [v, setV] = useState<string>(currentValue);

  // Update local state when preferences change
  useEffect(() => {
    const newValue = preferences.getString(row.key) ?? (row.defaultValue ?? '');
    if (newValue !== v) {
      setV(newValue);
    }
  }, [row.key, row.defaultValue, v]);

  if (row.type === 'select') {
    return null; // Handled by SelectRow
  }

  if (row.type === 'text') {
    return (
      <View style={{width: "100%"}}>
        <TText color="$color10" fontSize={12} marginBottom={4}>
          {t(`main:settings_title_${row.key}`)}
        </TText>
        <Input
          placeholder={t(`main:settings_title_${row.key}`)}
          value={v}
          onChangeText={value => {
            setV(value);
            if (!row.validate || row.validate(value)) {
              preferences.set(row.key, value);
            }
          }}
          borderWidth={0.5}
          borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
          borderBottomWidth={0.5}
          backgroundColor="transparent"
          color={theme.textDefault?.val}
          placeholderTextColor={theme.color10?.val}
          fontSize={16}
          padding={0}
          paddingBottom={8}
        />
      </View>
    );
  }

  if (row.type === 'color') {
    const [picker, showPicker] = useState<boolean>(false);
    const hexToHsl = (hex: string) => {
      const parsed = hex.replace('#','');
      const full = parsed.length === 3 ? parsed.split('').map(c=>c+c).join('') : parsed;
      const bigint = parseInt(full, 16);
      const r = ((bigint >> 16) & 255) / 255;
      const g = ((bigint >> 8) & 255) / 255;
      const b = (bigint & 255) / 255;
      const max = Math.max(r,g,b), min = Math.min(r,g,b);
      let h = 0, s = 0; const l = (max+min)/2;
      if(max !== min){
        const d = max-min;
        s = l > 0.5 ? d/(2-max-min) : d/(max+min);
        switch(max){
          case r: h = (g-b)/d + (g < b ? 6 : 0); break;
          case g: h = (b-r)/d + 2; break;
          case b: h = (r-g)/d + 4; break;
        }
        h /= 6;
      }
      return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
    };
    const hslToHex = (h: number, s: number, l: number) => {
      const s1 = s/100, l1 = l/100;
      const k = (n: number) => (n + h/30) % 12;
      const a = s1 * Math.min(l1, 1 - l1);
      const f = (n: number) => l1 - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      const toHex = (x: number) => Math.round(255*x).toString(16).padStart(2,'0');
      return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
    };
    const initial = hexToHsl(v || '#a575f6');
    const [h, setH] = useState<number>(initial.h);
    const [s, setS] = useState<number>(initial.s);
    const [lVal, setLVal] = useState<number>(initial.l);
    const currentHex = hslToHex(h, s, lVal);
    return (
      <View style={{width: "100%"}}>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <View>
              <TText color="$textDefault" fontSize={14}>
                {t(`main:settings_title_${row.key}`)}
              </TText>
            </View>
            <View style={{ flex: 1 }} />
          </View>
          <View style={{ flexDirection: 'row', width: '100%' }}>
            <View style={{ flex: 1 }} />
            <View>
              <TButton backgroundColor={v} onPress={() => showPicker(true)} style={{ maxWidth: 100 }}>
                <FontAwesomeIcon icon={faPaintbrush} style={{ color: theme.background?.val || '#fff' }} />
              </TButton>
            </View>
          </View>
        </View>
        <AppSheet open={picker} onOpenChange={showPicker} title={t(`main:settings_title_${row.key}`)}>
          <YStack gap={16}>
            <XStack gap={12} alignItems="center">
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: currentHex, borderWidth: 1, borderColor: theme.outlineNeutral?.val || '#ddd' }} />
              <TText color="$textDefault" fontSize={14}>{currentHex}</TText>
            </XStack>
            <YStack gap={8}>
              <TText color="$color10" fontSize={12}>Hue</TText>
              <View style={{ position: 'relative', height: 12, borderRadius: 6 }}>
                <View style={{ height: 12, borderRadius: 12, overflow: 'hidden', top: -3 }}>
                  <Svg width="100%" height="100%">
                    <Defs>
                      <SvgLinearGradient id="hueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#FF0000" />
                        <Stop offset="16.6%" stopColor="#FFFF00" />
                        <Stop offset="33.3%" stopColor="#00FF00" />
                        <Stop offset="50%" stopColor="#00FFFF" />
                        <Stop offset="66.6%" stopColor="#0000FF" />
                        <Stop offset="83.3%" stopColor="#FF00FF" />
                        <Stop offset="100%" stopColor="#FF0000" />
                      </SvgLinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#hueGrad)" />
                  </Svg>
                </View>
                <View style={{ position: 'absolute', inset: 0, justifyContent: 'center', width: '100%' }}>
                  <Slider value={[h]} onValueChange={(val) => setH(Math.round(val[0]))} max={360} step={1} style={{ width: '100%' }}>
                    <Slider.Track backgroundColor="transparent">
                      <Slider.TrackActive backgroundColor="transparent" />
                    </Slider.Track>
                    <Slider.Thumb index={0} circular size="$2" />
                  </Slider>
                </View>
              </View>
            </YStack>
            <YStack gap={8}>
              <TText color="$color10" fontSize={12}>Saturation</TText>
              <View style={{ position: 'relative', height: 12, borderRadius: 6 }}>
                <View style={{ height: 12, borderRadius: 12, overflow: 'hidden', top: -3 }}>
                  <Svg width="100%" height="100%">
                    <Defs>
                      <SvgLinearGradient id="satGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor={hslToHex(h, 0, lVal)} />
                        <Stop offset="100%" stopColor={hslToHex(h, 100, lVal)} />
                      </SvgLinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#satGrad)" />
                  </Svg>
                </View>
                <View style={{ position: 'absolute', inset: 0, justifyContent: 'center', width: '100%' }}>
                  <Slider value={[s]} onValueChange={(val) => setS(Math.round(val[0]))} max={100} step={1} style={{ width: '100%' }}>
                    <Slider.Track backgroundColor="transparent">
                      <Slider.TrackActive backgroundColor="transparent" />
                    </Slider.Track>
                    <Slider.Thumb index={0} circular size="$2" />
                  </Slider>
                </View>
              </View>
            </YStack>
            <YStack gap={8}>
              <TText color="$color10" fontSize={12}>Lightness</TText>
              <View style={{ position: 'relative', height: 12, borderRadius: 6 }}>
                <View style={{ height: 12, borderRadius: 12, overflow: 'hidden', top: -3 }}>
                  <Svg width="100%" height="100%" >
                    <Defs>
                      <SvgLinearGradient id="lightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor={hslToHex(h, s, 0)} />
                        <Stop offset="50%" stopColor={hslToHex(h, s, 50)} />
                        <Stop offset="100%" stopColor={hslToHex(h, s, 100)} />
                      </SvgLinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#lightGrad)" />
                  </Svg>
                </View>
                <View style={{ position: 'absolute', inset: 0, justifyContent: 'center', width: '100%' }}>
                  <Slider value={[lVal]} onValueChange={(val) => setLVal(Math.round(val[0]))} max={100} step={1} style={{ width: '100%' }}>
                    <Slider.Track backgroundColor="transparent">
                      <Slider.TrackActive backgroundColor="transparent" />
                    </Slider.Track>
                    <Slider.Thumb index={0} circular size="$2" />
                  </Slider>
                </View>
              </View>
            </YStack>
            <XStack justifyContent="flex-end" gap={8}>
              <TButton
                backgroundColor="transparent"
                borderWidth={1}
                borderColor={theme.outlineNeutral?.val || '#ddd'}
                onPress={() => showPicker(false)}
              >
                <TText color="$textDefault">Cancel</TText>
              </TButton>
              <TButton
                backgroundColor={currentHex}
                onPress={() => {
                  setV(currentHex);
                  preferences.set(row.key, currentHex);
                  row.onChange?.(currentHex);
                  showPicker(false);
                }}
              >
                <TText color={theme.background?.val || '#fff'}>Apply</TText>
              </TButton>
            </XStack>
          </YStack>
        </AppSheet>
      </View>
    );
  }

  return null;
}


export default function Settings({ route,  navigation }: RootScreenProps<'Settings'>) {

  const { t } = useTranslation(['main']);
  const {theme: appTheme, setTheme, setThemeColor} = useAppTheme();
  const theme = useTheme();
  const [aidModalVisible, setAidModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <SafeScreen>
      <Title>{t('main:settings_settings')}</Title>
      <PageContainer keyboardAvoiding={false} scrollViewProps={{ nestedScrollEnabled: true }}>
        <FlatList
          key={appTheme}
          data={(() => {
            const items: SettingDataType[] = [
              {
                key: "language",
                options: ['en', 'ja', 'zh', 'es', 'ru', 'ar'],
                defaultValue: 'en',
                type: 'select',
                onChange: (value: string) => {
                  preferences.set("language", value);
                  void i18next.changeLanguage(value);
                }
              },
              {
                key: "theme",
                options: ['default', 'dark', 'light'],
                defaultValue: 'default',
                type: 'select',
                onChange: (value: string) => {
                  setTheme(value);
                }
              },
              {
                key: "showSlots",
                options: ['all', 'possible', 'available'],
                defaultValue: 'all',
                type: 'select'
              },
              {
                key: "redactMode",
                options: ['none', 'medium', 'hard'],
                defaultValue: 'none',
                type: 'select'
              },
              {
                key: "unit",
                options: ['b', 'kb', 'kib', 'mb', 'mib', 'adaptive_si', 'adaptive_bi'],
                defaultValue: 'adaptive_si',
                type: 'select'
              },
              {
                key: "displaySubtitle",
                options: ['provider', 'operator', 'country', 'code', 'iccid'],
                defaultValue: 'provider',
                type: 'select'
              },
              {
                key: "useCamera",
                options: ['always', 'ondemand'],
                defaultValue: 'always',
                type: 'select'
              },
              {
                key: "aid",
                type: 'aid'
              },
              {
                key: "themeColor",
                defaultValue: '#a575f6',
                type: 'color',
                onChange: (value: string) => {
                  setThemeColor(value);
                }
              },
            ];
            if (Platform.OS === 'android') {
              items.splice(items.length - 2, 0, {
                key: "disableProtection",
                options: ['on', 'off'],
                defaultValue: 'on',
                type: 'select'
              });
            }
            return items;
          })()}
          renderItem={({item, index}) => {
            if (item.type === 'aid') {
              const aidCount = getAIDList().split(',').filter(Boolean).length;
              return (
                <View>
                  <TouchableOpacity
                    activeOpacity={0.6}
                    style={{ paddingVertical: 8 }}
                    onPress={() => setAidModalVisible(true)}
                  >
                    <View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                        <View>
                          <TText color="$textDefault" fontSize={14}>
                            AID Configuration
                          </TText>
                        </View>
                        <View style={{ flex: 1 }} />
                      </View>
                      <View style={{ flexDirection: 'row', width: '100%' }}>
                        <View style={{ flex: 1 }} />
                        <View>
                          <TText color="$color10" fontSize={14}>
                            {aidCount} AID{aidCount !== 1 ? 's' : ''} →
                          </TText>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }
            return (
              <View
                key={item.key}
              >
                {item.type === 'select' ? (
                  <SelectRow row={item} />
                ) : (
                  <PickerRow row={item}/>
                )}
              </View>
            );
          }}
          keyExtractor={(item: SettingDataType) => item.key}
          scrollEnabled={false}
        />
      </PageContainer>

      <AppSheet open={aidModalVisible} onOpenChange={setAidModalVisible} title={"AID Configuration"}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <AIDManager />
        </KeyboardAvoidingView>
      </AppSheet>
    </SafeScreen>
  );
}

function AIDManager() {
  const theme = useTheme();
  const [aids, setAids] = useState<string[]>(() => getAIDList().split(',').filter(Boolean));
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    if (aids.length > 0) {
      setAIDList(aids.join(','));
    }
  }, [aids]);

  const addAid = () => {
    const v = input.trim().toUpperCase();
    if (v.length === 0) return;
    if (!/^[0-9A-F]+$/.test(v)) return;
    if (aids.includes(v)) return;
    setAids([...aids, v]);
    setInput("");
  };

  const removeAid = (aid: string) => {
    setAids(aids.filter(a => a !== aid));
  };

  const onResetPreset = () => {
    resetAIDsToPreset();
    setAids(PRESET_AID_LIST.split(',').filter(Boolean));
  };

  const onGsmaOnly = () => {
    setAIDsToGsmaOnly();
    setAids([GSMA_AID]);
  };

  const onEstkSe0 = () => {
    setAIDsToEstkSe0();
    setAids(ESTK_SE0_LIST.split(',').filter(Boolean));
  };

  const onEstkSe1 = () => {
    setAIDsToEstkSe1();
    setAids(ESTK_SE1_LIST.split(',').filter(Boolean));
  };

  const inputValid = /^[0-9A-F]+$/.test(input.trim().toUpperCase()) && !aids.includes(input.trim().toUpperCase());

  return (
    <YStack flex={1}>
      {/* Content with Add Input */}
      <YStack flex={1} padding={0} gap={16}>
        {/* Add AID Input Section */}
        <XStack alignItems="flex-end" gap={10}>
          <YStack flex={1}>
            <TText color="$color10" fontSize={12} marginBottom={6}>
              Add AID (hex)
            </TText>
            <Input
              placeholder="Add AID (hex)"
              value={input}
              onChangeText={setInput}
              autoCapitalize="characters"
              borderWidth={0.5}
              borderBottomWidth={0.5}
              borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
              backgroundColor="transparent"
              color={theme.textDefault?.val}
              placeholderTextColor={theme.color10?.val || '#999'}
              fontSize={16}
              padding={0}
              paddingLeft={8}
              height={40}
              textAlignVertical="center"
            />
          </YStack>
          <TButton
            onPress={addAid}
            disabled={!inputValid}
            height={40}
            minWidth={80}
            borderWidth={1}
            borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
            backgroundColor={inputValid ? (theme.accentColor?.val || theme.color?.val || '#6c5ce7') : (theme.color2?.val || '#444')}
            borderRadius={8}
          >
            <TText color={inputValid ? (theme.background?.val || '#fff') : (theme.color10?.val || '#999')} fontSize={14}>
              Add
            </TText>
          </TButton>
        </XStack>

        {/* AID List */}
        {aids.length > 0 ? (

          <DraggableFlatList
            data={aids}
            keyExtractor={(item: string) => item}
            keyboardShouldPersistTaps="handled"
            onDragEnd={({ data }: { data: string[] }) => setAids(data)}
            renderItem={({ item, drag, isActive }: any) => (

              <TouchableOpacity
                activeOpacity={1}
                onLongPress={drag}
                disabled={isActive}
                style={[
                  { opacity: isActive ?  0.8 : 1 },
                ]}
              >
                <XStack alignItems="center" paddingVertical={10} paddingHorizontal={12} gap={10}>
                  <TText flex={1} color="$textDefault" fontSize={14} numberOfLines={1} style={{ fontFamily: 'monospace' }}>
                    {item}
                  </TText>
                  <TButton
                    onPress={() => removeAid(item)}
                    height={28}
                    minWidth={28}
                    backgroundColor={theme.backgroundDangerHeavy?.val || '#dc2626'}
                    borderWidth={0}
                  >
                    <FontAwesomeIcon icon={faTrash} style={{ color: theme.background?.val || '#fff' }} />
                  </TButton>
                </XStack>
              </TouchableOpacity>
            )}
          />
        ) : (
          <YStack flex={1} justifyContent="center" alignItems="center" minHeight={100}>
            <TText color="$color10" fontSize={14}>No AIDs configured</TText>
          </YStack>
        )}
      </YStack>

      {/* Preset Buttons Section */}
      <YStack
        padding={20}
        borderTopWidth={0.5}
        borderTopColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
        gap={8}
      >
        <XStack justifyContent="flex-end" gap={8}>
          <TButton
            onPress={onResetPreset}
            size="$3"
            borderWidth={1}
            borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
            backgroundColor="transparent"
            borderRadius={8}
          >
            <TText color={theme.textDefault?.val || theme.color?.val || '#000'} fontSize={13}>
              Reset to preset
            </TText>
          </TButton>
          <TButton
            onPress={onGsmaOnly}
            size="$3"
            borderWidth={1}
            borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
            backgroundColor="transparent"
            borderRadius={8}
          >
            <TText color={theme.textDefault?.val || theme.color?.val || '#000'} fontSize={13}>
              GSMA only
            </TText>
          </TButton>
        </XStack>
        <XStack justifyContent="flex-end" gap={8}>
          <TButton
            onPress={onEstkSe0}
            size="$3"
            borderWidth={1}
            borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
            backgroundColor="transparent"
            borderRadius={8}
          >
            <TText color={theme.textDefault?.val || theme.color?.val || '#000'} fontSize={13}>
              ESTK SE0
            </TText>
          </TButton>
          <TButton
            onPress={onEstkSe1}
            size="$3"
            borderWidth={1}
            borderColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
            backgroundColor="transparent"
            borderRadius={8}
          >
            <TText color={theme.textDefault?.val || theme.color?.val || '#000'} fontSize={13}>
              ESTK SE1
            </TText>
          </TButton>
        </XStack>
      </YStack>
    </YStack>
  );
}
