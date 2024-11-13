#!/usr/bin/env bash
cd ..
rm outputs/apk/*
cd android
./gradlew bundleStoreRelease
cp -rv app/build/outputs/bundle/storeRelease/* ../outputs/bundle/

for filename in outputs/bundle/*.aab; do
  java -jar signer/apksigner.jar sign --v1-signing-enabled --v2-signing-enabled --v3-signing-enabled=false \
       --ks signer/CommunityKey/CommunityKey.jks -ks-pass pass:CommunityKey \
       --min-sdk-version 33 $filename
  stat -l $filename
done
