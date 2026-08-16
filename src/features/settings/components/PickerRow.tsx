import React, {useCallback, useEffect, useState} from 'react';
import {Platform, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Svg, {Defs, LinearGradient as SvgLinearGradient, Rect, Stop} from 'react-native-svg';
import {Button as TButton, Slider, Text as TText, useTheme, XStack, YStack} from 'tamagui';
import MaterialYou from 'react-native-material-you-colors';

import {preferences} from '@/shared/storage';
import AppSheet from '@/shared/ui/AppSheet';
import {hexToHsl, hslToHex} from '@/shared/theme/colorUtils';
import type {SettingRow} from '@/features/settings/types';

const DEFAULT_COLOR = '#813ff3';
/** Sentinel stored in preferences meaning "follow the Material You palette". */
const MATERIAL_YOU = 'my';

/** Lightness is clamped to keep generated themes legible in both schemes. */
const LIGHTNESS_MIN = 40;
const LIGHTNESS_MAX = 60;

function getMaterialYouColor(): string {
  if (Platform.OS !== 'android') {
    return DEFAULT_COLOR;
  }
  const palette = MaterialYou.getMaterialYouPalette();
  return palette?.system_accent1[7] || DEFAULT_COLOR;
}

/**
 * Settings row for choosing the app's accent colour via an HSL picker,
 * with a shortcut to the system Material You accent on Android.
 */
const PickerRow = React.memo(function PickerRow({row}: {row: SettingRow}) {
  const {t} = useTranslation(['main']);
  const theme = useTheme();

  const [value, setValue] = useState<string>(
    () => preferences.getString(row.key) ?? row.defaultValue ?? DEFAULT_COLOR,
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  const materialYouColor = getMaterialYouColor();
  const isMaterialYou = value === MATERIAL_YOU;
  const swatchColor = isMaterialYou ? materialYouColor : value;

  const [hsl, setHsl] = useState(() =>
    hexToHsl(isMaterialYou ? materialYouColor : value || DEFAULT_COLOR),
  );
  const currentHex = hslToHex(hsl.h, hsl.s, hsl.l);

  // Keep the local value in sync if preferences changed elsewhere.
  useEffect(() => {
    const stored = preferences.getString(row.key) ?? row.defaultValue ?? DEFAULT_COLOR;
    setValue(prev => (stored === prev ? prev : stored));
  }, [row.key, row.defaultValue]);

  // Re-seed the sliders from the active colour each time the sheet opens.
  useEffect(() => {
    if (!pickerOpen) {
      return;
    }
    setHsl(hexToHsl(isMaterialYou ? materialYouColor : value || DEFAULT_COLOR));
  }, [pickerOpen, isMaterialYou, materialYouColor, value]);

  const commit = useCallback(
    (next: string) => {
      setValue(next);
      preferences.set(row.key, next);
      row.onChange?.(next);
      setPickerOpen(false);
    },
    [row],
  );

  const Icon = row.icon;

  return (
    <View style={{width: '100%'}}>
      <TouchableOpacity activeOpacity={0.6} onPress={() => setPickerOpen(true)}>
        <XStack alignItems="center" gap={16}>
          <YStack
            padding={8}
            borderRadius={10}
            position="relative"
            alignItems="center"
            justifyContent="center">
            <YStack
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              backgroundColor="$primaryColor"
              borderRadius={10}
              opacity={0.15}
            />
            <Icon size={20} color={theme.primaryColor?.val} />
          </YStack>

          <YStack flex={1}>
            <TText color="$textDefault" fontSize={16} fontWeight="500">
              {t(`main:settings_title_${row.key}`)}
            </TText>
            <TText color="$color6" fontSize={13}>
              {isMaterialYou ? 'Material You' : currentHex}
            </TText>
          </YStack>

          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: swatchColor,
              borderWidth: 2,
              borderColor: theme.borderColor?.val,
            }}
          />
        </XStack>
      </TouchableOpacity>

      <AppSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title={t(`main:settings_title_${row.key}`)}>
        <YStack gap={16}>
          <XStack gap={12} alignItems="center" justifyContent="space-between">
            <XStack gap={12} alignItems="center" flex={1}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: currentHex,
                  borderWidth: 1,
                  borderColor: theme.outlineNeutral?.val || '#ddd',
                }}
              />
              <TText color="$textDefault" fontSize={14}>
                {currentHex}
              </TText>
            </XStack>
            {Platform.OS === 'android' && (
              <TButton backgroundColor={materialYouColor} onPress={() => commit(MATERIAL_YOU)}>
                <TText color={theme.background?.val || '#fff'}>Material You</TText>
              </TButton>
            )}
          </XStack>

          <GradientSlider
            label="Hue"
            gradientId="hueGrad"
            stops={[
              {offset: '0%', color: '#FF0000'},
              {offset: '16.6%', color: '#FFFF00'},
              {offset: '33.3%', color: '#00FF00'},
              {offset: '50%', color: '#00FFFF'},
              {offset: '66.6%', color: '#0000FF'},
              {offset: '83.3%', color: '#FF00FF'},
              {offset: '100%', color: '#FF0000'},
            ]}
            value={hsl.h}
            max={360}
            onChange={h => setHsl(prev => ({...prev, h}))}
          />

          <GradientSlider
            label="Saturation"
            gradientId="satGrad"
            stops={[
              {offset: '0%', color: hslToHex(hsl.h, 0, hsl.l)},
              {offset: '100%', color: hslToHex(hsl.h, 100, hsl.l)},
            ]}
            value={hsl.s}
            max={100}
            onChange={s => setHsl(prev => ({...prev, s}))}
          />

          <GradientSlider
            label="Lightness"
            gradientId="lightGrad"
            stops={[
              {offset: '0%', color: hslToHex(hsl.h, hsl.s, LIGHTNESS_MIN)},
              {offset: '50%', color: hslToHex(hsl.h, hsl.s, 50)},
              {offset: '100%', color: hslToHex(hsl.h, hsl.s, LIGHTNESS_MAX)},
            ]}
            value={hsl.l}
            min={LIGHTNESS_MIN}
            max={LIGHTNESS_MAX}
            onChange={l => setHsl(prev => ({...prev, l}))}
          />

          <XStack justifyContent="flex-end" gap={8}>
            <TButton
              backgroundColor="transparent"
              borderWidth={1}
              borderColor={theme.outlineNeutral?.val || '#ddd'}
              onPress={() => setPickerOpen(false)}>
              <TText color="$textDefault">Cancel</TText>
            </TButton>
            <TButton backgroundColor={currentHex} onPress={() => commit(currentHex)}>
              <TText color={theme.background?.val || '#fff'}>Apply</TText>
            </TButton>
          </XStack>
        </YStack>
      </AppSheet>
    </View>
  );
});

