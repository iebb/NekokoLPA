import {DimensionValue, Image, View} from 'react-native';

import LogoLight from '@/theme/assets/images/shiroya.png';
import {useTheme} from '@/theme';

type Props = {
	height?: DimensionValue;
	width?: DimensionValue;
	mode?: 'contain' | 'cover' | 'stretch' | 'repeat' | 'center';
};

export function Brand({ height = 200, width = 200, mode = 'contain' }: Props) {
	const { layout } = useTheme();

	return (
		<View testID="brand-img-wrapper" style={{ height, width }}>
			<Image testID="variant-image" source={LogoLight}
						 resizeMode={mode}
						 style={[layout.fullHeight, layout.fullWidth]} />
		</View>
	);
}

export default Brand;
