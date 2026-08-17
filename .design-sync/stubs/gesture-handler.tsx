// Browser stub for react-native-gesture-handler.
//
// Its native entry reaches into react-native's Fabric internals, which are Flow
// source that esbuild cannot parse. The harness only needs the pieces the
// screens compose with, and a swipe row degrades to its content — the harness
// is for comparing layout, not gestures.
import React from 'react';
import {FlatList as RNFlatList, RefreshControl as RNRefreshControl, ScrollView as RNScrollView, View} from 'react-native';

export const FlatList = RNFlatList;
export const RefreshControl = RNRefreshControl;
export const ScrollView = RNScrollView;
export const GestureHandlerRootView = ({children, style}: any) => (
  <View style={style}>{children}</View>
);
export const Swipeable = ({children}: any) => <>{children}</>;
export const TouchableOpacity = require('react-native').TouchableOpacity;
export const Gesture = {} as any;
export const State = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
} as const;
export const PanGestureHandler = ({children}: any) => <>{children}</>;
export const TapGestureHandler = ({children}: any) => <>{children}</>;
export const LongPressGestureHandler = ({children}: any) => <>{children}</>;
export const Directions = {RIGHT: 1, LEFT: 2, UP: 4, DOWN: 8} as const;
export const GestureDetector = ({children}: any) => <>{children}</>;
export default {};
