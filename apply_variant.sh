#!/bin/bash

# This script applies a variant's configuration and assets to the project.
# Usage: ./apply_variant.sh <variant_name>

VARIANT=$1
if [ -z "$VARIANT" ]; then
    echo "Usage: $0 <variant_name>"
    echo "Available variants: store, flavor1, multisign"
    exit 1
fi

if [ ! -d "variants/$VARIANT" ]; then
    echo "Error: Variant '$VARIANT' does not exist in variants/ folder."
    exit 1
fi

echo "Applying variant: $VARIANT"

VARIANT_CONFIG="variants/$VARIANT/config.json"

# Helper to read json value
get_config_value() {
    local key=$1
    local file=$2
    # Simple grep for "key": "value" pattern
    grep -o "\"$key\": \"[^\"]*" "$file" | cut -d'"' -f4
}

APP_TITLE=$(get_config_value "appTitle" "$VARIANT_CONFIG")
APP_ID=$(get_config_value "appId" "$VARIANT_CONFIG")
IOS_TEAM_ID=$(get_config_value "iOSTeamId" "$VARIANT_CONFIG")
IOS_APP_ID=$(get_config_value "iOSAppId" "$VARIANT_CONFIG")
VERSION_SUFFIX=$(get_config_value "versionSuffix" "$VARIANT_CONFIG")

# Fallbacks
if [ -z "$IOS_TEAM_ID" ]; then IOS_TEAM_ID="9733K94JUG"; fi
if [ -z "$IOS_APP_ID" ]; then IOS_APP_ID="$APP_ID"; fi
if [ -z "$VERSION_SUFFIX" ]; then VERSION_SUFFIX="-debug"; fi

# 1. Replace config.json
cp "$VARIANT_CONFIG" "src/assets/config.json"

# 1.5 Replace App Logo (Source Tree)
if [ -f "variants/$VARIANT/logo.png" ]; then
    cp "variants/$VARIANT/logo.png" "src/assets/images/logo.png"
fi

# 2. Replace Android icons
cp -R variants/$VARIANT/res/* android/app/src/main/res/

# 2.5 Replace splash screen with logo
if [ -f "variants/$VARIANT/res/mipmap-xxxhdpi/ic_launcher.png" ]; then
    cp "variants/$VARIANT/res/mipmap-xxxhdpi/ic_launcher.png" "android/app/src/main/res/drawable/turtle_card.png"
fi

# 3. Update Android app name and ID
echo "Updating Android config: $APP_ID, suffix: $VERSION_SUFFIX"
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/appLabel: '[^']*'/appLabel: '$APP_TITLE'/g" android/app/build.gradle
  sed -i '' "s/applicationId \"[^\"]*\"/applicationId \"$APP_ID\"/g" android/app/build.gradle
  sed -i '' "s/versionNameSuffix \"[^\"]*\"/versionNameSuffix \"$VERSION_SUFFIX\"/g" android/app/build.gradle
else
  sed -i "s/appLabel: '[^']*'/appLabel: '$APP_TITLE'/g" android/app/build.gradle
  sed -i "s/applicationId \"[^\"]*\"/applicationId \"$APP_ID\"/g" android/app/build.gradle
  sed -i "s/versionNameSuffix \"[^\"]*\"/versionNameSuffix \"$VERSION_SUFFIX\"/g" android/app/build.gradle
fi

# 4. Update iOS Configuration
echo "Updating iOS config: Team $IOS_TEAM_ID, ID $IOS_APP_ID"

# Sources
PLIST_SRC="variants/$VARIANT/ios/Info.plist"
ICON_SRC="variants/$VARIANT/ios/AppIcon.appiconset"
SPLASH_SRC="variants/$VARIANT/ios/SplashIcon.imageset"

# Fallbacks
if [ ! -f "$PLIST_SRC" ]; then PLIST_SRC="variants/store/ios/Info.plist"; fi
if [ ! -d "$ICON_SRC" ]; then ICON_SRC="variants/store/ios/AppIcon.appiconset"; fi
if [ ! -d "$SPLASH_SRC" ]; then SPLASH_SRC="variants/store/ios/SplashIcon.imageset"; fi

# Apply Plist
if [ -f "$PLIST_SRC" ]; then
    cp "$PLIST_SRC" "ios/NekokoLPA/Info.plist"
else
    echo "Warning: Info.plist source not found ($PLIST_SRC)."
fi

# Apply Icons
if [ -d "$ICON_SRC" ]; then
    rm -rf "ios/NekokoLPA/Images.xcassets/AppIcon.appiconset"
    cp -R "$ICON_SRC" "ios/NekokoLPA/Images.xcassets/AppIcon.appiconset"
fi

# Apply Splash
if [ -d "$SPLASH_SRC" ]; then
    rm -rf "ios/NekokoLPA/Images.xcassets/SplashIcon.imageset"
    cp -R "$SPLASH_SRC" "ios/NekokoLPA/Images.xcassets/SplashIcon.imageset"
fi

# Update Project Settings (Team, BundleID, normalized paths)
if [[ "$OSTYPE" == "darwin"* ]]; then
    PBXPROJ="ios/NekokoLPA.xcodeproj/project.pbxproj"
    
    # Set Team
    if [ -n "$IOS_TEAM_ID" ]; then
        sed -i '' "s/DEVELOPMENT_TEAM = [^;]*;/DEVELOPMENT_TEAM = $IOS_TEAM_ID;/g" "$PBXPROJ"
    fi
    
    # Set Bundle ID
    if [ -n "$IOS_APP_ID" ]; then
        sed -i '' "s/PRODUCT_BUNDLE_IDENTIFIER = [^;]*;/PRODUCT_BUNDLE_IDENTIFIER = $IOS_APP_ID;/g" "$PBXPROJ"
    fi

    # Normalize Info.plist and Icon Name usage 
    sed -i '' "s/INFOPLIST_FILE = .*.plist;/INFOPLIST_FILE = NekokoLPA\/Info.plist;/g" "$PBXPROJ"
    sed -i '' "s/ASSETCATALOG_COMPILER_APPICON_NAME = .*/ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;/g" "$PBXPROJ"
    
    # Update Display Name in Info.plist (which is now the replaced one)
    if [ -n "$APP_TITLE" ]; then
        if [ -f "ios/NekokoLPA/Info.plist" ]; then
             /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName $APP_TITLE" ios/NekokoLPA/Info.plist 2>/dev/null || echo "Info.plist update failed"
        fi
    fi
fi

echo "Variant $VARIANT applied successfully."
