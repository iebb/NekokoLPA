import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import * as en from './en';
import * as zh from './zh';
import * as ja from './ja';

type TupleUnion<U extends string, R extends unknown[] = []> = {
	[S in U]: Exclude<U, S> extends never
		? [...R, S]
		: TupleUnion<Exclude<U, S>, [...R, S]>;
}[U];

const ns = Object.keys(en) as TupleUnion<keyof typeof en>;

export const defaultNS = ns[0];

void i18n.use(initReactI18next).init({
	ns,
	defaultNS,
	resources: {
		en,
		zh,
		ja,
	},
	lng: 'en',
	fallbackLng: 'en',
	interpolation: {
		escapeValue: false, // not needed for react as it escapes by default
	},
	compatibilityJSON: 'v3',
});

export default i18n;
