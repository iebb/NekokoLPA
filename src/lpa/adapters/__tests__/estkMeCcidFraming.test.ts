/// <reference types="jest" />
import {
  CcidAssembler,
  CCID_HEADER,
  ccidPayloadLength,
  isTimeExtension,
  packCcid,
  PC_TO_RDR_XFR_BLOCK,
} from '../estkMeCcidFraming';

const header = (len: number, status = 0) => {
  const h = new Uint8Array(CCID_HEADER);
  h[0] = 0x80;
  h[1] = len & 0xff;
  h[2] = (len >> 8) & 0xff;
  h[3] = (len >> 16) & 0xff;
  h[4] = (len >> 24) & 0xff;
  h[7] = status;
  return h;
};

describe('packCcid', () => {
  it('writes the 10-byte header with a little-endian length', () => {
    const packed = packCcid(PC_TO_RDR_XFR_BLOCK, Uint8Array.of(0xa0, 0xb0));
    expect(packed).toHaveLength(CCID_HEADER + 2);
    expect(Array.from(packed.subarray(0, 5))).toEqual([0x6f, 2, 0, 0, 0]);
    expect(Array.from(packed.subarray(CCID_HEADER))).toEqual([0xa0, 0xb0]);
  });

  it('encodes a length past one byte', () => {
    const packed = packCcid(PC_TO_RDR_XFR_BLOCK, new Uint8Array(300));
    expect(Array.from(packed.subarray(1, 5))).toEqual([44, 1, 0, 0]);
    expect(ccidPayloadLength(packed)).toBe(300);
  });
});

describe('isTimeExtension', () => {
  it('recognises the reader asking for more time', () => {
    expect(isTimeExtension(header(0, 0x80))).toBe(true);
  });

  it('does not mistake a real empty response for one', () => {
    expect(isTimeExtension(header(0, 0))).toBe(false);
  });

  it('does not mistake a response carrying data for one', () => {
    expect(isTimeExtension(header(4, 0x80))).toBe(false);
  });
});

describe('CcidAssembler', () => {
  it('returns the payload once the declared length arrives', () => {
    const a = new CcidAssembler();
    const frame = new Uint8Array([...header(3), 1, 2, 3]);
    expect(Array.from(a.push(frame)!)).toEqual([1, 2, 3]);
  });

  it('joins a response split across notifications', () => {
    const a = new CcidAssembler();
    const whole = new Uint8Array([...header(4), 9, 8, 7, 6]);
    expect(a.push(whole.subarray(0, 6))).toBeNull();
    expect(a.push(whole.subarray(6, 12))).toBeNull();
    expect(Array.from(a.push(whole.subarray(12))!)).toEqual([9, 8, 7, 6]);
  });

  it('drops time-extension frames instead of accumulating them', () => {
    // Appending one would shift every later byte and corrupt the payload.
    const a = new CcidAssembler();
    expect(a.push(header(0, 0x80))).toBeNull();
    const frame = new Uint8Array([...header(2), 0xaa, 0xbb]);
    expect(Array.from(a.push(frame)!)).toEqual([0xaa, 0xbb]);
  });
});

describe('reader-name dispatch', () => {
  // Mirrors BLE_ADAPTERS in deviceManager. The two RED generations differ only
  // by a space, and sending one generation's frames to the other gets no
  // usable answer, so this is the whole basis of the choice.
  const isRed2 = (n: string) => /estkme\s+red/i.test(n);
  const isRed1 = (n: string) => !isRed2(n) && /estkme[-_]?red/i.test(n);

  it('routes the spaced name to the CCID generation', () => {
    for (const name of ['ESTKme RED', 'estkme red', 'ESTKme  RED v2']) {
      expect(isRed2(name)).toBe(true);
      expect(isRed1(name)).toBe(false);
    }
  });

  it('routes the hyphenated and underscored names to the first generation', () => {
    for (const name of ['ESTKme-RED', 'estkme_red', 'ESTKmeRED']) {
      expect(isRed1(name)).toBe(true);
      expect(isRed2(name)).toBe(false);
    }
  });

  it('ignores unrelated readers', () => {
    for (const name of ['BeeSIM-1234', 'eSIM_Writer', 'Generic EMV']) {
      expect(isRed1(name)).toBe(false);
      expect(isRed2(name)).toBe(false);
    }
  });
});
