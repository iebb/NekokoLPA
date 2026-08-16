import {createMMKV} from 'react-native-mmkv';

export const countryList = createMMKV({id: 'country_list'});
export const preferences = createMMKV({id: 'preferences'});
