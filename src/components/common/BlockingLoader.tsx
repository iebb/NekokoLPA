import React from "react";
import { View } from "react-native";
import { XStack, YStack, Text as TText, Spinner, useTheme, Card } from "tamagui";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCheckCircle, faCircleInfo, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

type LoaderState = "loading" | "success" | "error" | "info" | "warning";

interface BlockingLoaderProps {
  visible?: boolean;
  title?: string;
  subtitle?: string;
  message?: string; // backward-compat alias for subtitle
  state?: LoaderState; // visual state
  progress?: number; // optional: 0..1 or 0..100
}

export default function BlockingLoader({
  visible = true,
  title = "Processing",
  subtitle,
  message,
  state = "loading",
}: BlockingLoaderProps) {
  const theme = useTheme();

  if (!visible) return null;

  const effectiveSubtitle = subtitle ?? message;

  const normalizedProgress = (() => {
    if (typeof (arguments as any)[0]?.progress === 'undefined') return undefined;
    const raw = (arguments as any)[0].progress as number;
    if (Number.isNaN(raw)) return undefined;
    const pct = raw <= 1 ? raw * 100 : raw;
    return Math.max(0, Math.min(100, Math.round(pct)));
  })();

  const stateColor = (() => {
    switch (state) {
      case "success":
        return theme.accentColor?.val || theme.color?.val;
      case "error":
        return "#ff6b6b";
      case "warning":
        return "#f5a524";
      case "info":
        return theme.colorFocus?.val || theme.accentColor?.val || theme.color?.val;
      default:
        return theme.accentColor?.val || theme.color?.val;
    }
  })();

  const renderIcon = () => {
    if (state === "loading") return null;
    const icon = state === "success" ? faCheckCircle : state === "error" ? faTriangleExclamation : faCircleInfo;
    return (
      <FontAwesomeIcon icon={icon as any} size={24} style={{ color: stateColor, marginRight: 8 }} />
    );
  };

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
      pointerEvents="auto"
      accessibilityLabel="Blocking Loader"
      accessible
    >
      {/* Scrim */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.35)",
        }}
      />

      {/* Content Card */}
      <Card
        elevate
        bordered
        size="$4"
        backgroundColor={theme.surfaceRow?.val || theme.background?.val}
        borderColor={theme.borderColor?.val}
        borderRadius={12}
        padding={20}
        maxWidth={320}
        minWidth={260}
      >
        <YStack alignItems="center" gap={10}>
          {state === "loading" && normalizedProgress === undefined ? (
            <Spinner size="large" color={stateColor} />
          ) : state === "loading" && normalizedProgress !== undefined ? (
            <YStack width="100%" gap={6}>
              <View style={{
                width: '100%',
                height: 8,
                borderRadius: 999,
                backgroundColor: theme.color2?.val || theme.borderColor?.val || '#444'
              }}>
                <View style={{
                  width: `${normalizedProgress}%`,
                  height: '100%',
                  borderRadius: 999,
                  backgroundColor: stateColor
                }} />
              </View>
              <TText fontSize={12} color="$color10" textAlign="center">{normalizedProgress}%</TText>
            </YStack>
          ) : (
            <XStack alignItems="center" justifyContent="center">
              {renderIcon()}
            </XStack>
          )}
          {title ? (
            <TText fontSize={16} fontWeight={"700" as any} color="$textDefault" textAlign="center">
              {title}
            </TText>
          ) : null}
          {effectiveSubtitle ? (
            <TText fontSize={13} color="$color10" textAlign="center">
              {effectiveSubtitle}
            </TText>
          ) : null}
        </YStack>
      </Card>
    </View>
  );
}
