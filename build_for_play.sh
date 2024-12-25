#!/usr/bin/env bash
cd android

./gradlew bundleStoreRelease
./gradlew bundleFlavor1Release

cd ..

mkdir -p outputs/bundle/
mkdir -p outputs/bundle-flavor1/

cp -rv android/app/build/outputs/bundle/storeRelease/* outputs/bundle/
cp -rv android/app/build/outputs/bundle/flavor1Release/* outputs/bundle-flavor1/

for filename in outputs/bundle/*.aab; do
  java -jar signer/apksigner.jar sign --v1-signing-enabled --v2-signing-enabled --v3-signing-enabled=false \
       --ks signer/CommunityKey/CommunityKey.jks -ks-pass pass:CommunityKey \
       --min-sdk-version 33 $filename
  stat -l $filename
done

for filename in outputs/bundle-flavor1/*.aab; do
  java -jar signer/apksigner.jar sign --v1-signing-enabled --v2-signing-enabled --v3-signing-enabled=false \
       --ks signer/9esim_key/9eSIMCommunityKey.jks -ks-pass pass:147258369 \
       --min-sdk-version 33 $filename
  stat -l $filename
done
