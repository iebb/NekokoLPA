/// <reference types="jest" />
import {addHeaderToUint8Array} from '../estkMeFraming';

/** The 2-byte little-endian length header the ESTKme-RED expects. */
describe('ESTKme-RED length header', () => {
  const headerOf = (hex: string) => Array.from(addHeaderToUint8Array(hex).subarray(0, 2));

  it('encodes short payloads', () => {
    expect(headerOf('')).toEqual([0, 0]);
    expect(headerOf('00')).toEqual([1, 0]);
    expect(headerOf('00'.repeat(64))).toEqual([64, 0]);
  });

  it('encodes the boundary the modulo form got wrong', () => {
    // 255 % 255 === 0 would have encoded this as a zero-length write.
    expect(headerOf('00'.repeat(255))).toEqual([255, 0]);
    expect(headerOf('00'.repeat(256))).toEqual([0, 1]);
    expect(headerOf('00'.repeat(257))).toEqual([1, 1]);
  });

  it('encodes lengths a profile download actually produces', () => {
    expect(headerOf('00'.repeat(1024))).toEqual([0, 4]);
    expect(headerOf('00'.repeat(4095))).toEqual([255, 15]);
  });

  it('keeps the payload after the header', () => {
    const framed = addHeaderToUint8Array('a1b2c3');
    expect(Array.from(framed)).toEqual([3, 0, 0xa1, 0xb2, 0xc3]);
  });
});
