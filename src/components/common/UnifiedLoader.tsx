import React from 'react';
import { View } from 'react-native';
import { Spinner, YStack, XStack, Text as TText, Progress, useTheme, Card } from 'tamagui';

type LoaderVariant = 'circular' | 'linear';

type UnifiedLoaderProps = {
  visible?: boolean;
  text?: string;
  subtext?: string;
  determinate?: boolean; // if true uses progress (0-100) when provided
  progress?: number; // 0..100
  variant?: LoaderVariant; // circular or linear
  overlay?: boolean; // render overlay above content
  compact?: boolean; // smaller size for inline placements
};

export default function UnifiedLoader({
  visible = true,
  text,
  subtext,
  determinate = false,
  progress,
  variant = 'circular',
  overlay = false,
  compact = false,
}: UnifiedLoaderProps) {
  const theme = useTheme();
  if (!visible) return null;

  const content = (
    <YStack alignItems="center" justifyContent="center" gap={compact ? 6 : 10}>
      {variant === 'circular' ? (
        determinate && typeof progress === 'number' ? (
          <XStack alignItems="center" gap={8}>
            <Spinner size={compact ? 'small' : 'large'} color={theme.accentColor?.val || theme.color?.val} />
            <TText color="$textDefault" fontSize={compact ? 12 : 14}>{Math.round(progress)}%</TText>
          </XStack>
        ) : (
          <Spinner size={compact ? 'small' : 'large'} color={theme.accentColor?.val || theme.color?.val} />
        )
      ) : (
        <YStack width={compact ? 160 : 220} gap={6}>
          <Progress value={typeof progress === 'number' ? Math.max(0, Math.min(100, progress)) : undefined}>
            <Progress.Indicator backgroundColor={theme.accentColor?.val || theme.color?.val} />
          </Progress>
          {determinate && typeof progress === 'number' && (
            <TText color="$color10" fontSize={12}>{Math.round(progress)}%</TText>
          )}
        </YStack>
      )}
      {text && <TText color="$textDefault" fontSize={compact ? 12 : 14}>{text}</TText>}
      {subtext && <TText color="$color10" fontSize={compact ? 10 : 12}>{subtext}</TText>}
    </YStack>
  );

  if (!overlay) return content;

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />
      <Card
        bordered
        backgroundColor={theme.surfaceRow?.val || theme.background?.val}
        borderColor={theme.borderColor?.val}
        borderRadius={12}
        padding={16}
        maxWidth={320}
      >
        {content}
      </Card>
    </View>
  );
}


