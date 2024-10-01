#!/usr/bin/env bash

for filename in outputs/apk/*.apk; do
  java -jar signer/apksigner.jar sign --v1-signing-enabled --v2-signing-enabled --v3-signing-enabled=false \
       --ks signer/sakura_key/sakurasim.keystore --ks-pass pass:sakurasim --next-signer \
       --ks signer/CommunityKey/CommunityKey.jks -ks-pass pass:CommunityKey --next-signer \
       --ks signer/private_keys/nekokobeef.pfx -ks-pass pass:$SIGN_PASS_NEKOKO_BEEF --next-signer \
       --ks signer/9esim_key/9eSIMCommunityKey.jks -ks-pass pass:147258369 $filename
  stat -l $filename
done

rm outputs/ee.nekoko.*.apk

cp outputs/apk/app-multisign-arm64-v8a-release.apk "outputs/ee.nekoko.nlpa.multisign-arm64-v8a-$(jq .version package.json -r).apk"
cp outputs/apk/app-multisign-x86_64-release.apk "outputs/ee.nekoko.nlpa.multisign-x86_64-$(jq .version package.json -r).apk"
