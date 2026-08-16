/**
 * Error surfaces: ISO 7816 status words, ES10 result codes and the ES9+
 * `functionExecutionStatus` block that the UI renders through RemoteErrorView.
 */

import { byteToHex, bytesToHex } from './bytes';

export interface RemoteError {
  status?: string;
  message?: string;
  reasonCode?: string;
  subjectCode?: string;
}

/** Thrown for anything that carries an ES9+ status block. */
export class RemoteErrorException extends Error {
  constructor(public readonly remoteError: RemoteError) {
    super(remoteError.message || 'SM-DP+ error');
  }
}

/** Thrown when the card answers with an unexpected status word. */
export class ApduError extends Error {
  constructor(message: string, public readonly sw?: string) {
    super(message);
  }
}

/** Decode the trailing SW1/SW2 pair into a readable message. */
export function statusWordMessage(bytes: Uint8Array): string {
  const i = Math.max(bytes.length - 2, 0);
  const sw1 = bytes[i];
  const sw2 = bytes[i + 1];

  switch (sw1) {
    case 0x62:
      switch (sw2) {
        case 0x00: return 'No information provided';
        case 0x81: return 'Returned data may be corrupted';
        case 0x82: return 'End of file reached before reading Le bytes';
        case 0x83: return 'Selected file invalidated';
        case 0x84: return 'FCI not formatted as required';
      }
      break;
    case 0x63:
      if (sw2 === 0x00) return 'Authentication failed';
      if ((sw2 & 0xf0) === 0xc0) return `Verification failed, ${sw2 & 0x0f} retries left`;
      break;
    case 0x64:
      if (sw2 === 0x00) return 'Execution error, state unchanged';
      break;
    case 0x65:
      if (sw2 === 0x81) return 'Memory failure';
      break;
    case 0x67:
      if (sw2 === 0x00) return 'Wrong length';
      break;
    case 0x68:
      switch (sw2) {
        case 0x81: return 'Logical channel not supported';
        case 0x82: return 'Secure messaging not supported';
        case 0x84: return 'Command chaining not supported';
      }
      break;
    case 0x69:
      switch (sw2) {
        case 0x00: return 'Command not allowed';
        case 0x81: return 'Command incompatible with file structure';
        case 0x82: return 'Security status not satisfied';
        case 0x83: return 'Authentication method blocked';
        case 0x84: return 'Referenced data invalidated';
        case 0x85: return 'Conditions of use not satisfied';
        case 0x86: return 'Command not allowed (no current EF)';
      }
      break;
    case 0x6a:
      switch (sw2) {
        case 0x80: return 'Incorrect parameters in the data field';
        case 0x81: return 'Function not supported';
        case 0x82: return 'File not found';
        case 0x83: return 'Record not found';
        case 0x84: return 'Not enough memory space in the file';
        case 0x86: return 'Incorrect P1 or P2';
        case 0x88: return 'Referenced data not found';
      }
      break;
    case 0x6b:
      if (sw2 === 0x00) return 'Wrong parameters';
      break;
    case 0x6c:
      return `Wrong Le, expected ${sw2} bytes`;
    case 0x6d:
      if (sw2 === 0x00) return 'Instruction code not supported';
      break;
    case 0x6e:
      if (sw2 === 0x00) return 'Class not supported';
      break;
    case 0x6f:
      if (sw2 === 0x00) return 'No precise diagnosis';
      break;
  }
  return `Unexpected status word ${byteToHex(sw1)}${byteToHex(sw2)}`;
}

export function statusWordHex(bytes: Uint8Array): string {
  const i = Math.max(bytes.length - 2, 0);
  return bytesToHex(bytes, i, i + 2);
}

/**
 * ES10b/c result codes shared by EnableProfile / DisableProfile /
 * DeleteProfile / SetNickname (SGP.22 §5.7.16-5.7.19).
 */
export function profileResultMessage(operation: string, code: string): string {
  switch (code) {
    case '01': return `${operation} failed: ICCID or AID not found`;
    case '02':
      return operation === 'DisableProfile'
        ? 'DisableProfile failed: profile not in enabled state'
        : `${operation} failed: profile not in disabled state`;
    case '03': return `${operation} failed: disallowed by policy`;
    case '04': return `${operation} failed: wrong profile reenabling`;
    case '05': return `${operation} failed: catbusy`;
    case '7F': return `${operation} failed: undefined error`;
    default: return `${operation} failed: result code ${code}`;
  }
}

/**
 * Build the RemoteError the UI renders from an ES9+ response header.
 * Returns undefined when the call succeeded.
 */
export function remoteErrorFrom(response: any): RemoteError | undefined {
  const status = response?.header?.functionExecutionStatus;
  if (!status) {
    return undefined;
  }
  if (status.status === 'Executed-Success') {
    return undefined;
  }
  const data = status.statusCodeData || {};
  return {
    status: status.status,
    message: data.message || status.status,
    reasonCode: data.reasonCode,
    subjectCode: data.subjectCode,
  };
}
