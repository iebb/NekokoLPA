export interface Profiles {
  profiles: ProfileMetadataMap[];
}

export interface Profile extends ProfileMetadataMap {
}



export interface ProfileMetadataMap {
  iccid: string;
  profileState: number;
  profileName: string;
  profileNickname?: string;
  serviceProviderName: string;
  profileOwnerMccMnc: string;
  // ICON?: string;
  // CLASS?: string;
  // MCC_MNC?: string;
  // PROFILE_SIZE?: string;
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




export interface EuiccInfo2 {
  certificationDataObject:        CertificationDataObject;
  euiccCategory:                  null;
  euiccCiPKIdListForSigning:      string[];
  euiccCiPKIdListForVerification: string[];
  euiccFirmwareVer:               string;
  extCardResource:                EXTCardResource;
  forbiddenProfilePolicyRules:    string[];
  globalplatformVersion:          string;
  ppVersion:                      string;
  profileVersion:                 string;
  rspCapability:                  string[];
  sasAcreditationNumber:          string;
  svn:                            string;
  ts102241Version:                string;
  uiccCapability:                 string[];
}

export interface EXTCardResource {
  freeNonVolatileMemory: number;
  freeVolatileMemory:    number;
  installedApplication:  number;
}
