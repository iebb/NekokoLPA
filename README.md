
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

The iOS target also builds for Mac Catalyst. ML Kit ships iOS-only binary
frameworks with no Catalyst slice, so it has to be excluded:

```bash
cd ios && RN_EXCLUDE_MLKIT=1 pod install
```

Then build for the "My Mac (Mac Catalyst)" destination. The only feature lost
is decoding a QR code from a saved image; the button hides itself automatically.
USB CCID readers work through CryptoTokenKit, which requires the
`com.apple.security.smartcard` entitlement in `ios/NekokoLPA/NekokoLPA.entitlements` —
Catalyst apps are always sandboxed, so every capability is declared there.

Run `pod install` without the flag to restore ML Kit for iOS builds.

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
