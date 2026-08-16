#!/bin/bash
#
# Build, sign and launch the app as a Mac Catalyst app.
#
# Catalyst apps are always sandboxed, so the capabilities the app needs are
# declared in ios/NekokoLPA/NekokoLPA.entitlements — in particular
# com.apple.security.smartcard, without which TKSmartCardSlotManager.default
# returns nil and no CCID reader is ever found.
#
# The build is unsigned (CODE_SIGNING_ALLOWED=NO) and then ad-hoc signed here,
# so no developer certificate is required.
#
# It is launched with `open`, i.e. through LaunchServices. Do not "optimise"
# this into running Contents/MacOS/NekokoLPA directly: exec'ing the binary from
# a shell makes that shell the TCC *responsible process*, so macOS checks the
# shell's Info.plist for usage descriptions instead of the app's and kills the
# app on the first privacy-gated call — Bluetooth, camera or photo library —
# with "must contain an NSBluetoothAlwaysUsageDescription key", no matter what
# the app's own plist says. Clearing the quarantine attribute below is what
# keeps Gatekeeper quiet for an ad-hoc signature.
#
# ML Kit is excluded from iOS/Catalyst builds by default (see
# react-native.config.js): its binaries have no maccatalyst slice at all.
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT=$(pwd)
WORKSPACE="$ROOT/ios/NekokoLPA.xcworkspace"
SCHEME="${SCHEME:-NekokoLPA}"
CONFIGURATION="${CONFIGURATION:-Debug}"
ENTITLEMENTS="$ROOT/ios/NekokoLPA/NekokoLPA.entitlements"
export LANG="${LANG:-en_US.UTF-8}"

if ! diff -q "$ROOT/ios/Podfile.lock" "$ROOT/ios/Pods/Manifest.lock" >/dev/null 2>&1; then
  echo "==> pod install (Podfile.lock and Pods/Manifest.lock differ)"
  (cd "$ROOT/ios" && pod install)
fi

echo "==> Building $SCHEME for Mac Catalyst ($CONFIGURATION)"
DERIVED=$(mktemp -d)
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -destination "platform=macOS,variant=Mac Catalyst,arch=$(uname -m)" \
  -derivedDataPath "$DERIVED" \
  CODE_SIGNING_ALLOWED=NO \
  build

APP=$(find "$DERIVED/Build/Products" -maxdepth 2 -name '*.app' -type d | head -1)
[ -n "$APP" ] || { echo "Build produced no .app bundle." >&2; exit 1; }

# Sign inside-out: nested code first, then the bundle with its entitlements.
echo "==> Ad-hoc signing"
find "$APP/Contents/Frameworks" -maxdepth 1 -name '*.framework' 2>/dev/null | while read -r fw; do
  codesign --force --sign - "$fw" >/dev/null 2>&1 || true
done
find "$APP/Contents" -name '*.dylib' 2>/dev/null | while read -r dylib; do
  codesign --force --sign - "$dylib" >/dev/null 2>&1 || true
done
codesign --force --sign - --entitlements "$ENTITLEMENTS" "$APP" >/dev/null 2>&1
xattr -dr com.apple.quarantine "$APP" 2>/dev/null || true

if ! curl -s -o /dev/null "http://localhost:8081/status"; then
  echo "==> Starting Metro"
  (cd "$ROOT" && nohup npx react-native start >/dev/null 2>&1 &)
  for _ in $(seq 1 30); do
    curl -s -o /dev/null "http://localhost:8081/status" && break
    sleep 1
  done
fi

echo "==> Launching $APP"
pkill -f "MacOS/$SCHEME" 2>/dev/null || true
open -a "$APP"
echo "==> Running. Metro: http://localhost:8081"
echo "    Logs: /usr/bin/log stream --process $SCHEME --level debug"
