import {StatusBar, View} from 'react-native';
import React, {PropsWithChildren} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useColorScheme} from "@/theme/context";
import {useTheme} from 'tamagui';

function SafeScreen({ children }: PropsWithChildren) {
	const { scheme } = useColorScheme();
	const insets = useSafeAreaInsets();
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: (theme.background?.val || '#fff'),
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        flex: 1,
      }}
    >
			<StatusBar
				barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background?.val || '#fff'}
			/>
			{children}
		</View>
	);
}

export default SafeScreen;
