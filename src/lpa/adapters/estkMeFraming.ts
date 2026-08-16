/**
 * ESTKme-RED wire framing.
 *
 * Every request is `[command, lengthLo, lengthHi, ...payload]`, and responses
 * come back with the same 3-byte header followed by `length` bytes spread over
 * as many notifications as the MTU requires.
 *
 * Kept free of react-native-ble-plx imports so it can be unit tested.
 */

export function hexToUint8Array(hexString: string): Uint8Array {
  const byteArray = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    byteArray[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  }
  return byteArray;
}

export function uint8ArrayToHex(uint8Array: Uint8Array): string {
  return Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Prefixes a 2-byte little-endian length header to an APDU payload.
 *
 * The low byte is `length & 0xFF`, not `length % 255`: the modulo form is off
 * by one for every payload of 255 bytes or more (255 encodes as 0, 256 as 1
 * with a stray high byte), which corrupts exactly the long writes a profile
 * download is made of while leaving short APDUs working.
 */
export function addHeaderToUint8Array(hexString: string): Uint8Array {
  const byteArray = hexToUint8Array(hexString);
  const length = byteArray.length;
  const header = new Uint8Array([length & 0xff, (length >> 8) & 0xff]);
  const result = new Uint8Array(header.length + byteArray.length);
  result.set(header);
  result.set(byteArray, header.length);
  return result;
}
