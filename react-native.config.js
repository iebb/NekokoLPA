/**
 * ML Kit ships as vendored binary frameworks with iOS-only slices (verified
 * with lipo: x86_64 + arm64 iOS, no maccatalyst variant), so linking it into a
 * Mac Catalyst build fails with "building for macCatalyst, but linking in
 * object file built for iOS". It cannot be recompiled, only excluded.
 *
 * Set RN_EXCLUDE_MLKIT=1 before `pod install` for Catalyst builds. The only
 * feature lost is decoding a QR code from a picked image; live camera scanning
 * goes through react-native-vision-camera and is unaffected.
 */
const excludeMlKit = process.env.RN_EXCLUDE_MLKIT === '1';

module.exports = {
  project: {
    ios: {},
    android: {
      watchModeCommandParams: ['--mode', 'StoreDebug'],
    },
  },
  dependencies: excludeMlKit
    ? {'@react-native-ml-kit/barcode-scanning': {platforms: {ios: null}}}
    : {},
  assets: [],
};
