
# <img width="32" height="32" src="https://github.com/user-attachments/assets/22ea9c6f-134e-43e9-8e45-5a683ea7722e" /> NekokoLPA 2 is now available.

The new NekokoLPA 2 does support Telephony API in addition to OMAPI on rooted devices, and now also works on Windows, macOS and Linux.

It will be open source in same MIT license in late 2026, pending codebase improvements.

Website: https://n.lpa.ee , or download here: https://github.com/iebb/NekokoLPA2/releases


# NekokoLPA 1

[日本語](./README_ja.md)

Android and iOS LPA App.

## Currently Supported Card Readers
* Internal OMAPI Slot on Android
* USD CCID readers on Android 
* USD CCID readers through CryptoTokenKit on iOS
* [ESTKme-RED dual-mode Card Reader](https://www.estk.me/product/estkme-red/?aid=nekoko)
* 9eSIM Legacy Bluetooth Card Reader (Firmware > 2.3.1)

## Google Play Variants

* [NekokoLPA App](https://play.google.com/store/apps/details?id=ee.nekoko.nlpa) for [ShiinaSekiu](https://github.com/ShiinaSekiu)'s Community Key
* [9eSIM App](https://play.google.com/store/apps/details?id=ee.nekoko.nlpa.flavor1) for [9eSIM removable cards](https://9es.im/)

## Development

```bash
yarn install
yarn pod-install   # iOS only
yarn android       # or: yarn ios
```

| Command | Purpose |
| --- | --- |
| `yarn type-check` | TypeScript, no emit |
| `yarn lint` / `yarn lint:fix` | ESLint |
| `yarn format` / `yarn format:check` | Prettier |
| `yarn build` | Build a variant (see `build_variant.sh`) |

`src/assets/config.json` and `src/assets/images/logo.png` are generated per
build flavour by `apply_variant.sh` and are intentionally not tracked in git.

### macOS (Mac Catalyst)

```bash
yarn macos
```

The iOS target also builds and runs as a Mac Catalyst app, including USB CCID
readers via CryptoTokenKit. Catalyst apps are always sandboxed, so every
capability is declared in `ios/NekokoLPA/NekokoLPA.entitlements` — notably
`com.apple.security.smartcard`, without which no reader is ever found.

The build is ad-hoc signed, so no developer certificate is needed.

### ML Kit and iOS

ML Kit ships fat frameworks whose arm64 slice is device-only, and no Catalyst
slice at all. That makes the aggregate Pods target unbuildable for an arm64
simulator (`ld: library 'Pods-NekokoLPA' not found`) and breaks Catalyst
linking outright, so it is excluded from iOS builds by default. The only
feature lost is decoding a QR code from a saved image — the button hides
itself, and live camera scanning is unaffected. Android keeps it.

To include it for an iOS device or release build:

```bash
cd ios && RN_WITH_MLKIT=1 pod install
```

### Project structure

```
src/
  app/         App root, navigation, and context providers
  features/    One folder per screen (main, profile, download, settings, …)
  lpa/         eSIM domain: device adapters, wasm bridge, native modules, types
  shared/      Reusable UI, hooks, storage, theme, and utilities
  store/       Redux store and slices
  data/        Static datasets (PLMN, MCC, profile sizes)
  i18n/        Translations
  assets/      Images and flags
```

Device support is added by implementing the `Device` interface in
`src/lpa/adapters/` and registering it in `src/lpa/deviceManager.ts`.

## About Other Cards

We are aware that several other eSIM brands have released applications derived from or modified versions of NekokoLPA.
Please note that these are unofficial builds. We are not affiliated with, nor responsible for, any third-party modifications, and we cannot provide support for them.

While the license permits use, copying, modification, merging, publication, distribution, sublicensing, and/or sale of the Software without limitation, we kindly remind all developers that the following condition must still be met:

> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
