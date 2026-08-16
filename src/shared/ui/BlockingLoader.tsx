import React from 'react';
import {View} from 'react-native';
import {AlertTriangle, CheckCircle, Info} from '@tamagui/lucide-icons';
import {Card, Spinner, Text as TText, useTheme, XStack, YStack} from 'tamagui';

export type LoaderState = 'loading' | 'success' | 'error' | 'info' | 'warning';

export interface BlockingLoaderProps {
  visible?: boolean;
  title?: string;
  subtitle?: string;
  /** Backwards-compatible alias for `subtitle`. */
  message?: string;
  state?: LoaderState;
  /** Accepts either a 0–1 fraction or a 0–100 percentage. */
  progress?: number;
}

/** Normalises a 0–1 fraction or 0–100 percentage to an integer percentage. */
function toPercent(progress: number | undefined): number | undefined {
  if (progress === undefined || Number.isNaN(progress)) {
    return undefined;
  }
  const pct = progress <= 1 ? progress * 100 : progress;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

/**
 * Full-screen modal spinner that blocks interaction while a device operation
 * is in flight.
 */
export default function BlockingLoader({
  visible = true,
  title = 'Loading',
  subtitle,
  message,
  state = 'loading',
  progress,
}: BlockingLoaderProps) {
  const theme = useTheme();

  if (!visible) {
    return null;
  }

  const effectiveSubtitle = subtitle ?? message;
  const normalizedProgress = toPercent(progress);

  const stateColor = (() => {
    switch (state) {
      case 'error':
        return '#ff6b6b';
      case 'warning':
        return '#f5a524';
      case 'info':
        return theme.colorFocus?.val || theme.primaryColor?.val || theme.color?.val;
      default:
        return theme.primaryColor?.val || theme.color?.val;
    }
  })();

  const StateIcon = state === 'success' ? CheckCircle : state === 'error' ? AlertTriangle : Info;

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
      }}
      pointerEvents="auto"
      accessibilityLabel="Blocking Loader"
      accessible>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.35)',
        }}
      />

      <Card
        elevate
        bordered
        size="$4"
        backgroundColor={theme.surfaceRow?.val || theme.background?.val}
        borderColor={theme.borderColor?.val}
        borderRadius={12}
        padding={20}
        maxWidth={320}
        minWidth={260}>
        <YStack alignItems="center" gap={10}>
          {state !== 'loading' ? (
            <XStack alignItems="center" justifyContent="center">
              <StateIcon size={24} color={stateColor} />
            </XStack>
          ) : normalizedProgress === undefined ? (
            <Spinner size="large" color={stateColor} />
          ) : (
            <YStack width="100%" gap={6}>
              <View
                style={{
                  width: '100%',
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: theme.color0?.val,
                }}>
                <View
                  style={{
                    width: `${normalizedProgress}%`,
                    height: '100%',
                    borderRadius: 999,
                    backgroundColor: stateColor,
                  }}
                />
              </View>
              <TText fontSize={12} color="$color6" textAlign="center">
                {normalizedProgress}%
              </TText>
            </YStack>
          )}
          {title ? (
            <TText fontSize={16} fontWeight="700" color="$textDefault" textAlign="center">
              {title}
            </TText>
          ) : null}
          {effectiveSubtitle ? (
            <TText fontSize={13} color="$color6" textAlign="center">
              {effectiveSubtitle}
            </TText>
          ) : null}
        </YStack>
      </Card>
    </View>
  );
}
