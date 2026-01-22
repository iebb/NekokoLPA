#!/bin/bash
if [ -z "$SIGN_PASS_NEKOKO_BEEF" ] || [ -z "$SIGN_PASS_WENZI" ]; then
    echo "Skipping Multisign variant: SIGN_PASS_NEKOKO_BEEF or SIGN_PASS_WENZI not set."
    exit 1
fi
exit 0
