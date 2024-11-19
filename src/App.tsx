import 'react-native-gesture-handler';
import {MMKV} from 'react-native-mmkv'

require('react-native-ui-lib/config').setConfig({appScheme: 'default'});

import {ThemeProvider} from '@/theme/context';
import './translations';
import {NativeListener} from "@/native/NativeListener";
import {store} from "@/redux/reduxDataStore";
import {Provider} from "react-redux";
import {ThemeProvider2} from "@/theme_legacy";
import ApplicationNavigator from '@/screens/Application';

require('@/theme/theme');

export const storage = new MMKV();

function App() {
	return (
		<Provider store={store}>
			<NativeListener>
				<ThemeProvider>
					<ThemeProvider2 storage={storage}>
						<ApplicationNavigator />
					</ThemeProvider2>
				</ThemeProvider>
			</NativeListener>
		</Provider>
	);
}

export default App;
