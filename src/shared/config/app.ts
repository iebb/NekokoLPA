import LogoImage from '@/assets/images/logo.png';
import runtimeConfig from '@/assets/config.json';
import {version} from '../../../package.json';

/**
 * Shape of `src/assets/config.json`, which is generated per build flavour by
 * `apply_variant.sh` and is therefore not tracked in git. Fields that only some
 * variants define are optional.
 */
export interface RuntimeConfig {
  appTitle: string;
  buyLink: string;
  buyLinkEsimData?: string;
  checkForUpdates: boolean;
  githubLink: string;
  displayGithubLink: boolean;
  appId: string;
  flavor: string;
  versionSuffix?: string;
  iOSTeamId?: string;
  iOSAppId?: string;
}

const config = runtimeConfig as RuntimeConfig;

/** Semantic app version, single source of truth for anything user-facing. */
export const AppVersion: string = version;

export const AppTitle = config.appTitle;
export const AppLogo = LogoImage;
export const AppBuyLink = config.buyLink;
export const AppBuyLinkEsimData = config.buyLinkEsimData;
export const AppCheckForUpdates = config.checkForUpdates;
export const GithubLink = config.githubLink;
export const DisplayGithubLink = config.displayGithubLink;
