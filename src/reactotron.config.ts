import Reactotron, { ReactotronReactNative } from 'reactotron-react-native';
import mmkvPlugin from 'reactotron-react-native-mmkv';

import { storage } from './App';
import config from '../app.json';

Reactotron.configure({
	name: config.name,
})
	.useReactNative()
	.use(mmkvPlugin<ReactotronReactNative>({ storage }))
	.connect();
