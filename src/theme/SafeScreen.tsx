import {StatusBar, View} from 'react-native';
import React, {PropsWithChildren} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors} from "react-native-ui-lib";
import {useAppTheme} from "@/theme/context";
import { Appearance } from 'react-native';

function SafeScreen({ children }: PropsWithChildren) {
	const { effectiveTheme } = useAppTheme();
	const insets = useSafeAreaInsets();
	return (
		<View
			style={{
				backgroundColor: Colors.pageBackground,
				paddingTop: insets.top,
				paddingBottom: insets.bottom,
				paddingLeft: insets.left,
				paddingRight: insets.right,
				flex: 1,
			}}
		>
			<StatusBar
				barStyle={effectiveTheme === 'dark' ? 'light-content' : 'dark-content'}
				backgroundColor={Colors.pageBackground}
			/>
			{children}
		</View>
	);
}

export default SafeScreen;
