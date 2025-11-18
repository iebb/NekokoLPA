import React from 'react';
import {TouchableOpacity} from 'react-native';
import {Sheet, Text as TText, useTheme, View, XStack, YStack} from 'tamagui';
import {X} from '@tamagui/lucide-icons';

type AppSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  snapPointsMode?: 'fit' | 'percent' | 'mixed';
  snapPoints?: number[];
  paddingTop?: number;
  titleProps?: any;
};

export default function AppSheet({ open, onOpenChange, title, children, snapPointsMode = 'fit', snapPoints, titleProps, paddingTop }: AppSheetProps) {
  const theme = useTheme();

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal snapPointsMode={snapPointsMode as any} snapPoints={snapPoints as any}>
      <Sheet.Overlay style={{ opacity: 0.7 }} />
      <Sheet.Frame
        backgroundColor={theme.surfaceRow?.val || theme.background?.val || '#fff'}
        padding={0}
        // top shadow
        style={{ shadowColor: theme.shadowColor?.val || 'rgba(0,0,0,0.15)', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: -2 }, elevation: 8 }}
      >
        <YStack flex={1}>
          <XStack
            paddingHorizontal={20}
            paddingVertical={16}
            borderBottomWidth={0.5}
            borderBottomColor={theme.outlineNeutral?.val || theme.borderColor?.val || '#777'}
            alignItems="center"
            justifyContent="space-between"
          >
            <TText color="$textDefault" fontSize={18} fontWeight="700" {...titleProps}>{title}</TText>
            <TouchableOpacity onPress={() => onOpenChange(false)}>
              <X size={18} color={theme.color6?.val || '#999'} />
            </TouchableOpacity>
          </XStack>
          <View
            flex={1}
            paddingBottom={24}
            paddingTop={paddingTop ?? 12}
            paddingHorizontal={20}
          >
            {children}
          </View>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}


