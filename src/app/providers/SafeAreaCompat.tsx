import React, {PropsWithChildren, useMemo} from 'react';
import {Dimensions, Platform, StyleProp, View, ViewStyle} from 'react-native';
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

/**
 * SafeAreaProvider that degrades gracefully on Mac Catalyst.
 *
 * react-native-safe-area-context's native RNCSafeAreaProvider emits its
 * onInsetsChange through the legacy (paper) event path when running as a Mac
 * Catalyst app, even though its Fabric component view is compiled and
 * registered. Under bridgeless there is no paper renderer to receive that, so
 * the call lands on an unregistered `RCTEventEmitter` and takes the whole app
 * down at startup with:
 *
 *   Failed to call into JavaScript module method RCTEventEmitter.receiveEvent().
 *   Module has not been registered as callable.
 *
 * A Mac window has no notch, status bar or home indicator, so the insets are
 * always zero there. Supplying the contexts directly gives every
 * useSafeAreaInsets() / useSafeAreaFrame() consumer correct values without
 * mounting the native view at all. iOS, Android and tvOS keep the real
 * provider and are completely unaffected.
 */
export default function SafeAreaCompatProvider({
  children,
  style,
}: PropsWithChildren<{style?: StyleProp<ViewStyle>}>) {
  const isCatalyst = Platform.OS === 'ios' && Platform.isMacCatalyst === true;

  const insets = useMemo(() => ({top: 0, right: 0, bottom: 0, left: 0}), []);
  const frame = useMemo(() => {
    const {width, height} = Dimensions.get('window');
    return {x: 0, y: 0, width, height};
  }, []);

  if (!isCatalyst) {
    return <SafeAreaProvider style={style}>{children}</SafeAreaProvider>;
  }

  return (
    <View style={[{flex: 1}, style]}>
      <SafeAreaFrameContext.Provider value={frame}>
        <SafeAreaInsetsContext.Provider value={insets}>{children}</SafeAreaInsetsContext.Provider>
      </SafeAreaFrameContext.Provider>
    </View>
  );
}
