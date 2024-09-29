#!/usr/bin/env bash
rm outputs/apk/*
cd android && ./gradlew app:clean app:assembleMultisignRelease && cd ..
cp -fv android/app/build/outputs/apk/multisign/release/*.apk outputs/apk/
