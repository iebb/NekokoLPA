var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { createTamagui, createTokens } from '@tamagui/core';
import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';
// Using require for React Native compatibility with subpath exports
// Metro bundler should resolve this with unstable_enablePackageExports enabled
// @ts-ignore - Metro resolves subpath exports at runtime
var defaultConfig = require('@tamagui/config').config;
var interFont = createInterFont();
var appTokens = createTokens(__assign(__assign({}, defaultConfig.tokens), { size: __assign(__assign({}, defaultConfig.tokens.size), { xs: 10, sm: 12, md: 14, lg: 16, xl: 18, '2xl': 20, '3xl': 24, '4xl': 32 }), space: __assign(__assign({}, defaultConfig.tokens.space), { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40 }), 
    // Keep default v4 color tokens - rely on theme overrides rather than custom keys
    color: __assign({}, defaultConfig.tokens.color), radius: {
        0: 0,
        1: 4,
        2: 8,
        3: 12,
        4: 16,
        5: 20,
        // Standard border radius values for consistency
        card: 12, // Cards, modals, containers
        button: 8, // Buttons
        tag: 999, // Tags, chips, circular elements
        small: 4, // Small elements
    }, zIndex: {
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
    } }));
// Default themes with default primary color (#a575f6)
import { generateTamaguiThemes } from '@/theme/tamaguiThemeGenerator';
var defaultPrimaryColor = '#a575f6';
var defaultThemes = generateTamaguiThemes(defaultPrimaryColor);
// Base themes structure - will be merged with generated themes
var baseLightTheme = __assign(__assign({}, defaultConfig.themes.light), { borderColor: '#e6e6ea', shadowColor: 'rgba(0,0,0,0.06)' });
var baseDarkTheme = __assign(__assign({}, defaultConfig.themes.dark), { background: '#0b0b0f', color: '#e9e9ef', borderColor: '#2a2a34', shadowColor: 'rgba(0,0,0,0.35)' });
/**
 * Create a Tamagui config with custom primary color
 * @param primaryColor - Primary/accent color (hex string)
 */
export function createTamaguiConfigWithColor(primaryColor) {
    if (primaryColor === void 0) { primaryColor = defaultPrimaryColor; }
    var generatedThemes = generateTamaguiThemes(primaryColor);
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
        shorthands: shorthands,
        tokens: appTokens,
        themes: {
            light: __assign(__assign({}, baseLightTheme), generatedThemes.light),
            dark: __assign(__assign({}, baseDarkTheme), generatedThemes.dark),
        },
    });
}
var config = createTamaguiConfigWithColor(defaultPrimaryColor);
export default config;
