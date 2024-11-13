import 'react-native-gesture-handler';
import {MMKV} from 'react-native-mmkv';

import {ThemeProvider} from '@/theme';

import ApplicationNavigator from './navigators/Application';
import './translations';
import {NativeListener} from "@/native/NativeListener";
import {store} from "@/redux/reduxDataStore";
import {Provider} from "react-redux";

export const storage = new MMKV();

function App() {
	return (
		<Provider store={store}>
			<NativeListener>
				<ThemeProvider storage={storage}>
					<ApplicationNavigator />
				</ThemeProvider>
			</NativeListener>
		</Provider>
	);
}

export default App;
