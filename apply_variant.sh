#!/bin/bash

# This script applies a variant's configuration and assets to the project.
# Usage: ./apply_variant.sh <variant_name>
# Example: ./apply_variant.sh flavor1

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

# 1. Replace config.json
cp "variants/$VARIANT/config.json" "src/assets/config.json"

# 1.5 Replace App Logo
if [ -f "variants/$VARIANT/logo.png" ]; then
    cp "variants/$VARIANT/logo.png" "src/assets/images/logo.png"
fi

# 2. Replace Android icons
cp -R variants/$VARIANT/res/* android/app/src/main/res/

# 2.5 Replace splash screen with logo
cp "variants/$VARIANT/res/mipmap-xxxhdpi/ic_launcher.png" "android/app/src/main/res/drawable/turtle_card.png"

# 3. Update Android app name and ID
APP_TITLE=$(cat "variants/$VARIANT/config.json" | grep -o '"appTitle": "[^"]*' | cut -d'"' -f4)
APP_ID=$(cat "variants/$VARIANT/config.json" | grep -o '"appId": "[^"]*' | cut -d'"' -f4)

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/appLabel: '[^']*'/appLabel: '$APP_TITLE'/g" android/app/build.gradle
  sed -i '' "s/applicationId \"[^\"]*\"/applicationId \"$APP_ID\"/g" android/app/build.gradle
  if [ "$VARIANT" == "flavor1" ]; then
    sed -i '' "s/versionNameSuffix \"-debug\"/versionNameSuffix \"-9e\"/g" android/app/build.gradle
  else
    sed -i '' "s/versionNameSuffix \"-9e\"/versionNameSuffix \"-debug\"/g" android/app/build.gradle
  fi
else
  sed -i "s/appLabel: '[^']*'/appLabel: '$APP_TITLE'/g" android/app/build.gradle
  sed -i "s/applicationId \"[^\"]*\"/applicationId \"$APP_ID\"/g" android/app/build.gradle
  if [ "$VARIANT" == "flavor1" ]; then
    sed -i "s/versionNameSuffix \"-debug\"/versionNameSuffix \"-9e\"/g" android/app/build.gradle
  else
    sed -i "s/versionNameSuffix \"-9e\"/versionNameSuffix \"-debug\"/g" android/app/build.gradle
  fi
fi

echo "Variant $VARIANT applied successfully."
