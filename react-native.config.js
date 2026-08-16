/**
 * ML Kit is excluded from iOS builds by default.
 *
 * Two independent reasons, both outside our control:
 *
 * 1. Simulator on Apple Silicon. Google ships ML Kit as fat .frameworks whose
 *    arm64 slice is device-only — there is no arm64-simulator slice — so the
 *    ML Kit pods set `EXCLUDED_ARCHS[sdk=iphonesimulator*] = arm64`. That
 *    propagates to the aggregate Pods target, which then builds nothing for an
 *    arm64 simulator, and linking the app fails with
 *    "ld: library 'Pods-NekokoLPA' not found". `yarn ios` cannot work on an
 *    Apple Silicon Mac while ML Kit is installed.
 *
 * 2. Mac Catalyst. The same binaries have no maccatalyst slice at all, so a
 *    Catalyst build fails with "building for macCatalyst, but linking in
 *    object file built for iOS".
 *
 * The only feature lost on iOS is decoding a QR code from a saved image; the
 * button hides itself (see shared/utils/barcodeScanner.ts) and live camera
 * scanning goes through react-native-vision-camera, which is unaffected.
 * Android keeps ML Kit and the full feature set.
 *
 * Set RN_WITH_MLKIT=1 before `pod install` to force it back in — useful for an
 * iOS device or release build, where the device arm64 slice does exist and
 * neither problem applies.
 */
const includeMlKitOnIos = process.env.RN_WITH_MLKIT === '1';

module.exports = {
  project: {
    ios: {},
    android: {
      watchModeCommandParams: ['--mode', 'StoreDebug'],
    },
  },
  dependencies: includeMlKitOnIos
    ? {}
    : {'@react-native-ml-kit/barcode-scanning': {platforms: {ios: null}}},
  assets: [],
};
