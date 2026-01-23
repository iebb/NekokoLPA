/**
 * @format
 */

import { AppRegistry, NativeEventEmitter } from "react-native";
// This import ensures NativeEventEmitter (which replaces RCTEventEmitter) is initialized
import App from "./src/App";


AppRegistry.registerComponent("NekokoLPA", () => App);
