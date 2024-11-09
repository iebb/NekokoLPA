export interface Profiles {
  profiles: ProfileMetadataMap[];
}

export interface Profile extends ProfileMetadataMap {
}



export interface ProfileMetadataMap {
  ICCID: string;
  profileState: string;
  ICON?: string;
  CLASS?: string;
  profileName: string;
  profileNickname?: string;
  serviceProviderName: string;
  iccid: string;
  profileOwnerMccMnc: string;
  MCC_MNC?: string;
  PROFILE_SIZE?: string;
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
  profileMetadata: ProfileMetadataMap;
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
