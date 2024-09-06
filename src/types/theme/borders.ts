import { config } from '@/theme/_config';
import { staticBorderStyles } from '@/theme/borders';

import type { ArrayValue, RemoveBeforeSeparator, ToNumber } from './common';
import type { UnionConfiguration } from './config';

type BorderColorKeys = keyof UnionConfiguration['borders']['colors'];

export type BorderColors = {
	[key in BorderColorKeys]: RemoveBeforeSeparator<key> extends keyof UnionConfiguration['borders']['colors']
		? {
				borderColor: UnionConfiguration['borders']['colors'][RemoveBeforeSeparator<key>];
		  }
		: never;
};

type BorderTopRadiusKeys = `roundedTop_${ArrayValue<
	typeof config.borders.radius
>}`;

export type BorderTopRadius = {
	[key in BorderTopRadiusKeys]: {
		borderTopLeftRadius: ToNumber<RemoveBeforeSeparator<key>>;
		borderTopRightRadius: ToNumber<RemoveBeforeSeparator<key>>;
	};
};

type BorderBottomRadiusKeys = `roundedBottom_${ArrayValue<
	typeof config.borders.radius
>}`;

export type BorderBottomRadius = {
	[key in BorderBottomRadiusKeys]: {
		borderBottomLeftRadius: ToNumber<RemoveBeforeSeparator<key>>;
		borderBottomRightRadius: ToNumber<RemoveBeforeSeparator<key>>;
	};
};

type BorderRadiusKeys = `rounded_${ArrayValue<typeof config.borders.radius>}`;

export type BorderRadius = BorderBottomRadius &
	BorderTopRadius & {
		[key in BorderRadiusKeys]: {
			borderRadius: ToNumber<RemoveBeforeSeparator<key>>;
		};
	};

type BorderWidthTopKeys = `wTop_${ArrayValue<typeof config.borders.widths>}`;

export type BorderWidthsTop = {
	[key in BorderWidthTopKeys]: {
		borderWidth: ToNumber<RemoveBeforeSeparator<key>>;
	};
};

type BorderWidthBottomKeys = `wBottom_${ArrayValue<
	typeof config.borders.widths
>}`;

export type BorderWidthsBottom = {
	[key in BorderWidthBottomKeys]: {
		borderWidth: ToNumber<RemoveBeforeSeparator<key>>;
	};
};

type BorderWidthLeftKeys = `wLeft_${ArrayValue<typeof config.borders.widths>}`;

export type BorderWidthsLeft = {
	[key in BorderWidthLeftKeys]: {
		borderWidth: ToNumber<RemoveBeforeSeparator<key>>;
	};
};

type BorderWidthRightKeys = `wRight_${ArrayValue<
	typeof config.borders.widths
>}`;

export type BorderWidthsRight = {
	[key in BorderWidthRightKeys]: {
		borderWidth: ToNumber<RemoveBeforeSeparator<key>>;
	};
};

type BorderWidthKeys = `w_${ArrayValue<typeof config.borders.widths>}`;

export type BorderWidths = BorderWidthsTop &
	BorderWidthsBottom &
	BorderWidthsLeft &
	BorderWidthsRight & {
		[key in BorderWidthKeys]: {
			borderWidth: ToNumber<RemoveBeforeSeparator<key>>;
		};
	};

export type Borders = BorderColors &
	BorderRadius &
	BorderWidths &
	typeof staticBorderStyles;
