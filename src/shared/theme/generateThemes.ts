import {getColorTint, isDarkColor} from './colorUtils';
import {rampFor} from './palette';
import MaterialYou from 'react-native-material-you-colors';

import {DEFAULT_THEME_COLOR, MATERIAL_YOU} from './presetColors';

/**
 * Generate Tamagui theme variants based on a primary color
 *
 * @param primaryColor - The primary/accent color (hex string)
 * @param baseTheme - Base theme object ('light' or 'dark')
 * @returns Theme object with colors generated from primaryColor
 */
export function generateTamaguiTheme(
  themeColor: string,
  baseTheme: 'light' | 'dark',
): Record<string, string> {
  const palette = MaterialYou.getMaterialYouPalette();
  const primaryColor =
    themeColor === MATERIAL_YOU ? palette?.system_accent1[7] : themeColor || DEFAULT_THEME_COLOR;

  const isPrimaryDark = isDarkColor(primaryColor);

  // btnBackground is the primaryColor (theme color)
  // Generate foreground for btnBackground (white if dark, black if light)
  const isBtnBackgroundDark = isDarkColor(primaryColor);
  const btnForeground = isBtnBackgroundDark ? '#ffffff' : '#000000';

  // btnAltBackground is the muted/inverted tinted color (tint at 70) - for non-arrange mode arrange button
  const btnAltBackground = baseTheme === 'light' ? '#c5c5c5' : '#252525';

  // Generate foreground for btnAltBackground (white if dark, black if light)
  const isBtnAltBackgroundDark = isDarkColor(btnAltBackground);
  const btnAltForeground = isBtnAltBackgroundDark ? '#ffffff' : '#000000';

  // Neutral ramps come from `palette`, which transcribes the redesign
  // prototype. The named Tamagui keys below are the app's existing vocabulary,
  // mapped onto that ramp so every screen picks the new surfaces up without
  // being rewritten: surfaceRow is a card/row, surfaceSpecial is the recessed
  // fill behind segmented controls and chips.
  const ramp = rampFor(baseTheme);

  const baseLightTheme = {
    background: ramp.bg,
    color: ramp.fg,
    borderColor: ramp.line,
    shadowColor: 'rgba(20,22,30,0.10)',
    surfaceRow: ramp.surface,
    surfaceSpecial: ramp.surface2,
  };

  const baseDarkTheme = {
    background: ramp.bg,
    color: ramp.fg,
    borderColor: ramp.line,
    shadowColor: 'rgba(0,0,0,0.45)',
    surfaceRow: ramp.surface,
    surfaceSpecial: ramp.surface2,
  };

  if (baseTheme === 'light') {
    return {
      ...baseLightTheme,
      primaryColor: primaryColor,
      colorFocus: getColorTint(primaryColor, isPrimaryDark ? 75 : 30),
      // Button colors
      buttonBackground: primaryColor,
      // Primary button colors (for notification and plus buttons) - same as primaryColor
      btnBackground: primaryColor, // Same as primaryColor
      btnForeground: btnForeground,
      // Alternative button colors (for non-arrange mode rearrange button)
      btnAltBackground: btnAltBackground,
      btnAltForeground: btnAltForeground,
      // Success colors (keeping green as per original)
      backgroundSuccess: ramp.ok,
      backgroundSuccessLight: '#86efac',
      backgroundSuccessHeavy: ramp.ok,
      // Danger colors
      backgroundDanger: ramp.danger,
      backgroundDangerLight: '#fca5a5',
      backgroundDangerHeavy: ramp.danger,
      // Foreground for content sitting on a saturated fill (danger/success
      // swipe actions, switch thumbs). White in both schemes, because the
      // fills underneath are saturated in both.
      onFilled: '#ffffff',
      // Neutral colors
      outlineNeutral: ramp.line,
      outlineDisabledHeavy: '#d1d5db',
      textDefault: ramp.fg,
      textNeutral: ramp.fg2,
      color0: '#0a0a0d',
      color1: '#18181b',
      color2: '#26262a',
      color3: '#343438',
      color4: '#424246',
      color5: '#505055',
      color6: ramp.fg2,
      color7: '#6c6c71',
      color8: ramp.fg3,
      color9: ramp.fg3,
      color10: '#97979c',
      color11: '#a5a5aa',
      color12: '#b3b3b9',
      color13: '#c1c1c7',
      color14: '#cfcfd5',
      color15: '#dddde4',
      color16: '#ebebf2',
    };
  } else {
    // Dark theme
    return {
      ...baseDarkTheme,
      primaryColor: primaryColor,
      colorFocus: getColorTint(primaryColor, isPrimaryDark ? 85 : 25),
      // Button colors
      buttonBackground: primaryColor,
      // Primary button colors (for notification and plus buttons) - same as primaryColor
      btnBackground: primaryColor, // Same as primaryColor
      btnForeground: btnForeground,
      // Alternative button colors (for non-arrange mode rearrange button)
      btnAltBackground: btnAltBackground,
      btnAltForeground: btnAltForeground,
      // Success colors
      backgroundSuccess: ramp.ok,
      backgroundSuccessLight: '#4ade80',
      backgroundSuccessHeavy: ramp.ok,
      // Danger colors
      backgroundDanger: ramp.danger,
      backgroundDangerLight: '#f87171',
      backgroundDangerHeavy: ramp.danger,
      // Foreground for content sitting on a saturated fill (danger/success
      // swipe actions, switch thumbs). White in both schemes, because the
      // fills underneath are saturated in both.
      onFilled: '#ffffff',
      // Neutral colors
      outlineNeutral: ramp.line,
      outlineDisabledHeavy: '#3a3a44',
      textDefault: ramp.fg,
      textNeutral: ramp.fg2,
      color0: '#ebebf2',
      color1: '#dddde4',
      color2: '#cfcfd5',
      color3: '#c1c1c7',
      color4: '#b3b3b9',
      color5: '#a5a5aa',
      color6: ramp.fg2,
      color7: '#89898e',
      color8: ramp.fg3,
      color9: ramp.fg3,
      color10: '#5e5e63',
      color11: '#505055',
      color12: '#424246',
      color13: '#343438',
      color14: '#26262a',
      color15: '#18181b',
      color16: '#0a0a0d',
    };
  }
}

/**
 * Generate both light and dark themes from a primary color
 */
export function generateTamaguiThemes(primaryColor: string) {
  return {
    light: generateTamaguiTheme(primaryColor, 'light'),
    dark: generateTamaguiTheme(primaryColor, 'dark'),
  };
}
