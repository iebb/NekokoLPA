// Browser stub for react-native-reanimated.
//
// Reanimated's web build still reaches into react-native's Fabric internals to
// find host instances, which esbuild cannot parse. The harness compares static
// layout, so animations collapse to their final value: shared values are plain
// boxes and animated styles are returned as-is.
import React from 'react';
import {View} from 'react-native';

export const useSharedValue = <T,>(initial: T) => ({value: initial});
export const useAnimatedStyle = (factory: () => any) => {
  try {
    return factory() ?? {};
  } catch {
    return {};
  }
};
export const useDerivedValue = <T,>(factory: () => T) => ({value: factory()});
export const useAnimatedRef = () => ({current: null});
export const withTiming = <T,>(v: T) => v;
export const withSpring = <T,>(v: T) => v;
export const withDelay = <T,>(_d: number, v: T) => v;
export const withRepeat = <T,>(v: T) => v;
export const withSequence = <T,>(...v: T[]) => v[v.length - 1];
export const cancelAnimation = () => {};
export const runOnJS = (fn: any) => fn;
export const runOnUI = (fn: any) => fn;
export const interpolate = (v: number) => v;
export const interpolateColor = (_v: number, _i: number[], out: string[]) => out[0];
export const Easing = new Proxy({}, {get: () => () => 0}) as any;
export const createAnimatedComponent = (C: any) => C;
export const useAnimatedReaction = () => {};
export const useAnimatedScrollHandler = () => () => {};
export const useAnimatedGestureHandler = () => () => {};
export const useAnimatedProps = (factory: () => any) => {
  try {
    return factory() ?? {};
  } catch {
    return {};
  }
};
export const scrollTo = () => {};
export const measure = () => null;
export const makeMutable = <T,>(v: T) => ({value: v});
export const isSharedValue = () => false;

const Animated: any = {
  View,
  Text: require('react-native').Text,
  ScrollView: require('react-native').ScrollView,
  Image: require('react-native').Image,
  createAnimatedComponent,
};
export default Animated;
