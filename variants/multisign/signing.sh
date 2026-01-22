#!/bin/bash
APK_FILE=$1
if [ -z "$APK_FILE" ]; then
    echo "Usage: $0 <apk_file>"
    exit 1
fi

java -jar apksigner.jar sign --v1-signing-enabled --v2-signing-enabled --v3-signing-enabled=false \
  --ks signer/keys/sakura.jks --ks-pass pass:sakurasim \
  --next-signer --ks signer/keys/community.jks --ks-pass pass:CommunityKey \
  --next-signer --ks signer/keys/9esim.jks --ks-pass pass:147258369 \
  --next-signer --ks signer/keys/nekokobeef.pfx --ks-pass pass:"$SIGN_PASS_NEKOKO_BEEF" \
  --next-signer --ks signer/keys/wenzi.jks --ks-pass pass:"$SIGN_PASS_WENZI" \
  "$APK_FILE"
