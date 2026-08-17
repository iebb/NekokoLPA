import React from 'react';
import {ScrollView, TouchableOpacity} from 'react-native';
import {Text as TText, useTheme, XStack, YStack} from 'tamagui';
import {Bluetooth} from '@tamagui/lucide-icons';

import {fontSize, iconSize} from '@/shared/theme/tokens';

export interface SlotTab {
  key: string;
  label: string;
}

/**
 * The reader/slot switcher that sits under the header.
 *
 * Up to three tabs share the width evenly; beyond that they keep their natural
 * width and the strip scrolls, because four equal tabs on a phone truncate
 * every label to the point of uselessness.
 *
 * The selected tab is marked by a 2px underline that overlaps the strip's
 * bottom border (hence `marginBottom: -1`), so the indicator and the rule read
 * as one line rather than two stacked ones.
 */
export default function SlotTabs({
  tabs,
  selected,
  onSelect,
  onBluetooth,
  bluetoothActive = false,
  emptyLabel,
}: {
  tabs: SlotTab[];
  selected: string;
  onSelect: (key: string) => void;
  onBluetooth?: () => void;
  bluetoothActive?: boolean;
  emptyLabel: string;
}) {
  const theme = useTheme();
  const scrolls = tabs.length > 3;

  const tab = (t: SlotTab) => {
    const active = t.key === selected;
    return (
      <TouchableOpacity
        key={t.key}
        accessibilityRole="tab"
        accessibilityState={{selected: active}}
        onPress={() => onSelect(t.key)}
        style={{
          flex: scrolls ? undefined : 1,
          maxWidth: scrolls ? 150 : undefined,
          paddingVertical: 18,
          paddingHorizontal: scrolls ? 14 : 10,
          marginBottom: -1,
          borderBottomWidth: 2,
          borderBottomColor: active ? theme.primaryColor?.val : 'transparent',
        }}>
        <TText
          numberOfLines={1}
          textAlign="center"
          color={active ? '$primaryColor' : '$color9'}
          fontSize={fontSize.lg}
          fontWeight={(active ? '600' : '500') as any}>
          {t.label}
        </TText>
      </TouchableOpacity>
    );
  };

  return (
    <XStack borderBottomWidth={1} borderBottomColor="$borderColor" alignItems="stretch">
      <YStack flex={1} minWidth={0}>
        {tabs.length === 0 ? (
          <XStack alignItems="center" paddingHorizontal={16} paddingVertical={18}>
            <TText color="$color9" fontSize={fontSize.sm}>
              {emptyLabel}
            </TText>
          </XStack>
        ) : scrolls ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map(tab)}
          </ScrollView>
        ) : (
          <XStack>{tabs.map(tab)}</XStack>
        )}
      </YStack>

      {onBluetooth && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Bluetooth readers"
          onPress={onBluetooth}
          style={{
            width: 58,
            alignItems: 'center',
            justifyContent: 'center',
            borderLeftWidth: 1,
            borderLeftColor: theme.borderColor?.val,
          }}>
          <Bluetooth
            size={iconSize.md}
            color={(bluetoothActive ? theme.primaryColor?.val : theme.color9?.val) as string}
          />
        </TouchableOpacity>
      )}
    </XStack>
  );
}
