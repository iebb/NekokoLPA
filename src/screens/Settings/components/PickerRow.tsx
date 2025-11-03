import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Svg, {Defs, LinearGradient as SvgLinearGradient, Rect, Stop} from 'react-native-svg';
import {Button as TButton, Input, Slider, Text as TText, useTheme, XStack, YStack} from 'tamagui';
import {preferences} from '@/utils/mmkv';
import AppSheet from '@/components/common/AppSheet';
import {Paintbrush} from '@tamagui/lucide-icons';

export type SettingDataType = {
  key: string;
  options?: string[];
  type: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  validate?: (value: string) => boolean;
}

const PickerRow = React.memo(function PickerRow({row} : {row: SettingDataType}) {
  const { t } = useTranslation(['main']);
  const theme = useTheme();
  const currentValue = preferences.getString(row.key) ?? (row.defaultValue ?? '');
  const [v, setV] = useState<string>(currentValue);

  useEffect(() => {
    const newValue = preferences.getString(row.key) ?? (row.defaultValue ?? '');
    if (newValue !== v) setV(newValue);
  }, [row.key, row.defaultValue, v]);

  if (row.type === 'select') return null;

  if (row.type === 'text') {
    return (
      <View style={{width: '100%'}}>
        <TText color="$color10" fontSize={12} marginBottom={4}>{t(`main:settings_title_${row.key}`)}</TText>
        <Input
          placeholder={t(`main:settings_title_${row.key}`)}
          value={v}
          onChangeText={value => {
            setV(value);
            if (!row.validate || row.validate(value)) preferences.set(row.key, value);
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
      <View style={{width: '100%'}}>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <View>
              <TText color="$textDefault" fontSize={14}>{t(`main:settings_title_${row.key}`)}</TText>
            </View>
            <View style={{ flex: 1 }} />
          </View>
          <View style={{ flexDirection: 'row', width: '100%' }}>
            <View style={{ flex: 1 }} />
            <View>
              <TButton backgroundColor={v} onPress={() => showPicker(true)} style={{ maxWidth: 100 }}>
                <Paintbrush size={18} color={theme.background?.val || '#fff'} />
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
                    <Slider.Track backgroundColor="transparent"><Slider.TrackActive backgroundColor="transparent" /></Slider.Track>
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
                    <Slider.Track backgroundColor="transparent"><Slider.TrackActive backgroundColor="transparent" /></Slider.Track>
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
                        <Stop offset="0%" stopColor={hslToHex(h, s, 40)} />
                        <Stop offset="50%" stopColor={hslToHex(h, s, 50)} />
                        <Stop offset="100%" stopColor={hslToHex(h, s, 60)} />
                      </SvgLinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#lightGrad)" />
                  </Svg>
                </View>
                <View style={{ position: 'absolute', inset: 0, justifyContent: 'center', width: '100%' }}>
                  <Slider value={[lVal]} onValueChange={(val) => setLVal(Math.round(val[0]))} max={60} min={40} step={1} style={{ width: '100%' }}>
                    <Slider.Track backgroundColor="transparent"><Slider.TrackActive backgroundColor="transparent" /></Slider.Track>
                    <Slider.Thumb index={0} circular size="$2" />
                  </Slider>
                </View>
              </View>
            </YStack>
            <XStack justifyContent="flex-end" gap={8}>
              <TButton backgroundColor="transparent" borderWidth={1} borderColor={theme.outlineNeutral?.val || '#ddd'} onPress={() => showPicker(false)}>
                <TText color="$textDefault">Cancel</TText>
              </TButton>
              <TButton backgroundColor={currentHex} onPress={() => {
                setV(currentHex);
                preferences.set(row.key, currentHex);
                row.onChange?.(currentHex);
                showPicker(false);
              }}>
                <TText color={theme.background?.val || '#fff'}>Apply</TText>
              </TButton>
            </XStack>
          </YStack>
        </AppSheet>
      </View>
    );
  }

  return null;
});

export default PickerRow;


