import layout from '@/theme_legacy/layout';
import componentGenerators from '@/theme_legacy/components';
import type {Colors} from '@/types/theme/colors';
import type {Variant} from './config';
import type {Gutters} from './gutters';
import type {Fonts} from './fonts';
import type {Backgrounds} from './backgrounds';
import type {Borders} from './borders';

export type Theme = {
	colors: Colors;
	variant: Variant;
	layout: typeof layout;
	gutters: Gutters;
	fonts: Fonts;
	backgrounds: Backgrounds;
	borders: Borders;
	components: ReturnType<typeof componentGenerators>;
};

export type ComponentTheme = Omit<Theme, 'components'>;
