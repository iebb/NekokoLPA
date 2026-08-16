/**
 * SGP.22 response models.
 *
 * The JSON these produce is what `Adapter` and the screens consume, so the
 * field names match the shapes previously emitted by lpac
 * (see src/native/types.ts and src/native/types/LPA.ts).
 */

import {
  Base64,
  bytesToHex,
  bytesToInt,
  hexToBytes,
  hexToUtf8,
  swapNibbles,
  toVersionString,
} from './bytes';
import {
  Field,
  Schema,
  Sequence,
  Tlv,
  build,
  decode,
  encodeLength,
  find,
  findHex,
  findPath,
  isConstructed,
  mapTlvs,
  toHex,
} from './bertlv';

/* -------------------------------------------------------------------------
 * Small field decoders
 * ---------------------------------------------------------------------- */

/** BCD ICCID: nibble-swapped, trailing filler removed. */
export function decodeIccid(hex: string): string {
  const swapped = swapNibbles(hex);
  return swapped.replace(/[Ff]+$/, '');
}

/**
 * 3-octet mccMnc (3GPP TS 24.008) -> "44010" / "310260".
 *
 * octet1 = MCC2<<4 | MCC1, octet2 = MNC3<<4 | MCC3, octet3 = MNC2<<4 | MNC1.
 * The 'F' filler of a two-digit MNC is dropped so the value can be looked up
 * directly in src/data/plmn.json.
 */
export function decodeMccMnc(hex: string): string {
  if (!hex || hex.length < 6) {
    return '';
  }
  const b = hexToBytes(hex.substring(0, 6));
  const mcc = `${b[0] & 0x0f}${(b[0] >> 4) & 0x0f}${b[1] & 0x0f}`;
  const mnc3 = (b[1] >> 4) & 0x0f;
  const mnc = `${b[2] & 0x0f}${(b[2] >> 4) & 0x0f}${mnc3 === 0x0f ? '' : mnc3}`;
  return mcc + mnc;
}

/** Decode a BIT STRING (leading octet = unused bit count) into labels. */
function decodeBitString(hex: string, labels: string[]): string[] {
  if (!hex || hex.length < 2) {
    return [];
  }
  const bytes = hexToBytes(hex);
  const unused = bytes[0];
  const totalBits = (bytes.length - 1) * 8 - unused;
  const out: string[] = [];
  for (let bit = 0; bit < totalBits; bit++) {
    const byte = bytes[1 + (bit >> 3)];
    if (byte & (0x80 >> (bit & 7))) {
      out.push(labels[bit] !== undefined ? labels[bit] : `bit${bit}`);
    }
  }
  return out;
}

const UICC_CAPABILITY_LABELS = [
  'contactlessSupport', 'usimSupport', 'isimSupport', 'csimSupport',
  'akaMilenage', 'akaCave', 'akaTuak128', 'akaTuak256',
  'usimTestAlgorithm', 'rfu2', 'gbaAuthenUsim', 'gbaAuthenISim',
  'mbmsSupport', 'eapClient', 'javacard', 'multos',
  'multipleUsimSupport', 'multipleIsimSupport', 'multipleCsimSupport',
  'berTlvFileSupport', 'dfLinkSupport', 'catTp', 'getIdentity',
  'profile-a-x25519', 'profile-b-p256', 'suciCalculatorApi',
  'dns-resolution', 'scp11ac', 'scp11c-authorization-mechanism',
  's16mode', 'eaka', 'iotminimal',
];

const RSP_CAPABILITY_LABELS = [
  'additionalProfile', 'crlSupport', 'rpmSupport', 'testProfileSupport',
  'deviceInfoExtensibilitySupport', 'serviceSpecificDataSupport',
  'hriServerAddressSupport', 'serviceProviderMessageSupport',
  'lpaProxySupport', 'enterpriseProfilesSupported', 'serviceDescriptionSupport',
  'deviceChangeSupport', 'encryptedDeviceChangeDataSupport',
  'estimatedProfileSizeSupport', 'lpaProxyConfigurationSupport',
  'getCertsSupport', 'profileSizeInProfilesInfoSupport',
];

