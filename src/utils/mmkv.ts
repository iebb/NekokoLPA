import {createMMKV} from "react-native-mmkv";

console.log("creating mmkv");
export const countryList = createMMKV({id: 'country_list'});
export const sizeStats = createMMKV({id: 'sizeStats'});
export const preferences = createMMKV({id: 'preferences'});


console.log("created mmkv");
