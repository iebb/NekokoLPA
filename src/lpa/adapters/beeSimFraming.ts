/**
 * BeeSIM BLE framing.
 *
 * Symmetric in both directions: a payload is split into 18-byte chunks, and
 * every frame is prefixed with `[totalChunks, chunkIndex]` where the index is
 * 1-based. A transfer is complete once a frame arrives whose index equals its
 * total.
 *
 *     40-byte APDU -> [3,1] + 18 bytes
 *                     [3,2] + 18 bytes
 *                     [3,3] +  4 bytes
 *
 * Kept free of react-native-ble-plx imports so it can be unit tested.
 */

/** Payload bytes per frame, excluding the 2-byte header. */
export const CHUNK_SIZE = 18;

/** Splits a payload into the chunks that fit one frame each. */
export function toChunks(bytes: Uint8Array): Uint8Array[] {
  if (bytes.length <= CHUNK_SIZE) {
    return [bytes];
  }
  const chunks: Uint8Array[] = [];
  for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
    chunks.push(bytes.subarray(offset, Math.min(offset + CHUNK_SIZE, bytes.length)));
  }
  return chunks;
}

/** Builds the complete frames — header included — for one payload. */
export function buildFrames(payload: Uint8Array): Uint8Array[] {
  const chunks = toChunks(payload);
  return chunks.map((chunk, index) => {
    const frame = new Uint8Array(chunk.length + 2);
    frame[0] = chunks.length;
    frame[1] = index + 1;
    frame.set(chunk, 2);
    return frame;
  });
}

/**
 * Reassembles inbound frames.
 *
 * One assembler serves a whole connection, so it has to recover from a partial
 * transfer rather than assume every push belongs to the same response: a frame
 * numbered 1 starts a fresh payload and discards whatever the previous one
 * left behind. The reader restates neither the payload length nor an abort, so
 * the terminal frame (`index === total`) is the only completion signal.
 */
export class FrameAssembler {
  private readonly received: number[] = [];

  /** Adds one frame; returns the payload once the transfer is complete. */
  push(frame: Uint8Array): Uint8Array | null {
    if (frame.length < 2) {
      return null;
    }
    const total = frame[0];
    const index = frame[1];
    if (index === 1) {
      this.received.length = 0;
    }
    for (let i = 2; i < frame.length; i++) {
      this.received.push(frame[i]);
    }
    if (index !== total) {
      return null;
    }
    const payload = new Uint8Array(this.received);
    this.received.length = 0;
    return payload;
  }

  /** Drops a partial transfer, so the next frame starts a clean payload. */
  reset(): void {
    this.received.length = 0;
  }
}