const PPR_LABELS = ['pprUpdateControl', 'ppr1', 'ppr2', 'ppr3'];

/** ProfileClass (tag '95'). */
export function decodeProfileClass(hex: string): string {
  switch (hex) {
    case '00': return 'test';
    case '01': return 'provisioning';
    default: return 'operational';
  }
}

/** Collect the hex of every child of a constructed node. */
function childHexList(node: Tlv): string[] {
  if (!isConstructed(node)) {
    return [];
  }
  return (node.value as Tlv[]).map((child) =>
    isConstructed(child) ? toHex(child) : (child.value as string),
  );
}

/* -------------------------------------------------------------------------
 * EUICCInfo2 (BF22) / EUICCInfo1 (BF20)
 * ---------------------------------------------------------------------- */

export interface ExtCardResource {
  installedApplication: number;
  freeNonVolatileMemory: number;
  freeVolatileMemory: number;
}

function parseExtCardResource(hex: string): ExtCardResource {
  const nodes = decode(hexToBytes(hex));
  const readInt = (tag: string): number => {
    const value = findHex(nodes, tag);
    return value ? bytesToInt(hexToBytes(value)) : 0;
  };
  return {
    installedApplication: readInt('81'),
    freeNonVolatileMemory: readInt('82'),
    freeVolatileMemory: readInt('83'),
  };
}

const EUICC_INFO2_SCHEMA: Schema = {
  '81': { key: 'profileVersion', format: toVersionString },
  '82': { key: 'svn', format: toVersionString },
  '83': { key: 'euiccFirmwareVer', format: toVersionString },
  '84': { key: 'extCardResource', format: parseExtCardResource },
  '85': { key: 'uiccCapability', format: (h) => decodeBitString(h, UICC_CAPABILITY_LABELS) },
  '86': { key: 'ts102241Version', format: toVersionString },
  '87': { key: 'globalplatformVersion', format: toVersionString },
  '88': { key: 'rspCapability', format: (h) => decodeBitString(h, RSP_CAPABILITY_LABELS) },
  A9: { key: 'euiccCiPKIdListForVerification', formatNode: childHexList },
  AA: { key: 'euiccCiPKIdListForSigning', formatNode: childHexList },
  AB: { key: 'euiccCategory', format: (h) => bytesToInt(hexToBytes(h)) },
  '99': { key: 'forbiddenProfilePolicyRules', format: (h) => decodeBitString(h, PPR_LABELS) },
  '04': { key: 'ppVersion', format: toVersionString },
  '0C': { key: 'sasAcreditationNumber', format: hexToUtf8 },
  AC: {
    key: 'certificationDataObject',
    formatNode: (node) =>
      mapTlvs(isConstructed(node) ? (node.value as Tlv[]) : [], {
        '0C': new Sequence([
          { key: 'platformLabel', format: hexToUtf8 },
          { key: 'discoveryBaseURL', format: hexToUtf8 },
        ]),
      }),
  },
};

export interface EuiccInfo2 {
  profileVersion: string;
  svn: string;
  euiccFirmwareVer: string;
  extCardResource: ExtCardResource;
  uiccCapability: string[];
  ts102241Version: string;
  globalplatformVersion: string;
  rspCapability: string[];
  euiccCiPKIdListForVerification: string[];
  euiccCiPKIdListForSigning: string[];
  euiccCategory: number | null;
  forbiddenProfilePolicyRules: string[];
  ppVersion: string;
  sasAcreditationNumber: string;
  certificationDataObject: { platformLabel?: string; discoveryBaseURL?: string };
}

const EMPTY_EXT_CARD_RESOURCE: ExtCardResource = {
  installedApplication: 0,
  freeNonVolatileMemory: 0,
  freeVolatileMemory: 0,
};

