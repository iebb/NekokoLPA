const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Enable package.json exports field resolution
    unstable_enablePackageExports: true,
  },
};

module.exports = mergeConfig(defaultConfig, config);
