#!/usr/bin/env bash
cp -f ../android/app/build/outputs/apk/release/app-arm64-v8a-release.apk app-arm64-v8a-signed.apk
java -jar apksigner.jar sign --v1-signing-enabled --v2-signing-enabled --v3-signing-enabled=false \
     --ks sakura_key/sakurasim.keystore --ks-pass pass:sakurasim --next-signer \
     --ks CommunityKey/CommunityKey.jks -ks-pass pass:CommunityKey --next-signer \
     --ks 9esim_key/9eSIMCommunityKey.jks -ks-pass pass:147258369 app-arm64-v8a-signed.apk
stat -l app-arm64-v8a-signed.apk
rm ee.nekoko.nlpa-*.apk
mv app-arm64-v8a-signed.apk "ee.nekoko.nlpa-$(date +%y%m%d%H%M).apk"