import React from 'react';
import {Modal, Pressable, ScrollView, TouchableOpacity, useWindowDimensions} from 'react-native';
import {Text as TText, useTheme, View, XStack, YStack} from 'tamagui';
import {X} from '@tamagui/lucide-icons';

import {fontSize, iconSize, radius} from '@/shared/theme/tokens';

type AppSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  /** Retained for call-site compatibility; the height now follows the content. */
  snapPointsMode?: 'fit' | 'percent' | 'mixed';
  snapPoints?: number[];
  paddingTop?: number;
  titleProps?: any;
};

/**
 * Bottom sheet, built on React Native's Modal.
 *
 * It used Tamagui's Sheet, which measures its frame once for
 * `snapPointsMode="fit"`. That measurement does not survive a close: on device
 * the sheet opened the first time and every later open mounted nothing at all
 * — the scan behind the Bluetooth sheet would start, with no sheet on screen
 * and no entry in the view hierarchy. The same collapse showed up when
 * rendering these previews in a browser.
 *
 * A Modal has no such state. The panel is capped at 85% of the window and
 * scrolls internally, so a long list behaves and a short one still hugs its
 * content.
 */
export default function AppSheet({
  open,
  onOpenChange,
  title,
  children,
  titleProps,
  paddingTop,
}: AppSheetProps) {
  const theme = useTheme();
  const {height} = useWindowDimensions();

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={() => onOpenChange(false)}>
      {/* Tapping the scrim dismisses, as a sheet should. The panel swallows
          its own presses so a tap inside never closes it. */}
      <Pressable
        style={{flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(6,7,10,0.45)'}}
        onPress={() => onOpenChange(false)}>
        <Pressable onPress={() => {}}>
          <YStack
            maxHeight={height * 0.85}
            backgroundColor="$surfaceRow"
            borderTopLeftRadius={radius.xl}
            borderTopRightRadius={radius.xl}
            borderTopWidth={1}
            borderTopColor="$borderColor">
            <XStack
              paddingHorizontal={20}
              paddingVertical={16}
              borderBottomWidth={1}
              borderBottomColor="$borderColor"
              alignItems="center"
              justifyContent="space-between">
              <TText color="$textDefault" fontSize={fontSize.xxl} fontWeight={'700' as any} {...titleProps}>
                {title}
              </TText>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => onOpenChange(false)}
                hitSlop={12}>
                <X size={iconSize.sm} color={theme.color9?.val as string} />
              </TouchableOpacity>
            </XStack>

            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingBottom: 28,
                paddingTop: paddingTop ?? 12,
                paddingHorizontal: 20,
              }}>
              <View>{children}</View>
            </ScrollView>
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
