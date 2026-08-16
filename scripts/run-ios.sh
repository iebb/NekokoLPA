#!/bin/bash
#
# Build, install and launch the app on an iOS Simulator.
#
# This replaces `react-native run-ios`, which cannot complete on this project:
#
#  * It hard-requires a Gemfile and runs `bundle install` unless its own cache
#    is already warm. Apple's system Ruby cannot build native gem extensions on
#    current macOS, so that step fails even though a perfectly good CocoaPods
#    is on PATH.
#  * After building it derives the SDK by parsing its own build log and matches
#    destinations against every paired device. Stale pairings make xcodebuild
#    emit "Encountered a build number ... incompatible with DVTBuildVersion",
#    and the CLI then fails with "Failed to get build settings for your
#    project".
#
# Driving xcodebuild and simctl directly avoids both. Pass a simulator name as
# the first argument, or set SIM_NAME; otherwise the first booted simulator is
# used, falling back to the newest available iPhone.
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT=$(pwd)
WORKSPACE="$ROOT/ios/NekokoLPA.xcworkspace"
SCHEME="${SCHEME:-NekokoLPA}"
CONFIGURATION="${CONFIGURATION:-Debug}"
export LANG="${LANG:-en_US.UTF-8}"

# --- pick a simulator -------------------------------------------------------
SIM_NAME="${1:-${SIM_NAME:-}}"
if [ -n "$SIM_NAME" ]; then
  UDID=$(xcrun simctl list devices available -j \
    | python3 -c "import json,sys;d=json.load(sys.stdin)['devices'];print(next((x['udid'] for v in d.values() for x in v if x['name']=='$SIM_NAME'),''))")
  [ -n "$UDID" ] || { echo "No available simulator named '$SIM_NAME'." >&2; exit 1; }
else
  UDID=$(xcrun simctl list devices available -j \
    | python3 -c "import json,sys;d=json.load(sys.stdin)['devices'];b=[x for v in d.values() for x in v if x['state']=='Booted'];i=[x for v in d.values() for x in v if x['name'].startswith('iPhone')];print((b or i)[0]['udid'] if (b or i) else '')")
  [ -n "$UDID" ] || { echo "No available iOS simulator found." >&2; exit 1; }
fi
echo "==> Simulator $UDID"

# --- pods, only when out of sync -------------------------------------------
if ! diff -q "$ROOT/ios/Podfile.lock" "$ROOT/ios/Pods/Manifest.lock" >/dev/null 2>&1; then
  echo "==> pod install (Podfile.lock and Pods/Manifest.lock differ)"
  (cd "$ROOT/ios" && pod install)
fi

# --- build ------------------------------------------------------------------
echo "==> Building $SCHEME ($CONFIGURATION)"
DERIVED=$(mktemp -d)
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -destination "id=$UDID" \
  -derivedDataPath "$DERIVED" \
  CODE_SIGNING_ALLOWED=NO \
  build

APP=$(find "$DERIVED/Build/Products" -maxdepth 2 -name '*.app' -type d | head -1)
[ -n "$APP" ] || { echo "Build produced no .app bundle." >&2; exit 1; }
BUNDLE_ID=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$APP/Info.plist")
echo "==> Built $APP ($BUNDLE_ID)"

# --- Metro ------------------------------------------------------------------
if ! curl -s -o /dev/null "http://localhost:8081/status"; then
  echo "==> Starting Metro"
  (cd "$ROOT" && nohup npx react-native start >/dev/null 2>&1 &)
  for _ in $(seq 1 30); do
    curl -s -o /dev/null "http://localhost:8081/status" && break
    sleep 1
  done
fi

# --- install and launch -----------------------------------------------------
xcrun simctl bootstatus "$UDID" -b >/dev/null 2>&1 || xcrun simctl boot "$UDID" || true
open -a Simulator --args -CurrentDeviceUDID "$UDID" >/dev/null 2>&1 || true
echo "==> Installing"
xcrun simctl install "$UDID" "$APP"
echo "==> Launching $BUNDLE_ID"
xcrun simctl launch "$UDID" "$BUNDLE_ID"
echo "==> Running. Metro: http://localhost:8081"
