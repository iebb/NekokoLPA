/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';

if (__DEV__) {
	import('@/reactotron.config');
}

AppRegistry.registerComponent("Main", () => App);
