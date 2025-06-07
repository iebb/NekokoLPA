#!/bin/bash

rm outputs/apk/*
cd android
./gradlew app:clean app:assembleFlavor1Release
cp -fv app/build/outputs/apk/flavor1/release/*.apk ../outputs/apk/

cd ..
for filename in outputs/apk/*.apk; do
  java -jar signer/apksigner.jar sign --v1-signing-enabled --v2-signing-enabled --v3-signing-enabled=false \
       --ks signer/sakura_key/sakurasim.keystore --ks-pass pass:sakurasim \
       --next-signer --ks signer/CommunityKey/CommunityKey.jks -ks-pass pass:CommunityKey \
       --next-signer --ks signer/9esim_key/9eSIMCommunityKey.jks -ks-pass pass:147258369 \
      $filename

  stat -l $filename
done

rm outputs/ee.nekoko.*.apk

cp outputs/apk/app-flavor1-arm64-v8a-release.apk "outputs/9esim-arm64-v8a-$(jq .version package.json -r).apk"
# cp outputs/apk/app-multisign-universal-release.apk "outputs/ee.nekoko.nlpa.multisign-universal-$(jq .version package.json -r).apk"
