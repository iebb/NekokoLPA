// `react-native` for the browser: react-native-web, plus the few Android-only
// APIs it does not implement.
//
// react-native-web covers View/Text/Image/StyleSheet/Pressable/etc., which is
// everything the shared UI layer draws with. It deliberately omits platform
// modules that have no web equivalent — ToastAndroid is the one this codebase
// reaches for (MetadataView, on copy-to-clipboard). Importing it from RNW is a
// hard bundle error, so it is supplied here as an inert stand-in: a preview has
// no toast surface, and the copy path is not what the card is demonstrating.
export * from 'react-native-web';

// The app resolves its native LPA module through TurboModuleRegistry, which
// react-native-web has no equivalent for — reading `.get` off the missing
// export is what stopped every screen from mounting. Returning null lets
// nativeModules.ts fall through to its "module unavailable" path, which is the
// truthful state in a browser.
export const TurboModuleRegistry = {
  get: (_name: string) => null,
  getEnforcing: (_name: string) => null,
};

export const ToastAndroid = {
  SHORT: 0,
  LONG: 1,
  TOP: 0,
  BOTTOM: 1,
  CENTER: 2,
  show: (_message: string, _duration: number) => {},
  showWithGravity: (_message: string, _duration: number, _gravity: number) => {},
  showWithGravityAndOffset: (
    _message: string,
    _duration: number,
    _gravity: number,
    _xOffset: number,
    _yOffset: number,
  ) => {},
};