/** A slider rendered on top of an SVG gradient track. */
function GradientSlider({
  label,
  gradientId,
  stops,
  value,
  min = 0,
  max,
  onChange,
}: {
  label: string;
  gradientId: string;
  stops: {offset: string; color: string}[];
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <YStack gap={8}>
      <TText color="$color6" fontSize={12}>
        {label}
      </TText>
      <View style={{position: 'relative', height: 12, borderRadius: 6}}>
        <View style={{height: 12, borderRadius: 12, overflow: 'hidden', top: -3}}>
          <Svg width="100%" height="100%">
            <Defs>
              <SvgLinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                {stops.map(stop => (
                  <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
                ))}
              </SvgLinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
          </Svg>
        </View>
        <View style={{position: 'absolute', inset: 0, justifyContent: 'center', width: '100%'}}>
          <Slider
            value={[value]}
            onValueChange={val => onChange(Math.round(val[0]))}
            min={min}
            max={max}
            step={1}
            style={{width: '100%'}}>
            <Slider.Track backgroundColor="transparent">
              <Slider.TrackActive backgroundColor="transparent" />
            </Slider.Track>
            <Slider.Thumb index={0} circular size="$2" />
          </Slider>
        </View>
      </View>
    </YStack>
  );
}

export default PickerRow;
