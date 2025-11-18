import React, {useCallback} from 'react';
import Screen from '@/components/common/Screen';
import SIMSelector from "@/screens/Main/SIMSelector";
import type {RootScreenProps} from "@/screens/navigation";
import {useDispatch} from "react-redux";
import {setupDevices} from "@/native/setup";
import {XStack, YStack} from 'tamagui';
import AppHeader from '@/screens/Main/components/AppHeader';
import ActionButtons from '@/screens/Main/components/ActionButtons';

function Main({ navigation }: RootScreenProps<'Main'>) {
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
		<Screen title="" horizontalPadding={24} keyboardAvoiding={false} scrollViewProps={{ scrollEnabled: false }}>
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
