import { getColorTint, isDarkColor } from './colorUtils';

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

  // Generate button foreground color
  // If primary is dark, get lighter tint (80), otherwise darker tint (20)
  const buttonForeground = getColorTint(primaryColor, isPrimaryDark ? 80 : 20);

  // btnBackground is the accentColor (theme color)
  // Generate foreground for btnBackground (white if dark, black if light)
  const isBtnBackgroundDark = isDarkColor(primaryColor);
  const btnForeground = isBtnBackgroundDark ? '#ffffff' : '#000000';

  // btnAltBackground is the muted/inverted tinted color (tint at 70) - for non-arrange mode arrange button
  const btnAltBackground = baseTheme === 'light' ? '#c5c5c5' : '#252525';

  // Generate foreground for btnAltBackground (white if dark, black if light)
  const isBtnAltBackgroundDark = isDarkColor(btnAltBackground);
  const btnAltForeground = isBtnAltBackgroundDark ? '#ffffff' : '#000000';

  const baseLightBackground = '#ffffff';
  // Swap background and row background for light theme:
  // make page background slightly tinted, and row surfaces pure white
  const baseLightTheme = {
    background: getColorTint(baseLightBackground, 4),
    color: '#000000',
    borderColor: '#e6e6ea',
    shadowColor: 'rgba(0,0,0,0.06)',
    surfaceRow: '#ffffff',
    // keep special surfaces pure white to appear lighter than page bg
    surfaceSpecial: '#ffffff',
  };

  const baseDarkBackground = '#0b0b0f';
  const baseDarkTheme = {
    background: baseDarkBackground,
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
      accentColor: primaryColor,
      colorFocus: getColorTint(primaryColor, isPrimaryDark ? 75 : 30),
      // Button colors
      buttonBackground: primaryColor,
      buttonForeground: buttonForeground,
      // Primary button colors (for notification and plus buttons) - same as accentColor
      btnBackground: primaryColor, // Same as accentColor
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
      color2: '#f9fafb',
      color7: '#e5e7eb',
      color10: '#9ca3af',
      color11: '#6b7280',
    };
  } else {
    // Dark theme
    return {
      ...baseDarkTheme,
      accentColor: primaryColor,
      colorFocus: getColorTint(primaryColor, isPrimaryDark ? 85 : 25),
      // Button colors
      buttonBackground: primaryColor,
      buttonForeground: buttonForeground,
      // Primary button colors (for notification and plus buttons) - same as accentColor
      btnBackground: primaryColor, // Same as accentColor
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
      color2: '#16161d', // surfaceRow in dark mode
      color7: '#09090c',
      color10: '#6b7280',
      color11: '#9ca3af',
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

