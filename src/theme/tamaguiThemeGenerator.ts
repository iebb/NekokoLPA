import {getColorTint, isDarkColor} from './colorUtils';

/**
 * Generate Tamagui theme variants based on a primary color
 *
 * @param primaryColor - The primary/accent color (hex string)
 * @param baseTheme - Base theme object ('light' or 'dark')
 * @returns Theme object with colors generated from primaryColor
 */
export function generateTamaguiTheme(
  primaryColor: string,
  baseTheme: 'light' | 'dark'
): Record<string, string> {
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

  const baseLightTheme = {
    background: '#f0f1f5',
    color: '#0c0c0c',
    borderColor: '#e6e6ea',
    shadowColor: 'rgba(0,0,0,0.06)',
    surfaceRow: '#ffffff',
    // keep special surfaces pure white to appear lighter than page bg
    surfaceSpecial: '#ffffff',
  };

  const baseDarkTheme = {
    background: '#0b0b0f',
    color: '#e9e9ef',
    borderColor: '#161620',
    shadowColor: 'rgba(0,0,0,0.35)',
    surfaceRow: '#16161d',
    // make row surfaces lighter than background a bit more pronounced on dark
    surfaceSpecial: '#292934',
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
      backgroundSuccess: '#22c55e',
      backgroundSuccessLight: '#86efac',
      backgroundSuccessHeavy: '#16a34a',
      // Danger colors
      backgroundDanger: '#ef4444',
      backgroundDangerLight: '#fca5a5',
      backgroundDangerHeavy: '#dc2626',
      // Neutral colors
      outlineNeutral: '#e6e6ea',
      outlineDisabledHeavy: '#d1d5db',
      textDefault: '#000000',
      textNeutral: '#6b7280',
      "color0": "#0a0a0d",
      "color1": "#18181b",
      "color2": "#26262a",
      "color3": "#343438",
      "color4": "#424246",
      "color5": "#505055",
      "color6": "#5e5e63",
      "color7": "#6c6c71",
      "color8": "#7a7a7f",
      "color9": "#89898e",
      "color10": "#97979c",
      "color11": "#a5a5aa",
      "color12": "#b3b3b9",
      "color13": "#c1c1c7",
      "color14": "#cfcfd5",
      "color15": "#dddde4",
      "color16": "#ebebf2"
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
      backgroundSuccess: '#22c55e',
      backgroundSuccessLight: '#4ade80',
      backgroundSuccessHeavy: '#16a34a',
      // Danger colors
      backgroundDanger: '#ef4444',
      backgroundDangerLight: '#f87171',
      backgroundDangerHeavy: '#dc2626',
      // Neutral colors
      outlineNeutral: '#2a2a34',
      outlineDisabledHeavy: '#3a3a44',
      textDefault: '#e9e9ef',
      textNeutral: '#9ca3af',
      "color0": "#ebebf2",
      "color1": "#dddde4",
      "color2": "#cfcfd5",
      "color3": "#c1c1c7",
      "color4": "#b3b3b9",
      "color5": "#a5a5aa",
      "color6": "#97979c",
      "color7": "#89898e",
      "color8": "#7a7a80",
      "color9": "#6c6c71",
      "color10": "#5e5e63",
      "color11": "#505055",
      "color12": "#424246",
      "color13": "#343438",
      "color14": "#26262a",
      "color15": "#18181b",
      "color16": "#0a0a0d"
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

