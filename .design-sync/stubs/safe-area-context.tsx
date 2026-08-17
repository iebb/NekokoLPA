// Browser stub for design-sync previews. The real module reads native window
// insets; in a preview there is no notch, so zero insets are the honest value.
import React from 'react';

export const useSafeAreaInsets = () => ({top: 0, right: 0, bottom: 0, left: 0});
export const useSafeAreaFrame = () => ({x: 0, y: 0, width: 0, height: 0});
export const SafeAreaProvider = ({children}: {children?: React.ReactNode}) => <>{children}</>;
export const SafeAreaView = ({children}: {children?: React.ReactNode}) => <>{children}</>;
export const initialWindowMetrics = null;
