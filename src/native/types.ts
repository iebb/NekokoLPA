export interface Profiles {
  profiles: Profile[];
}

export interface Profile {
  profileMetadataMap: ProfileMetadataMap;
}

export interface ProfileMetadataMap {
  ICCID: string;
  STATE: string;
  ICON?: string;
  CLASS: string;
  NAME: string;
  NICKNAME: string;
  PROVIDER_NAME: string;
  uICCID: string;
  uMCC_MNC: string;
}

export interface RemoteError {
  status?: string;
  message?: string;
  reasonCode?: string;
  subjectCode?: string;
}

export interface AuthenticateResult {
  remoteError: RemoteError;
  isCcRequired:    boolean;
  profileMetadata: Profile;
  success:         boolean;
}

export interface DownloadResult {
  remoteError: RemoteError;
  success: boolean;
}


export interface EuiccInfo2 {
  baseProfilePackageVersion:      Values;
  certificationDataObject:        CertificationDataObject;
  euiccCiPKIdListForSigning:      EuiccCiPkIDList;
  euiccCiPKIdListForVerification: EuiccCiPkIDList;
  euiccFirmwareVersion:           Values;
  euiccRspCapability:             Bits;
  extCardResource:                Values;
  forbiddenProfilePolicyRules:    Bits;
  globalplatformVersion:          Values;
  lowestSvn:                      Values;
  ppVersion:                      Values;
  sasAcreditationNumber:          Values;
  ts102241Version:                Values;
  uiccCapability:                 Bits;
}


export interface CertificationDataObject {
  discoveryBaseURL: number[];
  platformLabel:    number[];
}

export interface EuiccCiPkIDList {
  seqOf: number[][];
}

export interface Bits {
  numBits: number;
  value:   number[];
}

export interface Values {
  value:   number[];
}
