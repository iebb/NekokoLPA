import features from '@/shared/config/features.json';

export interface FeatureConfig {
  simplifiedMode: boolean;
}

const config: FeatureConfig = features;

export default config;

export const isSimplifiedMode = () => false; // config.simplifiedMode;
