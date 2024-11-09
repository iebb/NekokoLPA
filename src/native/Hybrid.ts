import {NativeModules, Platform} from "react-native";
import {CCIDDevice} from "@/native/adapters/ccid_adapter";

const { CCIDPlugin, CustomHttp } = NativeModules;




export async function playNative() {

  if (Platform.OS === 'android') {
    // InfiLPA.refreshEUICC();
  }

  if (Platform.OS === 'ios') {
    const readers = await CCIDPlugin.listReaders();
    if (readers.length > 0) {
      const reader = new CCIDDevice(readers[0]);
      await reader.connect();
      // Access the exported functions or variables from the Emscripten module
      const result = await reader.execute('get_eid', []);  // Call your C/C++ function (e.g., _myFunction)
      console.log("eid2", result);
      const get_profiles = await reader.execute('get_profiles', []);  // Call your C/C++ function (e.g., _myFunction)
      console.log("get_profiles", get_profiles);
      await reader.disconnect();
    }
  }
}
