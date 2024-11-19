import {
	createContext,
	PropsWithChildren,
	useEffect,
	useMemo,
	useState,
} from 'react';

import { config } from '@/theme_legacy/_config';
import {
	generateFontSizes,
	generateFontColors,
	staticFontStyles,
} from '@/theme_legacy/fonts';
import {
	generateBorderColors,
	generateBorderRadius,
	generateBorderWidths,
} from '@/theme_legacy/borders';
import layout from '@/theme_legacy/layout';
import componentsGenerator from '@/theme_legacy/components';
import { generateBackgrounds } from '@/theme_legacy/backgrounds';
import { generateGutters } from '@/theme_legacy/gutters';
import generateConfig from '@/theme_legacy/ThemeProvider/generateConfig';

import type { MMKV } from 'react-native-mmkv';
import type { ComponentTheme, Theme } from '@/types/theme/theme';
import type {
	FulfilledThemeConfiguration,
	Variant,
} from '@/types/theme/config';

// Types

type Context = Theme & {
	changeTheme: (variant: Variant) => void;
};

export const ThemeContext = createContext<Context | undefined>(undefined);

type Props = PropsWithChildren<{
	storage: MMKV;
}>;

function ThemeProvider2({ children = false, storage }: Props) {
	// Current theme variant
	const [variant, setVariant] = useState(
		(storage.getString('theme') as Variant) || 'default',
	);

	// Initialize theme at default if not defined
	useEffect(() => {
		const appHasThemeDefined = storage.contains('theme');
		if (!appHasThemeDefined) {
			storage.set('theme', 'default');
			setVariant('default');
		}
	}, []);

	const changeTheme = (nextVariant: Variant) => {
		setVariant(nextVariant);
		storage.set('theme', nextVariant);
	};

	// Flatten config with current variant
	const fullConfig = useMemo(() => {
		return generateConfig(variant) satisfies FulfilledThemeConfiguration;
	}, [variant, config]);

	const fonts = useMemo(() => {
		return {
			...generateFontSizes(),
			...generateFontColors(fullConfig),
			...staticFontStyles,
		};
	}, [fullConfig]);

	const backgrounds = useMemo(() => {
		return generateBackgrounds(fullConfig);
	}, [fullConfig]);

	const borders = useMemo(() => {
		return {
			...generateBorderColors(fullConfig),
			...generateBorderRadius(),
			...generateBorderWidths(),
		};
	}, [fullConfig]);

	const theme = useMemo(() => {
		return {
			colors: fullConfig.colors,
			variant,
			gutters: generateGutters(),
			layout,
			fonts,
			backgrounds,
			borders,
		} satisfies ComponentTheme;
	}, [variant, layout, fonts, backgrounds, borders, fullConfig.colors]);

	const components = useMemo(() => {
		return componentsGenerator(theme);
	}, [theme]);

	const value = useMemo(() => {
		return { ...theme, components, changeTheme };
	}, [theme, components, changeTheme]);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export default ThemeProvider2;
