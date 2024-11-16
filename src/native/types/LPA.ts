export interface EuiccList {
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

export interface CertificationDataObject {
  discoveryBaseURL: string;
  platformLabel:    string;
}

export interface EXTCardResource {
  freeNonVolatileMemory: number;
  freeVolatileMemory:    number;
  installedApplication:  number;
}

export interface EuiccConfiguredAddresses {
  defaultDpAddress?: string;
  rootDsAddress?:    string;
}


export interface Notification {
  iccid:                      string;
  notificationAddress:        string;
  profileManagementOperation: number;
  seqNumber:                  number;
}