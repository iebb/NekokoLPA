import React, {useCallback} from 'react';
import Screen from '@/shared/ui/Screen';
import SIMSelector from '@/features/main/SIMSelector';
import type {RootScreenProps} from '@/app/navigation/types';
import {useDispatch} from 'react-redux';
import {setupDevices} from '@/lpa/deviceManager';
import {XStack, YStack} from 'tamagui';
import AppHeader from '@/features/main/components/AppHeader';
import ActionButtons from '@/features/main/components/ActionButtons';

function Main({navigation}: RootScreenProps<'Main'>) {
  const dispatch = useDispatch();

  // Memoize refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      await setupDevices(dispatch);
    } catch (e) {
      // Handle error silently
    }
  }, [dispatch]);

  return (
    <Screen
      title=""
      horizontalPadding={24}
      keyboardAvoiding={false}
      scrollViewProps={{scrollEnabled: false}}>
      <YStack gap={10} flex={1} marginTop={12}>
        <XStack alignItems="center" justifyContent="space-between">
          <AppHeader navigation={navigation} />
          <ActionButtons navigation={navigation} onRefresh={handleRefresh} />
        </XStack>
        <SIMSelector />
      </YStack>
    </Screen>
  );
}

export default Main;
