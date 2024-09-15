import 'react-native-gesture-handler';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {MMKV} from 'react-native-mmkv';

import {ThemeProvider} from '@/theme';

import ApplicationNavigator from './navigators/Application';
import './translations';
import {NativeListener} from "@/native/NativeListener";
import {store} from "@/redux/reduxDataStore";
import {Provider} from "react-redux";

export const queryClient = new QueryClient();

export const storage = new MMKV();

function App() {
	return (
		<Provider store={store}>
			<NativeListener>
				<QueryClientProvider client={queryClient}>
					<ThemeProvider storage={storage}>
						<ApplicationNavigator />
					</ThemeProvider>
				</QueryClientProvider>
			</NativeListener>
		</Provider>
	);
}

export default App;
