/**
 * BER-TLV codec and a small schema-driven TLV -> object mapper.
 *
 * A decoded node is `{ tag, length, value }`:
 *   - `tag` is the uppercase hex of the tag octets ("BF2F", "9F70", "5A")
 *   - `length` is the decoded content length in bytes
 *   - `value` is a hex string for primitive nodes, or a child array for
 *     constructed ones.
 */

import { bytesToHex, byteToHex, concatBytes, hexToBytes } from './bytes';

export interface Tlv {
  tag: string;
  length: number;
  value: string | Tlv[];
}

export function isConstructed(node: Tlv): node is Tlv & { value: Tlv[] } {
  return Array.isArray(node.value);
}

interface TagInfo {
  tag: string;
  constructed: boolean;
  end: number;
}

function readTag(bytes: Uint8Array, offset: number): TagInfo {
  if (offset >= bytes.length) {
    throw new Error('Invalid TLV tag: out of bounds');
  }
  let i = offset;
  const constructed = (bytes[offset] & 0x20) !== 0;
  if ((bytes[i++] & 0x1f) === 0x1f) {
    let guard = 0;
    while (i < bytes.length && bytes[i++] & 0x80) {
      if (++guard > 127) {
        throw new Error('Invalid TLV tag: too long');
      }
    }
    return { tag: bytesToHex(bytes, offset, i), constructed, end: i };
  }
  return { tag: byteToHex(bytes[offset]), constructed, end: i };
}

interface LengthInfo {
  length: number;
  end: number;
}

function readLength(bytes: Uint8Array, offset: number): LengthInfo {
  if (offset >= bytes.length) {
    throw new Error('Invalid TLV length: out of bounds');
  }
  let i = offset;
  if (!(bytes[i++] & 0x80)) {
    return { length: bytes[offset], end: i };
  }
  const count = bytes[offset] & 0x7f;
  if (count === 0) {
    throw new Error('Indefinite-length TLV is not supported');
  }
  if (offset + count > bytes.length) {
    throw new Error('TLV length exceeds available data');
  }
  let length = bytes[i++];
  for (let k = 1; k < count; k++) {
    length = length * 256 + bytes[i++];
  }
  return { length, end: i };
}

/** Encode a content length in hex: short form <= 127, else 8x + big-endian. */
export function encodeLength(length: number): string {
  let hex = length.toString(16).toUpperCase();
  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }
  if (length <= 127) {
    return hex;
  }
  return (0x80 | (hex.length >> 1)).toString(16).toUpperCase() + hex;
}

/** Decode a byte range into a list of TLV nodes. */
export function decode(bytes: Uint8Array, start = 0, end?: number): Tlv[] {
  let offset = start;
  const stop = end === undefined || end > bytes.length ? bytes.length : end;
  const out: Tlv[] = [];
  while (offset < stop) {
    const tag = readTag(bytes, offset);
    offset = tag.end;
    const len = readLength(bytes, offset);
    const contentStart = len.end;
    offset = contentStart + len.length;
    const value = tag.constructed
      ? decode(bytes, contentStart, offset)
      : bytesToHex(bytes, contentStart, offset);
    out.push({ tag: tag.tag, length: len.length, value });
  }
  return out;
}

/** Decode a hex string. */
export function decodeHex(hex: string): Tlv[] {
  return decode(hexToBytes(hex));
}

/**
 * Depth-first search for `tag`: the current level first, then recursively
 * into constructed nodes.
 */
export function find(nodes: Tlv[], tag: string): Tlv | undefined {
  const constructed: Tlv[] = [];
  for (const node of nodes) {
    if (node.tag === tag) {
      return node;
    }
    if (isConstructed(node)) {
      constructed.push(node);
    }
  }
  for (const node of constructed) {
    const hit = find(node.value as Tlv[], tag);
    if (hit) {
      return hit;
    }
  }
  return undefined;
}

