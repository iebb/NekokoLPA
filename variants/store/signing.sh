#!/bin/bash
APK_FILE=$1
if [ -z "$APK_FILE" ]; then
    echo "Usage: $0 <apk_file>"
    exit 1
fi

java -jar apksigner.jar sign --v1-signing-enabled --v2-signing-enabled --v3-signing-enabled=true \
  --ks signer/keys/community.jks --ks-pass pass:CommunityKey \
  "$APK_FILE"
