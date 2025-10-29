import {StatusBar, View} from 'react-native';
import React, {PropsWithChildren} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAppTheme} from "@/theme/context";
import { useTheme } from 'tamagui';

function SafeScreen({ children }: PropsWithChildren) {
	const { effectiveTheme } = useAppTheme();
	const insets = useSafeAreaInsets();
	return (
    <View
      style={{
        backgroundColor: (useTheme().background?.val || '#fff'),
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        flex: 1,
      }}
    >
			<StatusBar
				barStyle={effectiveTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={useTheme().background?.val || '#fff'}
			/>
			{children}
		</View>
	);
}

export default SafeScreen;
