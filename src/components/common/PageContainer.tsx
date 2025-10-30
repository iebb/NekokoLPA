import React, { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

interface PageContainerProps {
  /**
   * Additional props for the ScrollView
   */
  scrollViewProps?: ScrollViewProps;
  /**
   * Whether to enable keyboard avoiding (default: true)
   */
  keyboardAvoiding?: boolean;
  /**
   * Extra padding at bottom for content (default: 40)
   */
  bottomPadding?: number;
  /**
   * Horizontal padding (default: 10)
   */
  horizontalPadding?: number;
}

/**
 * PageContainer - Provides consistent padding and keyboard avoidance for pages
 * - Horizontal padding: 10px (configurable)
 * - Vertical padding: scrollable with keyboard avoidance
 * - Extra height at bottom for content
 * - Avoids keyboard and bottom safe area
 */
export default function PageContainer({
  children,
  scrollViewProps,
  keyboardAvoiding = true,
  bottomPadding = 40,
  horizontalPadding = 20,
}: PropsWithChildren<PageContainerProps>) {
  const insets = useSafeAreaInsets();

  const content = (
    <YStack
      paddingHorizontal={horizontalPadding}
      paddingBottom={Math.max(insets.bottom, bottomPadding)}
      flex={1}
    >
      {children}
    </YStack>
  );

  if (!keyboardAvoiding) {
    return (
      <ScrollView
        bounces
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        {...scrollViewProps}
      >
        {content}
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        bounces
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        {...scrollViewProps}
      >
        {content}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

