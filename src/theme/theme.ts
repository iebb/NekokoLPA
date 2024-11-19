import {Colors} from "react-native-ui-lib";
import {preferences} from "@/storage/mmkv";



// Colors.loadSchemes({
//   light: {
//     screenBG: 'transparent',
//     textColor: Colors.grey10,
//     moonOrSun: Colors.yellow30,
//     mountainForeground: Colors.green30,
//     mountainBackground: Colors.green50,
//     $backgroundSuccess: Colors.green40,
//     $backgroundSuccessLight: Colors.green70
//   },
//   dark: {
//     screenBG: Colors.grey10,
//     textColor: Colors.white,
//     moonOrSun: Colors.grey80,
//     mountainForeground: Colors.violet10,
//     mountainBackground: Colors.violet20,
//     $backgroundSuccess: Colors.green40,
//     $backgroundSuccessLight: Colors.green20
//   }
// });

if (preferences.getString("theme") !== undefined) {
  Colors.setScheme(preferences.getString("theme"));
}