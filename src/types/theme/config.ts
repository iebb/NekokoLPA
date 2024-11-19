import { config } from '@/theme_legacy/_config';
import generateConfig from '@/theme_legacy/ThemeProvider/generateConfig';
import type { AllPartial } from './common';

export type Variant = keyof typeof config.variants | 'default';

export type ThemeState = {
	variant: Variant;
};

export type FulfilledThemeConfiguration = {
	readonly colors: Record<string, string>;
	fonts: {
		sizes: readonly number[];
		readonly colors: Record<string, string>;
	};
	gutters: readonly number[];
	readonly backgrounds: Record<string, string>;
	borders: {
		widths: readonly number[];
		radius: readonly number[];
		readonly colors: Record<string, string>;
	};
};

export type VariantThemeConfiguration = {
	readonly colors: FulfilledThemeConfiguration['colors'];
	fonts: {
		readonly colors: FulfilledThemeConfiguration['fonts']['colors'];
	};
	readonly backgrounds: FulfilledThemeConfiguration['backgrounds'];
	borders: {
		readonly colors: FulfilledThemeConfiguration['borders']['colors'];
	};
};

export type ThemeConfiguration = FulfilledThemeConfiguration & {
	variants: {
		[key: PropertyKey]: AllPartial<VariantThemeConfiguration>;
	};
};

export type UnionConfiguration = ReturnType<typeof generateConfig>;
