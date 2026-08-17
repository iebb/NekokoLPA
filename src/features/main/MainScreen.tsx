import React, {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {XStack, YStack} from 'tamagui';

import SafeScreen from '@/shared/ui/SafeScreen';
import SIMSelector from '@/features/main/SIMSelector';
import type {RootScreenProps} from '@/app/navigation/types';
import {setupDevices} from '@/lpa/deviceManager';
import AppHeader from '@/features/main/components/AppHeader';
import ActionButtons from '@/features/main/components/ActionButtons';

/**
 * The home screen shell.
 *
 * Deliberately not built on `Screen`: that composes SafeScreen + Title +
 * PageContainer, which gives every screen a large display-size heading and
 * 20px+ gutters. Home has no heading in this design — the identity lives in a
 * compact header strip, and the tab bar has to sit flush against it with no
 * page padding between them, so the two rules read as one edge.
 *
 * The strip is painted `$surfaceRow` rather than the page background, which is
 * what separates it from the content beneath without a drop shadow.
 */
function Main({navigation}: RootScreenProps<'Main'>) {
  const dispatch = useDispatch();

  const handleRefresh = useCallback(async () => {
    try {
      await setupDevices(dispatch);
    } catch (e) {
      // Handle error silently
    }
  }, [dispatch]);

  return (
    <SafeScreen>
      <YStack flex={1} minHeight={0}>
        <XStack
          alignItems="center"
          justifyContent="space-between"
          gap={12}
          paddingHorizontal={14}
          paddingTop={12}
          paddingBottom={12}
          backgroundColor="$surfaceRow"
          borderBottomWidth={1}
          borderBottomColor="$borderColor">
          <AppHeader navigation={navigation} />
          <ActionButtons navigation={navigation} onRefresh={handleRefresh} />
        </XStack>

        <SIMSelector />
      </YStack>
    </SafeScreen>
  );
}

export default Main;