export function parseEuiccInfo2(bytes: Uint8Array): EuiccInfo2 {
  const root = find(decode(bytes), 'BF22');
  if (!root || !isConstructed(root)) {
    throw new Error(`GetEUICCInfo2: unexpected response ${bytesToHex(bytes, 0, 2)}`);
  }
  const parsed = mapTlvs(root.value as Tlv[], EUICC_INFO2_SCHEMA);
  return {
    profileVersion: parsed.profileVersion || '',
    svn: parsed.svn || '',
    euiccFirmwareVer: parsed.euiccFirmwareVer || '',
    extCardResource: parsed.extCardResource || EMPTY_EXT_CARD_RESOURCE,
    uiccCapability: parsed.uiccCapability || [],
    ts102241Version: parsed.ts102241Version || '',
    globalplatformVersion: parsed.globalplatformVersion || '',
    rspCapability: parsed.rspCapability || [],
    euiccCiPKIdListForVerification: parsed.euiccCiPKIdListForVerification || [],
    euiccCiPKIdListForSigning: parsed.euiccCiPKIdListForSigning || [],
    euiccCategory: parsed.euiccCategory === undefined ? null : parsed.euiccCategory,
    forbiddenProfilePolicyRules: parsed.forbiddenProfilePolicyRules || [],
    ppVersion: parsed.ppVersion || '',
    sasAcreditationNumber: parsed.sasAcreditationNumber || '',
    certificationDataObject: parsed.certificationDataObject || {},
  };
}

/* -------------------------------------------------------------------------
 * ES10a: EuiccConfiguredAddresses (BF3C)
 * ---------------------------------------------------------------------- */

export interface EuiccConfiguredAddresses {
  defaultDpAddress?: string;
  rootDsAddress?: string;
}

export function parseConfiguredAddresses(bytes: Uint8Array): EuiccConfiguredAddresses {
  const root = find(decode(bytes), 'BF3C');
  if (!root || !isConstructed(root)) {
    return {};
  }
  const parsed = mapTlvs(root.value as Tlv[], {
    '80': { key: 'defaultDpAddress', format: hexToUtf8 },
    '81': { key: 'rootDsAddress', format: hexToUtf8 },
  });
  return {
    defaultDpAddress: parsed.defaultDpAddress || '',
    rootDsAddress: parsed.rootDsAddress || '',
  };
}

/* -------------------------------------------------------------------------
 * Profile metadata: ProfileInfo (E3) and StoreMetadataRequest (BF25)
 * ---------------------------------------------------------------------- */

export interface ProfileMetadata {
  iccid: string;
  isdpAid?: string;
  profileState: number;
  profileNickname: string;
  serviceProviderName: string;
  profileName: string;
  profileClass: string;
  profileOwnerMccMnc: string;
  icon?: string;
  iconType?: string;
  profilePolicyRules?: string[];
}

const PROFILE_OWNER_FIELD: Field = {
  key: 'profileOwnerMccMnc',
  formatNode: (node) => {
    if (!isConstructed(node)) {
      return '';
    }
    const mccMnc = findHex(node.value as Tlv[], '80');
    return mccMnc ? decodeMccMnc(mccMnc) : '';
  },
};

const METADATA_SCHEMA: Schema = {
  '5A': { key: 'iccid', format: decodeIccid },
  '4F': { key: 'isdpAid' },
  '9F70': { key: 'profileState', format: (h) => bytesToInt(hexToBytes(h)) },
  '90': { key: 'profileNickname', format: hexToUtf8 },
  '91': { key: 'serviceProviderName', format: hexToUtf8 },
  '92': { key: 'profileName', format: hexToUtf8 },
  '93': { key: 'iconType', format: (h) => (h === '01' ? 'jpg' : 'png') },
  '94': { key: 'icon', format: Base64.fromHex },
  '95': { key: 'profileClass', format: decodeProfileClass },
  B7: PROFILE_OWNER_FIELD,
  '99': { key: 'profilePolicyRules', format: (h) => decodeBitString(h, PPR_LABELS) },
};

