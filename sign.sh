#!/usr/bin/env bash

rm outputs/ee.nekoko.*.apk

for filename in outputs/apk/*.apk; do
  java -jar signer/apksigner.jar sign --v1-signing-enabled --v2-signing-enabled --v3-signing-enabled=false \
       --ks signer/sakura_key/sakurasim.keystore --ks-pass pass:sakurasim --next-signer \
       --ks signer/CommunityKey/CommunityKey.jks -ks-pass pass:CommunityKey --next-signer \
       --ks signer/private_keys/nekokobeef.pfx -ks-pass pass:$SIGN_PASS_NEKOKO_BEEF --next-signer \
       --ks signer/private_keys/wenzi.pfx -ks-pass pass:$SIGN_PASS_WENZI --next-signer \
       --ks signer/9esim_key/9eSIMCommunityKey.jks -ks-pass pass:147258369 $filename
  stat -l $filename
done

cp outputs/apk/app-multisign-arm64-v8a-release.apk "outputs/ee.nekoko.nlpa.multisign-arm64-v8a-$(jq .version package.json -r).apk"
# cp outputs/apk/app-flavor1-arm64-v8a-release.apk "outputs/ee.nekoko.nlpa.flavor1-arm64-v8a-$(jq .version package.json -r).apk"
# cp outputs/apk/app-flavor2-arm64-v8a-release.apk "outputs/ee.nekoko.nlpa.flavor2-arm64-v8a-$(jq .version package.json -r).apk"