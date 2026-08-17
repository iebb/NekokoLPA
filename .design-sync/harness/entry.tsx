/**
 * Screen harness.
 *
 * Renders the app's real screens in a browser through react-native-web, so the
 * redesign can be compared against the prototype without building to a device
 * and without driving anyone's desktop.
 *
 * It is not a mock of the UI: the screens, store, theme and i18n are the real
 * modules. Only the two things a browser cannot provide are stubbed — the
 * adapter that talks to a card, and navigation.
 */
import '../stubs/env-shim';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {TamaguiProvider} from '@tamagui/core';
import {Theme, YStack} from 'tamagui';
import {NavigationContainer} from '@react-navigation/native';

import '../../src/i18n';
import {store} from '../../src/store';
import {setDeviceState, setInternalDevices, setTargetDevice} from '../../src/store/slices';
import {Adapters} from '../../src/lpa/adapters/registry';
import {createTamaguiConfigWithColor} from '../../tamagui.config';
import {DEFAULT_THEME_COLOR} from '../../src/shared/theme/presetColors';

import MainScreen from '../../src/features/main/MainScreen';
import SettingsScreen from '../../src/features/settings/SettingsScreen';
import {ScannerAuthentication} from '../../src/features/download/ScannerAuthentication';

const DEVICE_ID = 'ccid:reader';

/** Stands in for a connected reader. Only the fields the screens read. */
Adapters[DEVICE_ID] = {
  device: {
    deviceId: DEVICE_ID,
    deviceName: 'Generic EMV Smartcard Reader',
    displayName: 'Generic EMV reader',
    type: 'ccid',
    available: true,
    channel: '1',
    description: '',
    explicitConnectionRequired: false,
  },
  refresh: async () => true,
  processNotifications: async () => undefined,
} as any;

store.dispatch(setInternalDevices([DEVICE_ID]));
store.dispatch(setTargetDevice(DEVICE_ID));
store.dispatch(
  setDeviceState([
    {
      eid: '89044045216727494800000000169891',
      bytesFree: 1451840,
      euiccInfo2: {
        svn: '2.2.0',
        extCardResource: {freeNonVolatileMemory: 1451840, freeVolatileMemory: 20480},
        euiccCiPKIdListForSigning: [],
        euiccCiPKIdListForVerification: [],
      },
      profiles: [
        {
          iccid: '8944538523410512345',
          profileState: 1,
          profileName: 'AIMobile',
          serviceProviderName: 'AI Mobile',
          profileOwnerMccMnc: '310260',
        },
        {
          iccid: '8933150319912345678',
          profileState: 0,
          profileName: 'WEBBING',
          serviceProviderName: 'Truely',
          profileOwnerMccMnc: '20801',
        },
      ],
    } as any,
    DEVICE_ID,
  ]),
);

const config = createTamaguiConfigWithColor(DEFAULT_THEME_COLOR);

/** Navigation is stubbed: the harness renders one screen at a time. */
const nav: any = {
  navigate: () => {},
  goBack: () => {},
  openDrawer: () => {},
  addListener: () => () => {},
  setOptions: () => {},
};
const route: any = {params: {deviceId: DEVICE_ID}, key: 'k', name: 'Main'};

const SCREENS: Record<string, React.ReactNode> = {
  main: <MainScreen navigation={nav} route={route} />,
  settings: <SettingsScreen navigation={nav} route={route} />,
  confirm: (
    <ScannerAuthentication
      deviceId={DEVICE_ID}
      goBack={() => {}}
      confirmDownload={() => {}}
      initialConfirmationCode=""
      authenticateResult={{
        success: true,
        isCcRequired: false,
        _internal: {},
        profile: {
          iccid: '8944476500017422531',
          profileName: 'BetterRoaming',
          serviceProviderName: 'Speedtest Travel',
          profileOwnerMccMnc: '20408',
        },
      }}
    />
  ),
};

/** One device-sized frame, so proportions match the prototype's 420x840. */
function Frame({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center'}}>
      <div
        style={{
          font: "500 10.5px/1 ui-monospace, Menlo, monospace",
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#82858c',
        }}>
        {label}
      </div>
      <div
        style={{
          width: 420,
          height: 840,
          borderRadius: 22,
          overflow: 'hidden',
          boxShadow: '0 18px 44px rgba(20,22,30,.22)',
        }}>
        {children}
      </div>
    </div>
  );
}

function App() {
  const which = new URLSearchParams(window.location.search).get('screen') ?? 'main';
  return (
    <TamaguiProvider config={config}>
      <Theme name="dark">
        <Provider store={store}>
          <NavigationContainer>
            <Frame label={which}>
              <YStack flex={1} backgroundColor="$background">
                {SCREENS[which] ?? SCREENS.main}
              </YStack>
            </Frame>
          </NavigationContainer>
        </Provider>
      </Theme>
    </TamaguiProvider>
  );
}

try {
  createRoot(document.getElementById('root')!).render(<App />);
} catch (error: any) {
  document.body.innerHTML =
    '<pre style="color:#b00;font:12px ui-monospace;white-space:pre-wrap;padding:20px">' +
    String(error?.stack ?? error) +
    '</pre>';
}

window.addEventListener('error', event => {
  const pre = document.createElement('pre');
  pre.style.cssText = 'color:#b00;font:12px ui-monospace;white-space:pre-wrap;padding:20px';
  pre.textContent = String((event as any).error?.stack ?? event.message);
  document.body.appendChild(pre);
});
