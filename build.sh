#!/usr/bin/env bash
cd android && ./gradlew app:clean app:aR && ./gradlew bundle
cp -f ../android/app/build/outputs/apk/release/* outputs/apk/
cp -f ../android/app/build/outputs/bundle/release/* outputs/bundle/
cd ..
for filename in outputs/apk/*.apk; do
  java -jar signer/apksigner.jar sign --v1-signing-enabled --v2-signing-enabled --v3-signing-enabled=false \
       --ks signer/sakura_key/sakurasim.keystore --ks-pass pass:sakurasim --next-signer \
       --ks signer/CommunityKey/CommunityKey.jks -ks-pass pass:CommunityKey --next-signer \
       --ks signer/9esim_key/9eSIMCommunityKey.jks -ks-pass pass:147258369 $filename
  stat -l $filename
done
cp outputs/apk/app-arm64-v8a-release.apk "outputs/ee.nekoko.nlpa-arm64-v8a-$(jq .version package.json).apk"
cp outputs/apk/app-universal-release.apk "outputs/ee.nekoko.nlpa-universal-$(jq .version package.json).apk"
