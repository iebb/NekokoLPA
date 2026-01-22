#!/bin/bash

# Exit if any command fails
set -e

# Xcode Cloud clones the repository and then runs this script from the ci_scripts directory.
# The current working directory is ios/ci_scripts.
# We need to go to the project root.
cd ../..

# 1. Install Node.js dependencies
# We use yarn as indicated by yarn.lock and package.json
corepack enable
yarn install

# 2. Apply the default variant 'store'
# This ensures project.pbxproj, Info.plist, etc. are correctly configured
# even if they weren't fully committed in the right state.
chmod +x apply_variant.sh
./apply_variant.sh store

# 3. Install CocoaPods
# Xcode Cloud has CocoaPods pre-installed.
cd ios
pod install
