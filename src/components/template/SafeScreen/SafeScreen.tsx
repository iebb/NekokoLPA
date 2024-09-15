import { StatusBar, View } from 'react-native';
import type { PropsWithChildren } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

function SafeScreen({ children }: PropsWithChildren) {
	const { colors, layout, variant, navigationTheme } = useTheme();
	const insets = useSafeAreaInsets();

	return (
		<View
			style={[
				layout.flex_1,
				{
					backgroundColor: colors.std900,
					// Paddings to handle safe area
					paddingTop: insets.top,
					paddingBottom: insets.bottom,
					paddingLeft: insets.left,
					paddingRight: insets.right,
				},
			]}
		>
			<StatusBar
				barStyle={variant === 'dark' ? 'light-content' : 'dark-content'}
				backgroundColor={colors.std900}
			/>
			{children}
		</View>
	);
}

export default SafeScreen;
