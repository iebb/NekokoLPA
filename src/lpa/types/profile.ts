/**
 * Profile-level types. eUICC/card-level types live in `./euicc`.
 */

/** Metadata for a single downloaded profile, as reported by the card. */
export interface ProfileMetadataMap {
  iccid: string;
  profileState: number;
  profileName: string;
  profileNickname?: string;
  serviceProviderName: string;
  profileOwnerMccMnc: string;
}

/** Alias kept for readability at call sites that deal with a single profile. */
export type Profile = ProfileMetadataMap;

/** Error returned by the SM-DP+ during authenticate/download. */
export interface RemoteError {
  status?: string;
  message?: string;
  reasonCode?: string;
  subjectCode?: string;
}

export interface AuthenticateResult {
  remoteError: RemoteError;
  isCcRequired: boolean;
  profileMetadata: ProfileMetadataMap;
  success: boolean;
}

export interface DownloadResult {
  remoteError: RemoteError;
  success: boolean;
  space_consumed?: number;
}
