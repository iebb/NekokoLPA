/**
 * Minimal base64 codec for binary payloads.
 *
 * react-native-ble-plx exchanges characteristic values as base64 strings, so
 * the BLE adapters need Uint8Array <-> base64 in both directions. The runtime's
 * atob/btoa only speak binary strings, which means an extra lossy-by-accident
 * conversion step, so this works on bytes directly.
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Reverse lookup; 255 marks "not a base64 digit" (padding, whitespace, junk). */
const LOOKUP = (() => {
  const table = new Uint8Array(256).fill(255);
  for (let i = 0; i < ALPHABET.length; i++) {
    table[ALPHABET.charCodeAt(i)] = i;
  }
  return table;
})();

/** Encodes bytes as a padded base64 string. */
export function bytesToBase64(bytes: Uint8Array): string {
  const length = bytes.length;
  const remainder = length % 3;
  const tripleEnd = length - remainder;
  let out = '';

  for (let i = 0; i < tripleEnd; i += 3) {
    const chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out +=
      ALPHABET[(chunk >> 18) & 63] +
      ALPHABET[(chunk >> 12) & 63] +
      ALPHABET[(chunk >> 6) & 63] +
      ALPHABET[chunk & 63];
  }

  if (remainder === 1) {
    const chunk = bytes[tripleEnd];
    out += ALPHABET[chunk >> 2] + ALPHABET[(chunk << 4) & 63] + '==';
  } else if (remainder === 2) {
    const chunk = (bytes[tripleEnd] << 8) | bytes[tripleEnd + 1];
    out += ALPHABET[chunk >> 10] + ALPHABET[(chunk >> 4) & 63] + ALPHABET[(chunk << 2) & 63] + '=';
  }

  return out;
}

/**
 * Decodes a base64 string to bytes. Characters outside the alphabet — padding,
 * whitespace, line breaks — are skipped rather than treated as an error.
 */
export function base64ToBytes(base64: string): Uint8Array {
  // Collect only real base64 digits so padding and stray whitespace drop out.
  const digits: number[] = [];
  for (let i = 0; i < base64.length; i++) {
    const value = LOOKUP[base64.charCodeAt(i) & 0xff];
    if (value !== 255) {
      digits.push(value);
    }
  }

  const count = digits.length;
  const out = new Uint8Array((count * 3) >> 2);
  let p = 0;
  let i = 0;

  for (; i + 4 <= count; i += 4) {
    const chunk = (digits[i] << 18) | (digits[i + 1] << 12) | (digits[i + 2] << 6) | digits[i + 3];
    out[p++] = (chunk >> 16) & 0xff;
    out[p++] = (chunk >> 8) & 0xff;
    out[p++] = chunk & 0xff;
  }

  const leftover = count - i;
  if (leftover === 2) {
    out[p++] = ((digits[i] << 2) | (digits[i + 1] >> 4)) & 0xff;
  } else if (leftover === 3) {
    const chunk = (digits[i] << 10) | (digits[i + 1] << 4) | (digits[i + 2] >> 2);
    out[p++] = (chunk >> 8) & 0xff;
    out[p++] = chunk & 0xff;
  }

  return out;
}
