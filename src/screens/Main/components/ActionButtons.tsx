import React from 'react';
import { Button as TButton, XStack } from 'tamagui';
import { Bluetooth, RefreshCcw, Settings } from '@tamagui/lucide-icons';

export default function ActionButtons({ navigation, onRefresh }: { navigation: any; onRefresh: () => void; }) {
  return (
    <XStack gap={10}>
      <TButton icon={<Bluetooth size="$1" />} circular size="$3.5" backgroundColor="$accentColor" onPress={() => navigation.navigate('BluetoothScan', {})} />
      <TButton icon={<RefreshCcw size="$1" />} circular size="$3.5" backgroundColor="$accentColor" onPress={onRefresh} />
      <TButton icon={<Settings size="$1" />} circular size="$3.5" backgroundColor="$accentColor" onPress={() => navigation.navigate('Settings', {})} />
    </XStack>
  );
}
