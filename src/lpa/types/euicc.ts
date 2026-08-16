/**
 * Types describing the eUICC itself, as returned by the wasm LPA runtime.
 * Profile-level types live in `./profile`.
 */

export interface CertificationDataObject {
  discoveryBaseURL: string;
  platformLabel: string;
}

export interface EXTCardResource {
  freeNonVolatileMemory: number;
  freeVolatileMemory: number;
  installedApplication: number;
}

/** GSMA EUICCInfo2 structure. */
export interface EuiccInfo2 {
  certificationDataObject: CertificationDataObject;
  euiccCategory: null;
  euiccCiPKIdListForSigning: string[];
  euiccCiPKIdListForVerification: string[];
  euiccFirmwareVer: string;
  extCardResource: EXTCardResource;
  forbiddenProfilePolicyRules: string[];
  globalplatformVersion: string;
  ppVersion: string;
  profileVersion: string;
  rspCapability: string[];
  sasAcreditationNumber: string;
  svn: string;
  ts102241Version: string;
  uiccCapability: string[];
}

export interface EuiccConfiguredAddresses {
  defaultDpAddress?: string;
  rootDsAddress?: string;
}

/** Payload of the runtime's `get_euicc_info` command. */
export interface EuiccInfoResult {
  eidValue: string;
  EUICCInfo2?: EuiccInfo2;
  EuiccConfiguredAddresses?: EuiccConfiguredAddresses;
}

/** Pending operator acknowledgement stored on the card. */
export interface Notification {
  iccid: string;
  notificationAddress: string;
  /** Bit flag: 0x10 delete, 0x20 disable, 0x40 enable, 0x80 install. */
  profileManagementOperation: number;
  seqNumber: number;
}

/** Progress reported by long-running runtime operations. */
export interface ProgressUpdate {
  message?: string;
  progress?: number;
  total?: number;
}
