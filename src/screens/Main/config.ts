import Config from 'react-native-config';

import CatImage from '@/assets/images/shiroya.png';
import flavor1Image from '@/../android/app/src/main/res/mipmap-xhdpi/ic_launcher_9esim_foreground.png';
import multisignImage from '@/../android/app/src/main/res/mipmap-xhdpi/ic_launcher_multi_foreground.png';

export const AppTitle = Config.TITLE;
const flavorImages = {
  flavor1: flavor1Image,
  store: CatImage,
  multisign: multisignImage,
}
export const AppLogo = (flavorImages as any)[Config.FLAVOR || 'store'];
export const AppCheckForUpdates = Config.CHECK_FOR_UPDATES === "1";

console.log("Cfg", Config);