function toProfileMetadata(parsed: any): ProfileMetadata {
  return {
    iccid: parsed.iccid || '',
    isdpAid: parsed.isdpAid,
    // absent 9F70 means "not applicable" (download metadata); default to disabled
    profileState: parsed.profileState === undefined ? 0 : parsed.profileState,
    profileNickname: parsed.profileNickname || '',
    serviceProviderName: parsed.serviceProviderName || '',
    profileName: parsed.profileName || '',
    profileClass: parsed.profileClass || 'operational',
    // MetadataView calls .replaceAll on this, so it must never be undefined
    profileOwnerMccMnc: parsed.profileOwnerMccMnc || '',
    icon: parsed.icon,
    iconType: parsed.iconType,
    profilePolicyRules: parsed.profilePolicyRules || [],
  };
}

/** ES10c.GetProfilesInfo response (BF2D) -> profile list. */
export function parseProfileInfoList(bytes: Uint8Array): ProfileMetadata[] {
  const root = find(decode(bytes), 'BF2D');
  if (!root || !isConstructed(root)) {
    throw new Error(`GetProfilesInfo: unexpected response ${bytesToHex(bytes, 0, 2)}`);
  }
  const out: ProfileMetadata[] = [];
  for (const node of root.value as Tlv[]) {
    if (node.tag === 'A0' && isConstructed(node)) {
      for (const child of node.value as Tlv[]) {
        if (child.tag === 'E3' && isConstructed(child)) {
          out.push(toProfileMetadata(mapTlvs(child.value as Tlv[], METADATA_SCHEMA)));
        }
      }
    } else if (node.tag === '02') {
      throw new Error(`GetProfilesInfo failed with error code ${node.value}`);
    }
  }
  return out;
}

/** StoreMetadataRequest (BF25) from the SM-DP+, base64 or bytes. */
export function parseStoreMetadata(input: string | Uint8Array): ProfileMetadata {
  const bytes = typeof input === 'string' ? Base64.toBytes(input) : input;
  const root = find(decode(bytes), 'BF25');
  if (!root || !isConstructed(root)) {
    throw new Error('Invalid profile metadata from SM-DP+');
  }
  return toProfileMetadata(mapTlvs(root.value as Tlv[], METADATA_SCHEMA));
}

/* -------------------------------------------------------------------------
 * Notifications
 * ---------------------------------------------------------------------- */

export interface NotificationMetadata {
  seqNumber: number;
  profileManagementOperation: number;
  notificationAddress: string;
  iccid: string;
}

const NOTIFICATION_SCHEMA: Schema = {
  '80': { key: 'seqNumber', format: (h) => bytesToInt(hexToBytes(h)) },
  // BIT STRING: [unused-bits, flags]; the UI switches on 0x10/0x20/0x40/0x80
  '81': { key: 'profileManagementOperation', format: (h) => hexToBytes(h)[1] || 0 },
  '0C': { key: 'notificationAddress', format: hexToUtf8 },
  '5A': { key: 'iccid', format: decodeIccid },
};

function toNotification(parsed: any): NotificationMetadata {
  return {
    seqNumber: parsed.seqNumber === undefined ? 0 : parsed.seqNumber,
    profileManagementOperation: parsed.profileManagementOperation || 0,
    notificationAddress: parsed.notificationAddress || '',
    iccid: parsed.iccid || '',
  };
}

export function parseNotificationMetadata(node: Tlv): NotificationMetadata {
  return toNotification(mapTlvs(isConstructed(node) ? (node.value as Tlv[]) : [], NOTIFICATION_SCHEMA));
}

/** ES10b.ListNotification response (BF28). */
export function parseNotificationList(bytes: Uint8Array): NotificationMetadata[] {
  const root = find(decode(bytes), 'BF28');
  if (!root || !isConstructed(root)) {
    throw new Error(`ListNotification: unexpected response ${bytesToHex(bytes, 0, 2)}`);
  }
  const out: NotificationMetadata[] = [];
  for (const node of root.value as Tlv[]) {
    if (node.tag === 'A0' && isConstructed(node)) {
      for (const child of node.value as Tlv[]) {
        if (child.tag === 'BF2F') {
          out.push(parseNotificationMetadata(child));
        }
      }
    } else if (node.tag === '02') {
      throw new Error(`ListNotification failed with error code ${node.value}`);
    }
  }
  return out;
}

