import {KeyboardAvoidingView, Platform, StatusBar, View} from 'react-native';
import React, {PropsWithChildren} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useTheme} from '@/theme';

function SafeScreen({ children }: PropsWithChildren) {
	const { colors, variant } = useTheme();
	const insets = useSafeAreaInsets();

	return (
		<View
			style={{
				backgroundColor: colors.std900,
				paddingTop: insets.top,
				paddingBottom: insets.bottom,
				paddingLeft: insets.left,
				paddingRight: insets.right,
			}}
		>
			<StatusBar
				barStyle={variant === 'dark' ? 'light-content' : 'dark-content'}
				backgroundColor={colors.std900}
			/>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				{children}
			</KeyboardAvoidingView>
		</View>
	);
}

export default SafeScreen;
