// Preview wrapper for design-sync cards, wired via cfg.provider.
//
// Every component in src/shared/ui reads Tamagui theme values (theme.primaryColor,
// $textDefault, $surfaceRow …). Outside a TamaguiProvider those resolve to
// undefined and the card renders as unstyled boxes, so this mirrors what
// src/app/App.tsx does at runtime: build the config from the accent colour, then
// pin a scheme with <Theme>.
//
// The accent is DEFAULT_THEME_COLOR rather than a stored preference: previews
// have no MMKV, and the default is what a new install shows.
import React from 'react';
import {TamaguiProvider} from '@tamagui/core';
import {Theme, YStack} from 'tamagui';
import {PortalProvider} from '@tamagui/portal';

// Side-effect import: initializes i18next the way src/app/App.tsx does. Without
// it useTranslation has no resources loaded and every label renders as its raw
// key (`main:profile_name`) instead of its English text. It resolves the locale
// from preferences, which the MMKV stub backs with an empty map, so previews
// fall through to the 'en' default.
import '../src/i18n';

import {createTamaguiConfigWithColor} from '../tamagui.config';
import {DEFAULT_THEME_COLOR} from '../src/shared/theme/presetColors';

const config = createTamaguiConfigWithColor(DEFAULT_THEME_COLOR);

// The YStack is not decoration. Every component here draws with theme colours
// ($textDefault is near-white in the dark scheme) and assumes the app has
// already painted $background behind it. On a preview card's default white
// surface that renders white-on-white, so the wrapper supplies the surface the
// components are designed against.
export function DSProvider({children}: {children?: React.ReactNode}) {
  return (
    <TamaguiProvider config={config}>
      <Theme name="dark">
        {/* AppSheet's modal Sheet mounts into a portal host; without one the
            sheet frame collapses to an empty bar. App.tsx wraps the app the
            same way. */}
        <PortalProvider shouldAddRootHost>
          <YStack backgroundColor="$background" padding={16} width="100%" minHeight="100%">
            {children}
          </YStack>
        </PortalProvider>
      </Theme>
    </TamaguiProvider>
  );
}

export default DSProvider;