export interface PendingNotification {
  metadata: NotificationMetadata;
  /** base64 of the single PendingNotification element, for ES9+ */
  payload: string;
}

/** ES10b.RetrieveNotificationsList response (BF2B). */
export function parsePendingNotifications(bytes: Uint8Array): PendingNotification[] {
  const root = find(decode(bytes), 'BF2B');
  if (!root || !isConstructed(root)) {
    throw new Error(`RetrieveNotificationsList: unexpected response ${bytesToHex(bytes, 0, 2)}`);
  }
  const out: PendingNotification[] = [];
  for (const node of root.value as Tlv[]) {
    if (node.tag === 'A0' && isConstructed(node)) {
      for (const child of node.value as Tlv[]) {
        // either a ProfileInstallationResult (BF37) or an OtherSignedNotification (30)
        const metaNode = findPath([child], 'BF2F');
        out.push({
          metadata: metaNode ? parseNotificationMetadata(metaNode) : toNotification({}),
          payload: Base64.fromHex(toHex(child)),
        });
      }
    } else if (node.tag === '02') {
      throw new Error(`RetrieveNotificationsList failed with error code ${node.value}`);
    }
  }
  return out;
}

/* -------------------------------------------------------------------------
 * Download session responses
 * ---------------------------------------------------------------------- */

/** ES10b.AuthenticateServer response (BF38): ok -> base64 payload for ES9+. */
export function readAuthenticateServerResponse(bytes: Uint8Array): string {
  const root = find(decode(bytes), 'BF38');
  if (!root || !isConstructed(root)) {
    throw new Error(`AuthenticateServer: unexpected response ${bytesToHex(bytes, 0, 2)}`);
  }
  const children = root.value as Tlv[];
  const error = children.find((c) => c.tag === 'A1');
  if (error) {
    const code = findHex([error], '02');
    throw new Error(`AuthenticateServer rejected the SM-DP+: ${authenticateErrorText(code)}`);
  }
  return Base64.fromBytes(bytes);
}

function authenticateErrorText(code?: string): string {
  switch (code) {
    case '01': return 'invalid certificate';
    case '02': return 'invalid signature';
    case '03': return 'unsupported curve';
    case '04': return 'no session context';
    case '05': return 'invalid OID';
    case '06': return 'euicc challenge mismatch';
    case '07': return 'ci public key unknown';
    default: return `error code ${code}`;
  }
}

/** ES10b.PrepareDownload response (BF21): ok -> base64 payload for ES9+. */
export function readPrepareDownloadResponse(bytes: Uint8Array): string {
  const root = find(decode(bytes), 'BF21');
  if (!root || !isConstructed(root)) {
    throw new Error(`PrepareDownload: unexpected response ${bytesToHex(bytes, 0, 2)}`);
  }
  const children = root.value as Tlv[];
  const error = children.find((c) => c.tag === 'A1');
  if (error) {
    const code = findHex([error], '02');
    throw new Error(`PrepareDownload rejected: ${prepareDownloadErrorText(code)}`);
  }
  return Base64.fromBytes(bytes);
}

function prepareDownloadErrorText(code?: string): string {
  switch (code) {
    case '01': return 'invalid certificate';
    case '02': return 'invalid signature';
    case '03': return 'unsupported curve';
    case '04': return 'no session context';
    case '05': return 'missing transaction id';
    default: return `error code ${code}`;
  }
}

export interface InstallationResult {
  success: boolean;
  /** BppCommandId that failed, when unsuccessful */
  bppCommandId?: string;
  errorReason?: string;
  notification?: NotificationMetadata;
  /** base64 of the whole BF37, to be posted to ES9+ handleNotification */
  payload: string;
}

const BPP_COMMAND_IDS = [
  'initialiseSecureChannel', 'configureISDP', 'storeMetadata', 'storeMetadata2',
  'replaceSessionKeys', 'loadProfileElements',
];

