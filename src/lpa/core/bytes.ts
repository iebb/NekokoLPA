import {base64ToBytes, bytesToBase64} from '@/shared/utils/base64';

/**
 * Byte / hex / text / base64 / SHA-256 primitives.
 *
 * Hermes-safe: no Buffer, no TextEncoder, no atob/btoa, no crypto. Base64
 * delegates to the shared codec; everything else is implemented here.
 */

const HEX_CHARS = '0123456789ABCDEF';

const HEX_BYTES: string[] = (() => {
  const table: string[] = new Array(256);
  for (let i = 0; i < 256; i++) {
    table[i] = HEX_CHARS[(i >>> 4) & 0x0f] + HEX_CHARS[i & 0x0f];
  }
  return table;
})();

const HEX_VALUES: { [key: string]: number } = {
  0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15,
};

export function byteToHex(b: number): string {
  return HEX_BYTES[b & 0xff];
}

export function bytesToHex(bytes: Uint8Array, start = 0, end?: number): string {
  const stop = end === undefined || end > bytes.length ? bytes.length : end;
  let out = '';
  for (let i = start; i < stop; i++) {
    out += HEX_BYTES[bytes[i]];
  }
  return out;
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.toUpperCase();
  const len = clean.length >>> 1;
  const out = new Uint8Array(len);
  for (let i = 0, j = 0; i < len; i++) {
    out[i] = (HEX_VALUES[clean.charAt(j++)] << 4) | HEX_VALUES[clean.charAt(j++)];
  }
  return out;
}

export function concatBytes(...parts: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const part of parts) {
    total += part.length;
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/**
 * Nibble swap, for BCD-coded fields (ICCID tag '5A', mccMnc).
 * An odd-length input is padded with 'F' before swapping, as the encoder did.
 */
export function swapNibbles(hex: string): string {
  const padded = hex.length % 2 === 0 ? hex : hex + 'F';
  let out = '';
  for (let i = 0; i < padded.length; i += 2) {
    out += padded.charAt(i + 1) + padded.charAt(i);
  }
  return out;
}

/** Version octet string -> "2.2.2" (lpac's rendering, no 'v' prefix). */
export function toVersionString(hex: string): string {
  const bytes = hexToBytes(hex);
  const parts: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    parts.push(bytes[i]);
  }
  return parts.join('.');
}

/** Big-endian unsigned integer from up to 6 bytes (stays inside 2^53). */
export function bytesToInt(bytes: Uint8Array, start = 0, end?: number): number {
  const stop = end === undefined || end > bytes.length ? bytes.length : end;
  let value = 0;
  for (let i = start; i < stop; i++) {
    value = value * 256 + (bytes[i] & 0xff);
  }
  return value;
}

export function intToHex(value: number, byteLength = 1): string {
  let hex = value.toString(16).toUpperCase();
  const want = byteLength << 1;
  if (hex.length < want) {
    hex = '0'.repeat(want - hex.length) + hex;
  }
  return hex.length % 2 === 0 ? hex : '0' + hex;
}

export const Utf8 = {
  encode(str: string): Uint8Array {
    if (!str) {
      return new Uint8Array(0);
    }
    const out: number[] = [];
    for (let i = 0; i < str.length; ) {
      const cp = str.codePointAt(i) || 0;
      let lead = 0;
      let shift = 0;
      if (cp <= 0x7f) {
        lead = 0;
      } else if (cp <= 0x7ff) {
        shift = 6;
        lead = 0xc0;
      } else if (cp <= 0xffff) {
        shift = 12;
        lead = 0xe0;
      } else {
        shift = 18;
        lead = 0xf0;
      }
      out.push(lead | (cp >>> shift));
      for (shift -= 6; shift >= 0; shift -= 6) {
        out.push(0x80 | ((cp >>> shift) & 0x3f));
      }
      i += cp >= 0x10000 ? 2 : 1;
    }
    return new Uint8Array(out);
  },

  decode(bytes: Uint8Array): string {
    if (!bytes || bytes.length === 0) {
      return '';
    }
    let out = '';
    for (let i = 0; i < bytes.length; ) {
      let b = bytes[i];
      let cp = 0;
      let extra = 0;
      if (b <= 0x7f) {
        cp = b & 0xff;
      } else if (b <= 0xdf) {
        extra = 1;
        cp = b & 0x1f;
      } else if (b <= 0xef) {
        extra = 2;
        cp = b & 0x0f;
      } else {
        extra = 3;
        cp = b & 0x07;
      }
      if (bytes.length - i - extra > 0) {
        for (let k = 0; k < extra; ) {
          b = bytes[i + ++k];
          cp = (cp << 6) | (b & 0x3f);
        }
      } else {
        cp = 0xfffd;
        extra = bytes.length - i;
      }
      out += String.fromCodePoint(cp);
      i += extra + 1;
    }
    return out;
  },
};

/** Decode a UTF-8 string held as a hex value. */
export function hexToUtf8(hex: string): string {
  return Utf8.decode(hexToBytes(hex));
}

/**
 * Base64 helpers over the shared codec in `@/shared/utils/base64`, plus the
 * hex conversions the RSP payloads need (ES9+ carries DER blobs as base64,
 * while the TLV layer works in hex).
 */
export const Base64 = {
  fromBytes(bytes: Uint8Array): string {
    return bytesToBase64(bytes);
  },

  toBytes(b64: string): Uint8Array {
    return base64ToBytes(b64);
  },

  fromHex(hex: string): string {
    return bytesToBase64(hexToBytes(hex));
  },

  toHex(b64: string): string {
    return bytesToHex(base64ToBytes(b64));
  },
};

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

/** SHA-256 over bytes or a UTF-8 string. */
export function sha256(input: Uint8Array | string): Uint8Array {
  const msg = typeof input === 'string' ? Utf8.encode(input) : input;
  const padded = new Uint8Array(((((msg.length + 8) >> 6) + 1) << 6));
  padded.set(msg);
  padded[msg.length] = 0x80;

  const view = new DataView(padded.buffer);
  const bitLen = msg.length * 8;
  view.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000));
  view.setUint32(padded.length - 4, bitLen >>> 0);

  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const w = new Uint32Array(64);

  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(off + i * 4);
    }
    for (let i = 16; i < 64; i++) {
      const x = w[i - 15];
      const y = w[i - 2];
      const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
      const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = H[0], b = H[1], c = H[2], d = H[3];
    let e = H[4], f = H[5], g = H[6], h = H[7];

    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e;
      e = (d + t1) >>> 0;
      d = c; c = b; b = a;
      a = (t1 + t2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) {
    outView.setUint32(i * 4, H[i]);
  }
  return out;
}

export function sha256Hex(input: Uint8Array | string): string {
  return bytesToHex(sha256(input));
}

/** Growable byte buffer used to reassemble GET RESPONSE chains. */
export class ByteBuffer {
  private buffer: Uint8Array;
  private offset = 0;

  constructor(capacity = 256) {
    this.buffer = new Uint8Array(capacity);
  }

  append(chunk: Uint8Array): ByteBuffer {
    const needed = this.offset + chunk.length;
    if (needed > this.buffer.length) {
      const next = new Uint8Array(Math.max(this.buffer.length << 1, needed));
      next.set(this.buffer.subarray(0, this.offset), 0);
      this.buffer = next;
    }
    this.buffer.set(chunk, this.offset);
    this.offset += chunk.length;
    return this;
  }

  get length(): number {
    return this.offset;
  }

  toBytes(): Uint8Array {
    return this.buffer.subarray(0, this.offset);
  }
}