/** Walk a tag path and return the node it lands on. */
export function findPath(nodes: Tlv[], ...tags: string[]): Tlv | undefined {
  let current: Tlv[] | undefined = nodes;
  let node: Tlv | undefined;
  for (const tag of tags) {
    if (!current || current.length === 0) {
      return undefined;
    }
    node = find(current, tag);
    if (!node) {
      return undefined;
    }
    current = isConstructed(node) ? (node.value as Tlv[]) : undefined;
  }
  return node;
}

/** Walk a tag path and return the leaf's hex value. */
export function findHex(nodes: Tlv[], ...tags: string[]): string | undefined {
  const node = findPath(nodes, ...tags);
  if (!node || isConstructed(node)) {
    return undefined;
  }
  return node.value as string;
}

/** Serialize a node (and its children) back to hex. */
export function toHex(node: Tlv): string {
  if (!isConstructed(node)) {
    return node.tag + encodeLength(node.length) + (node.value as string);
  }
  let out = node.tag + encodeLength(node.length);
  for (const child of node.value as Tlv[]) {
    out += toHex(child);
  }
  return out;
}

/** Serialize a node (and its children) back to bytes. */
export function toBytes(node: Tlv): Uint8Array {
  return hexToBytes(toHex(node));
}

/**
 * Build a TLV from a tag and content parts; the length is computed.
 *   build([0xbf, 0x29], build(0x5a, iccid), build(0x90, nickname))
 */
export function build(tag: number | number[], ...parts: Uint8Array[]): Uint8Array {
  const content = parts.length === 1 ? parts[0] : concatBytes(...parts);
  const header = typeof tag === 'number' ? [tag] : tag.slice();
  const lengthBytes = hexToBytes(encodeLength(content.length));
  const out = new Uint8Array(header.length + lengthBytes.length + content.length);
  out.set(header, 0);
  out.set(lengthBytes, header.length);
  out.set(content, header.length + lengthBytes.length);
  return out;
}

/* -------------------------------------------------------------------------
 * Schema-driven mapping
 * ---------------------------------------------------------------------- */

export interface Field {
  key: string;
  /** primitive value (hex string) -> anything */
  format?: (hex: string) => any;
  /** whole node -> anything */
  formatNode?: (node: Tlv) => any;
  /** collect every occurrence into an array instead of keeping the first */
  repeated?: boolean;
}

/** Consumes positionally identical sibling tags in order (e.g. three '30's). */
export class Sequence {
  private index = 0;
  constructor(public readonly fields: Field[]) {}

  next(node: Tlv, target: any): void {
    if (this.index < this.fields.length) {
      if (assign(node, this.fields[this.index], target)) {
        this.index++;
      }
    }
  }

  reset(): void {
    this.index = 0;
  }
}

export type Schema = { [tag: string]: Field | Sequence };

function assign(node: Tlv, field: Field, target: any): boolean {
  let value: any;
  if (field.formatNode) {
    value = field.formatNode(node);
  } else if (isConstructed(node)) {
    // no node formatter for a constructed tag: fall through to recursion
    return false;
  } else if (field.format) {
    value = field.format(node.value as string);
  } else {
    value = node.value as string;
  }

  if (field.repeated) {
    if (!Array.isArray(target[field.key])) {
      target[field.key] = [];
    }
    target[field.key].push(value);
  } else if (target[field.key] === undefined) {
    target[field.key] = value;
  }
  return true;
}

/**
 * Map TLV nodes onto a plain object. Tags without a schema entry are
 * transparently flattened (their children are mapped into the same target),
 * which is how nested SEQUENCE wrappers are skipped.
 */
export function mapTlvs(nodes: Tlv[], schema: Schema, target: any = {}): any {
  for (const node of nodes) {
    mapTlv(node, schema, target);
  }
  return target;
}

export function mapTlv(node: Tlv, schema: Schema, target: any = {}): any {
  const field = schema[node.tag];
  if (field instanceof Sequence) {
    field.next(node, target);
    return target;
  }
  if (field) {
    if (assign(node, field, target)) {
      return target;
    }
  }
  if (isConstructed(node)) {
    return mapTlvs(node.value as Tlv[], schema, target);
  }
  return target;
}
