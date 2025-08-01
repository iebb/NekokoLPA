import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import * as en from './en';
import * as zh from './zh';
import * as ja from './ja';
import * as es from './es';
import * as ar from './ar';
import * as ru from './ru';
import {NativeModules, Platform} from 'react-native';
import {preferences} from "@/utils/mmkv";

type TupleUnion<U extends string, R extends unknown[] = []> = {
	[S in U]: Exclude<U, S> extends never
		? [...R, S]
		: TupleUnion<Exclude<U, S>, [...R, S]>;
}[U];

const ns = Object.keys(en) as TupleUnion<keyof typeof en>;

export const defaultNS = ns[0];

const locale =
	preferences.getString("language") ??
	(
		Platform.OS === 'ios'
		? NativeModules.SettingsManager.settings.AppleLocale
		: NativeModules.I18nManager.localeIdentifier
	).substring(0, 2);

void i18n.use(initReactI18next).init({
	ns,
	defaultNS,
	resources: {
		en,
		zh,
		ja,
		es,
		ar,
		ru
	},
	lng: locale,
	fallbackLng: 'en',
	interpolation: {
		escapeValue: false, // not needed for react as it escapes by default
	},
	compatibilityJSON: 'v4',
});

export default i18n;
