import React, {useCallback, useRef, useState} from 'react';
import {Dimensions, Modal, Pressable, ScrollView, TouchableOpacity, View} from 'react-native';
import {Check} from '@tamagui/lucide-icons';
import {Text as TText, useTheme, XStack, YStack} from 'tamagui';

import {fontSize, iconSize, radius} from '@/shared/theme/tokens';

export interface DropdownOption {
  value: string;
  label: string;
}

interface Anchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MENU_MAX_HEIGHT = 320;
const EDGE_MARGIN = 12;

/**
 * A menu anchored to its trigger, in the platform idiom.
 *
 * Replaces a bottom sheet for choosing one value. A sheet is a destination —
 * it covers the screen, animates in from the bottom, and asks the user to come
 * back — which is a lot of ceremony for picking a unit. Anchoring the list to
 * the row keeps the setting it belongs to on screen and lets a choice be made
 * without leaving the page.
 *
 * The trigger is measured against the window on open, and the menu flips above
 * the anchor when there is not enough room below, so a row near the bottom of
 * a long settings list does not open a menu off-screen.
 */
export default function Dropdown({
  options,
  value,
  onChange,
  children,
}: {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  /** The row that opens the menu. Rendered in place and used as the anchor. */
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const triggerRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const open = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({x, y, width, height});
    });
  }, []);

  const window = Dimensions.get('window');
  const spaceBelow = anchor ? window.height - (anchor.y + anchor.height) : 0;
  const flipAbove = anchor ? spaceBelow < 160 && anchor.y > spaceBelow : false;
  const maxHeight = Math.min(
    MENU_MAX_HEIGHT,
    anchor ? (flipAbove ? anchor.y : spaceBelow) - EDGE_MARGIN : MENU_MAX_HEIGHT,
  );

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity activeOpacity={0.6} onPress={open}>
          {children}
        </TouchableOpacity>
      </View>

      <Modal visible={anchor !== null} transparent animationType="fade">
        {/* The backdrop is the dismiss target, so a tap anywhere outside
            closes the menu the way a platform menu does. */}
        <Pressable style={{flex: 1}} onPress={() => setAnchor(null)}>
          {anchor && (
            <YStack
              position="absolute"
              left={Math.max(EDGE_MARGIN, Math.min(anchor.x, window.width - 260 - EDGE_MARGIN))}
              top={flipAbove ? undefined : anchor.y + anchor.height + 4}
              bottom={flipAbove ? window.height - anchor.y + 4 : undefined}
              width={Math.max(220, Math.min(anchor.width, 320))}
              maxHeight={maxHeight}
              backgroundColor="$surfaceRow"
              borderRadius={radius.md}
              borderWidth={1}
              borderColor="$borderColor"
              overflow="hidden"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.25,
                shadowRadius: 20,
                shadowOffset: {width: 0, height: 8},
                elevation: 8,
              }}>
              <ScrollView bounces={false}>
                {options.map((option, index) => {
                  const selected = option.value === value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.6}
                      onPress={() => {
                        onChange(option.value);
                        setAnchor(null);
                      }}>
                      <XStack
                        alignItems="center"
                        gap={10}
                        paddingHorizontal={14}
                        paddingVertical={13}
                        borderTopWidth={index === 0 ? 0 : 1}
                        borderTopColor="$borderColor">
                        <TText flex={1} color="$textDefault" fontSize={fontSize.lg}>
                          {option.label}
                        </TText>
                        {selected && (
                          <Check
                            size={iconSize.sm}
                            color={theme.primaryColor?.val as string}
                          />
                        )}
                      </XStack>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </YStack>
          )}
        </Pressable>
      </Modal>
    </>
  );
}
