#!/usr/bin/env bash

# Path to the Info.plist file
PLIST_FILE="./ios/NekokoLPA/Info.plist"

# Read the version and buildNumber from package.json
VERSION=$(jq -r .iOSVersion package.json)
BUILD_NUMBER=$(jq -r .buildVersion package.json)

# Update Info.plist with version and build number
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $VERSION" "$PLIST_FILE"
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NUMBER" "$PLIST_FILE"

echo "Updated Info.plist with version $VERSION and build number $BUILD_NUMBER"