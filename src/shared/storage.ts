import {createMMKV} from 'react-native-mmkv';

export const countryList = createMMKV({id: 'country_list'});
export const preferences = createMMKV({id: 'preferences'});

/**
 * Downloaded reference data, kept apart from `preferences`.
 *
 * Everything here can be fetched again, so it is safe to clear and does not
 * belong with the settings someone chose.
 */
export const catalogCache = createMMKV({id: 'catalog_cache'});
