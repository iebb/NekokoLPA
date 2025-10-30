import { createTamagui, createTokens } from '@tamagui/core'
import { createInterFont } from '@tamagui/font-inter'
import { shorthands } from '@tamagui/shorthands'
// Using require for React Native compatibility with subpath exports
// Metro bundler should resolve this with unstable_enablePackageExports enabled
// @ts-ignore - Metro resolves subpath exports at runtime
const defaultConfig = require('@tamagui/config').config;

const interFont = createInterFont()

const appTokens = createTokens({
  ...defaultConfig.tokens,
  size: {
    ...defaultConfig.tokens.size,
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 32,
  },
  space: {
    ...defaultConfig.tokens.space,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
  },
  // Keep default v4 color tokens - rely on theme overrides rather than custom keys
  color: {
    ...defaultConfig.tokens.color,
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    // Standard border radius values for consistency
    card: 12,      // Cards, modals, containers
    button: 8,     // Buttons
    tag: 999,      // Tags, chips, circular elements
    small: 4,      // Small elements
  },
  zIndex: {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
  },
})

// Default themes with default primary color (#a575f6)
import { generateTamaguiThemes } from '@/theme/tamaguiThemeGenerator'

const defaultPrimaryColor = '#a575f6'
const defaultThemes = generateTamaguiThemes(defaultPrimaryColor)

// Base themes structure - will be merged with generated themes
const baseLightTheme = {
  ...defaultConfig.themes.light,
  borderColor: '#e6e6ea',
  shadowColor: 'rgba(0,0,0,0.06)',
}

const baseDarkTheme = {
  ...defaultConfig.themes.dark,
  background: '#0b0b0f',
  color: '#e9e9ef',
  borderColor: '#2a2a34',
  shadowColor: 'rgba(0,0,0,0.35)',
}

// Merge base themes with generated themes
const lightTheme = {
  ...baseLightTheme,
  ...defaultThemes.light,
}

const darkTheme = {
  ...baseDarkTheme,
  ...defaultThemes.dark,
}

/**
 * Create a Tamagui config with custom primary color
 * @param primaryColor - Primary/accent color (hex string)
 */
export function createTamaguiConfigWithColor(primaryColor: string = defaultPrimaryColor) {
  const generatedThemes = generateTamaguiThemes(primaryColor)
  
  return createTamagui({
    // Use default animations from v4 config
    animations: defaultConfig.animations,
    defaultFont: 'body',
    fonts: {
      body: interFont,
      heading: interFont,
    },
    shouldAddPrefersColorThemes: true,
    themeClassNameOnRoot: true,
    shorthands,
    tokens: appTokens,
    themes: {
      light: {
        ...baseLightTheme,
        ...generatedThemes.light,
      },
      dark: {
        ...baseDarkTheme,
        ...generatedThemes.dark,
      },
    },
  })
}

const config = createTamaguiConfigWithColor(defaultPrimaryColor)

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config

