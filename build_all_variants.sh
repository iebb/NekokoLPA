#!/bin/bash

# This script builds all variants found in variants/ directory.

set -e  # Exit on error

echo "Starting build for all variants..."
mkdir -p output

# Iterate over all directories in variants/
for variant_dir in variants/*/; do
    # Remove trailing slash
    variant_dir=${variant_dir%/}
    variant=$(basename "$variant_dir")
    
    if [ -d "variants/$variant" ]; then
        echo ""
        echo "Processing variant: $variant"
        
        # Use build_variant.sh to build the variant
        # We allow it to fail? The request didn't specify, but usually build all implies trying all.
        # However, set -e is active. If we want to continue, we use '|| true' or 'if'.
        
        if ./build_variant.sh "$variant" "NekokoLPA-${variant}.apk"; then
            echo "✓ $variant finished"
        else
            echo "⚠ $variant failed to build"
            # Decide if we want to fail the whole build or just report
            # exit 1 
        fi
    fi
done

echo ""
echo "All builds complete."
ls -lh output/*.apk 2>/dev/null || echo "No APKs found in output/"
