import Config from 'react-native-config';

import CatImage from '@/assets/images/shiroya.png';
import flavor1Image from '@/../android/app/src/main/res/mipmap-xhdpi/ic_launcher_9esim_foreground.png';
import multisignImage from '@/../android/app/src/main/res/mipmap-xhdpi/ic_launcher_multi_foreground.png';

export const AppTitle = Config.TITLE;
const flavorImages = {
  flavor1: flavor1Image,
  esim9: flavor1Image,
  store: CatImage,
  multisign: multisignImage,
}
const flavorLinks = {
  flavor1: "https://www.9esim.com/?coupon=apple&src=LPA",
  esim9: "https://www.9esim.com/?coupon=apple&src=LPA",
  store: "https://lpa.nekoko.ee/products",
  multisign: "https://lpa.nekoko.ee/products",
}
export const AppLogo = (flavorImages as any)[Config.FLAVOR || 'store'];
export const AppBuyLink = (flavorLinks as any)[Config.FLAVOR || 'store'];
export const AppCheckForUpdates = Config.CHECK_FOR_UPDATES === "1";
export const GithubLink = "https://github.com/iebb/NekokoLPA/";
export const DisplayGithubLink = Config.FLAVOR === "store" || Config.FLAVOR === "multisign";
