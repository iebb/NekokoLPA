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

// Light theme: keep defaults, minor tweaks for border/shadow subtlety
const lightTheme = {
  ...defaultConfig.themes.light,
  borderColor: '#e6e6ea',
  shadowColor: 'rgba(0,0,0,0.06)',
  // Elevated row surface
  surfaceRow: '#ffffff',
}

// Dark theme: deeper background, improved contrast, professional accents
const darkTheme = {
  ...defaultConfig.themes.dark,
  // base surfaces
  background: '#0b0b0f',
  color: '#e9e9ef',
  // borders and shadows
  borderColor: '#2a2a34',
  shadowColor: 'rgba(0,0,0,0.35)',
  // accent and focus
  accentColor: '#a575f6',
  colorFocus: '#b58aff',
  // Elevated row surface - slightly lighter than background
  surfaceRow: '#16161d',
}

const config = createTamagui({
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
    light: lightTheme,
    dark: darkTheme,
  },
})

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config