const INSTALL_ERROR_REASONS: { [code: string]: string } = {
  '01': 'incorrect input values',
  '02': 'invalid signature',
  '03': 'invalid transaction id',
  '04': 'unsupported CRT values',
  '05': 'unsupported remote operation type',
  '06': 'unsupported profile class',
  '07': 'SCP03t structure error',
  '08': 'SCP03t security error',
  '09': 'ICCID already exists on this eUICC',
  '0A': 'insufficient memory for profile',
  '0B': 'interrupted',
  '0C': 'PE processing error',
  '0D': 'data mismatch',
  '0E': 'invalid NAA key',
  '0F': 'PPR not allowed',
  '7F': 'undefined error',
};

/** ES10b.LoadBoundProfilePackage result: ProfileInstallationResult (BF37). */
export function parseInstallationResult(bytes: Uint8Array): InstallationResult {
  const root = find(decode(bytes), 'BF37');
  if (!root || !isConstructed(root)) {
    throw new Error(`LoadBoundProfilePackage: unexpected response ${bytesToHex(bytes, 0, 2)}`);
  }
  const data = find(root.value as Tlv[], 'BF27');
  const metaNode = data ? find([data], 'BF2F') : undefined;
  const notification = metaNode ? parseNotificationMetadata(metaNode) : undefined;

  const finalResult = data ? find([data], 'A2') : undefined;
  const successNode = finalResult ? (finalResult.value as Tlv[]).find((c) => c.tag === 'A0') : undefined;
  const errorNode = finalResult ? (finalResult.value as Tlv[]).find((c) => c.tag === 'A1') : undefined;

  let errorReason: string | undefined;
  let bppCommandId: string | undefined;
  if (errorNode && isConstructed(errorNode)) {
    const parsed = mapTlvs(errorNode.value as Tlv[], {
      '80': { key: 'bppCommandId', format: (h) => bytesToInt(hexToBytes(h)) },
      '81': { key: 'errorReason', format: (h: string) => h },
    });
    bppCommandId = BPP_COMMAND_IDS[parsed.bppCommandId] || `command ${parsed.bppCommandId}`;
    errorReason = INSTALL_ERROR_REASONS[parsed.errorReason] || `error code ${parsed.errorReason}`;
  }

  return {
    success: !!successNode,
    bppCommandId,
    errorReason,
    notification,
    payload: Base64.fromBytes(toBytesOf(root)),
  };
}

function toBytesOf(node: Tlv): Uint8Array {
  return hexToBytes(toHex(node));
}

/* -------------------------------------------------------------------------
 * BoundProfilePackage segmentation (SGP.22 §2.5.5)
 * ---------------------------------------------------------------------- */

/**
 * Split a BoundProfilePackage (BF36) into the ES10b.LoadBoundProfilePackage
 * segments the eUICC expects:
 *   1. the BF36 header + the whole initialiseSecureChannelRequest (BF23)
 *   2. the whole first sequenceOf87 (A0)
 *   3. the A1 header, then each '88' element separately
 *   4. the whole A2
 *   5. the A3 header, then each '86' element separately
 */
export function segmentBoundProfilePackage(input: string | Uint8Array): Uint8Array[] {
  const bytes = typeof input === 'string' ? Base64.toBytes(input) : input;
  const nodes = decode(bytes);
  const root = nodes[0];
  if (!root || !isConstructed(root)) {
    throw new Error('Invalid BoundProfilePackage');
  }
  const header = root.tag + encodeLength(root.length);
  const blocks: string[] = [];

  for (const node of root.value as Tlv[]) {
    switch (node.tag) {
      case 'BF23':
        blocks.push(header + toHex(node));
        break;
      case 'A0':
      case 'A2':
        blocks.push(toHex(node));
        break;
      case 'A1':
      case 'A3': {
        blocks.push(node.tag + encodeLength(node.length));
        for (const child of node.value as Tlv[]) {
          blocks.push(toHex(child));
        }
        break;
      }
      default:
        break;
    }
  }
  return blocks.map(hexToBytes);
}

/** Total payload size of a BPP, used for download progress reporting. */
export function boundProfilePackageSize(blocks: Uint8Array[]): number {
  let total = 0;
  for (const block of blocks) {
    total += block.length;
  }
  return total;
}

export { build, decode, find, findHex, findPath, toHex };
