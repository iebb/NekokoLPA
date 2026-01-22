#!/bin/bash
set -e

# Usage: ./build_variant.sh <variant_name> [output_filename] [build_command]

VARIANT=$1
OUTPUT_NAME=${2:-"NekokoLPA-${VARIANT}.apk"}
# Default to release build
BUILD_CMD=${3:-"./gradlew assembleRelease"}

if [ -z "$VARIANT" ]; then
    echo "Usage: $0 <variant_name> [output_filename] [build_command]"
    exit 1
fi

echo "========================================"
echo "Building Variant: $VARIANT"
echo "Output: output/$OUTPUT_NAME"
echo "========================================"

# Verify variant exists
if [ ! -d "variants/$VARIANT" ]; then
    echo "Error: Variant directory 'variants/$VARIANT' not found."
    exit 1
fi

# Check prerequisites if check script exists
if [ -f "variants/$VARIANT/check.sh" ]; then
    echo "Running prerequisite check..."
    if ! bash "variants/$VARIANT/check.sh"; then
        echo "⚠ $VARIANT variant skipped (check failed)"
        exit 1
    fi
fi

# Generate and Build
# generate_variant.sh handles applying variant, building, and reverting
echo "Generating and building..."
./generate_variant.sh "$VARIANT" "$BUILD_CMD"

# Sign
if [ -f "variants/$VARIANT/signing.sh" ]; then
    echo "Signing APK..."
    ./variants/$VARIANT/signing.sh android/app/build/outputs/apk/release/app-arm64-v8a-release.apk
else
    echo "Info: No signing script found for $VARIANT. XML/APK signing skipped."
fi

# Output handling
mkdir -p output
if [ -f "android/app/build/outputs/apk/release/app-arm64-v8a-release.apk" ]; then
    mv android/app/build/outputs/apk/release/app-arm64-v8a-release.apk "output/$OUTPUT_NAME"
    echo "✓ $VARIANT variant built successfully: output/$OUTPUT_NAME"
else
    echo "Error: Build artifact not found!"
    exit 1
fi
