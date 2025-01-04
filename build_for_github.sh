#!/usr/bin/env bash
rm outputs/apk/*
cd android && ./gradlew app:clean app:assembleMultisignRelease -PreactNativeArchitectures=arm64-v8a && cd ..
mkdir -p outputs/apk/
cp -fv android/app/build/outputs/apk/multisign/release/*.apk outputs/apk/

cd android && ./gradlew app:clean app:assembleFlavor1Release -PreactNativeArchitectures=arm64-v8a && cd ..
mkdir -p outputs/apk/
cp -fv android/app/build/outputs/apk/flavor1/release/*.apk outputs/apk/
