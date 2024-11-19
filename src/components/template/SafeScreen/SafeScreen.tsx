import {StatusBar, View} from 'react-native';
import React, {PropsWithChildren} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors} from "react-native-ui-lib";
import {useAppTheme} from "@/theme/context";

function SafeScreen({ children }: PropsWithChildren) {
	const { theme } = useAppTheme();
	const insets = useSafeAreaInsets();
	return (
		<View
			style={{
				backgroundColor: Colors.$backgroundDefault,
				paddingTop: insets.top,
				paddingBottom: insets.bottom,
				paddingLeft: insets.left,
				paddingRight: insets.right,
				flex: 1,
			}}
		>
			<StatusBar
				barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
				backgroundColor={Colors.$backgroundDefault}
			/>
			{children}
		</View>
	);
}

export default SafeScreen;
