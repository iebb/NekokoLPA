#!/bin/bash

# This script generates a specific variant build.
# Usage: ./generate_variant.sh <variant_name> [build_command]
# Example: ./generate_variant.sh flavor1 "npm run android"

VARIANT=$1
BUILD_CMD=${2:-"./gradlew assembleRelease"}

if [ -z "$VARIANT" ]; then
    echo "Usage: $0 <variant_name> [build_command]"
    exit 1
fi

# Store the current state to revert later
./apply_variant.sh store > /dev/null

# Apply the requested variant
./apply_variant.sh "$VARIANT"

# Run build
if [[ "$BUILD_CMD" == *"gradlew"* ]]; then
    cd android && $BUILD_CMD && cd ..
else
    $BUILD_CMD
fi

# Revert to store
./apply_variant.sh store
