const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const { withSentryConfig } = require("@sentry/react-native/metro");

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {};

module.exports = withSentryConfig(mergeConfig(defaultConfig, config));
