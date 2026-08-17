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
  /**
   * `operational` or `provisioning`, per SGP.22 tag 95.
   *
   * The LPA has always parsed these — see ProfileMetadata in lpa/core/models —
   * but this type declared a narrower shape, so screens could not read fields
   * the card had already reported.
   */
  profileClass?: string;
  isdpAid?: string;
  icon?: string;
  iconType?: string;
  profilePolicyRules?: string[];
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
}
