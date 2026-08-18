/**
 * ESTKme-RED v2 wire framing: CCID over BLE.
 *
 * The newer RED reader speaks CCID rather than the v1 reader's
 * `[command, lengthLo, lengthHi]` frames. Every message is a 10-byte CCID
 * header followed by its payload, and responses are assembled from
 * notifications until the declared length arrives.
 *
 * Kept free of react-native-ble-plx imports so it can be unit tested.
 */

/** CCID header length, in bytes. */
export const CCID_HEADER = 10;

/** PC_to_RDR_IccPowerOn — powers the card and returns its ATR. */
export const PC_TO_RDR_ICC_POWER_ON = 0x62;

/** PC_to_RDR_XfrBlock — carries an APDU, or a reader control frame. */
export const PC_TO_RDR_XFR_BLOCK = 0x6f;

/** Wraps a payload in a CCID header. Slot, sequence and status are all zero. */
export function packCcid(msgType: number, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(CCID_HEADER + data.length);
  out[0] = msgType;
  out[1] = data.length & 0xff;
  out[2] = (data.length >> 8) & 0xff;
  out[3] = (data.length >> 16) & 0xff;
  out[4] = (data.length >> 24) & 0xff;
  out.set(data, CCID_HEADER);
  return out;
}

/** Payload length declared by a CCID header (bytes 1-4, little-endian). */
export function ccidPayloadLength(bytes: Uint8Array): number {
  return (
    (bytes[1] | (bytes[2] << 8) | (bytes[3] << 16) | ((bytes[4] << 24) >>> 0)) >>> 0
  );
}

/**
 * True for a "time extension requested" frame.
 *
 * The reader sends these while a slow command is still running. They carry the
 * status bit and a zero length, and must be ignored rather than accumulated —
 * appending one corrupts the response being assembled.
 */
export function isTimeExtension(frame: Uint8Array): boolean {
  return (
    frame.length >= CCID_HEADER &&
    (frame[7] & 0x80) === 0x80 &&
    frame[1] === 0 &&
    frame[2] === 0 &&
    frame[3] === 0 &&
    frame[4] === 0
  );
}

/** Reassembles response notifications into one complete CCID message. */
export class CcidAssembler {
  private readonly received: number[] = [];
  private expected = -1;

  /** Adds one notification; returns the payload once the message is complete. */
  push(frame: Uint8Array): Uint8Array | null {
    if (isTimeExtension(frame)) {
      return null;
    }
    for (let i = 0; i < frame.length; i++) {
      this.received.push(frame[i]);
    }
    if (this.expected === -1 && this.received.length >= CCID_HEADER) {
      this.expected = CCID_HEADER + ccidPayloadLength(Uint8Array.from(this.received));
    }
    if (this.expected !== -1 && this.received.length >= this.expected) {
      return Uint8Array.from(this.received.slice(CCID_HEADER, this.expected));
    }
    return null;
  }
}
