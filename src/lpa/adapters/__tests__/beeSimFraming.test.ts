/// <reference types="jest" />
import {CHUNK_SIZE, FrameAssembler, buildFrames, toChunks} from '../beeSimFraming';

const bytes = (n: number) => new Uint8Array(n).map((_, i) => i & 0xff);

describe('BeeSIM BLE framing', () => {
  it('keeps a short payload in one chunk', () => {
    expect(toChunks(bytes(5)).map(c => c.length)).toEqual([5]);
    expect(toChunks(bytes(CHUNK_SIZE)).map(c => c.length)).toEqual([CHUNK_SIZE]);
  });

  it('splits a long payload on the 18-byte boundary', () => {
    expect(toChunks(bytes(40)).map(c => c.length)).toEqual([18, 18, 4]);
    expect(toChunks(bytes(36)).map(c => c.length)).toEqual([18, 18]);
  });

  it('prefixes every frame with [total, 1-based index]', () => {
    const frames = buildFrames(bytes(40));
    expect(frames).toHaveLength(3);
    expect([frames[0][0], frames[0][1]]).toEqual([3, 1]);
    expect([frames[1][0], frames[1][1]]).toEqual([3, 2]);
    expect([frames[2][0], frames[2][1]]).toEqual([3, 3]);
    expect(frames.map(f => f.length)).toEqual([20, 20, 6]);
  });

  it('round-trips a payload through frame and reassemble', () => {
    for (const size of [1, 17, 18, 19, 40, 255, 300]) {
      const payload = bytes(size);
      const assembler = new FrameAssembler();
      let result: Uint8Array | null = null;
      for (const frame of buildFrames(payload)) {
        result = assembler.push(frame);
      }
      expect(result).toEqual(payload);
    }
  });

  it('returns nothing until the terminal frame arrives', () => {
    const assembler = new FrameAssembler();
    const frames = buildFrames(bytes(40));
    expect(assembler.push(frames[0])).toBeNull();
    expect(assembler.push(frames[1])).toBeNull();
    expect(assembler.push(frames[2])).toEqual(bytes(40));
  });

  it('starts a clean payload after one completes', () => {
    // one assembler serves the whole connection, so back-to-back responses
    // must not run into each other
    const assembler = new FrameAssembler();
    expect(assembler.push(Uint8Array.of(1, 1, 0x90, 0x00))).toEqual(Uint8Array.of(0x90, 0x00));
    expect(assembler.push(Uint8Array.of(1, 1, 0x6a, 0x82))).toEqual(Uint8Array.of(0x6a, 0x82));
  });

  it('discards a partial transfer when a new one starts', () => {
    // a command that timed out can leave frames behind; the next response
    // restarts at index 1 and owns the buffer from there
    const assembler = new FrameAssembler();
    expect(assembler.push(Uint8Array.of(3, 1, 0xde, 0xad))).toBeNull();
    expect(assembler.push(Uint8Array.of(1, 1, 0x90, 0x00))).toEqual(Uint8Array.of(0x90, 0x00));
  });

  it('drops a partial transfer on reset', () => {
    const assembler = new FrameAssembler();
    expect(assembler.push(Uint8Array.of(2, 1, 0xde, 0xad))).toBeNull();
    assembler.reset();
    expect(assembler.push(Uint8Array.of(2, 2, 0x90, 0x00))).toEqual(Uint8Array.of(0x90, 0x00));
  });

  it('reassembles a response whose frames the reader sized itself', () => {
    // the reader is free to use any chunk size; only the header matters
    const assembler = new FrameAssembler();
    expect(assembler.push(Uint8Array.of(2, 1, 0x90))).toBeNull();
    expect(assembler.push(Uint8Array.of(2, 2, 0x00))).toEqual(Uint8Array.of(0x90, 0x00));
  });
});
