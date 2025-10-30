import React from 'react';
import { TouchableOpacity, View, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sheet, YStack, XStack, Text as TText, useTheme } from 'tamagui';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

type AppSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  snapPointsMode?: 'fit' | 'percent' | 'mixed';
  snapPoints?: number[];
};

export default function AppSheet({ open, onOpenChange, title, children, snapPointsMode = 'fit', snapPoints }: AppSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const keyboardOffset = Math.max(0, insets.top) + 88; // header + status bar
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);

  React.useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
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
            <TText color="$textDefault" fontSize={18} fontWeight="700">{title}</TText>
            <TouchableOpacity onPress={() => onOpenChange(false)}>
              <FontAwesomeIcon icon={faTimes} size={18} style={{ color: theme.color10?.val || '#999' }} />
            </TouchableOpacity>
          </XStack>
          <KeyboardAvoidingView
            enabled={keyboardVisible}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={keyboardVisible ? keyboardOffset : 0}
            style={{ flex: 1 }}
          >
            <View style={{ flex: 1, padding: 20, paddingBottom: 24 }}>
              {children}
            </View>
          </KeyboardAvoidingView>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}


