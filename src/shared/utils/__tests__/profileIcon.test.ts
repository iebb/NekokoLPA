/// <reference types="jest" />
import {base64ByteLength, profileIconUri} from '../profileIcon';

/** base64 of `size` zero bytes. */
const payload = (size: number) => Buffer.alloc(size).toString('base64');

describe('base64ByteLength', () => {
  it('counts decoded bytes without decoding, padding included', () => {
    expect(base64ByteLength(payload(0))).toBe(0);
    expect(base64ByteLength(payload(1))).toBe(1);
    expect(base64ByteLength(payload(2))).toBe(2);
    expect(base64ByteLength(payload(3))).toBe(3);
    expect(base64ByteLength(payload(1000))).toBe(1000);
  });

  it('ignores whitespace and stray characters', () => {
    const wrapped = payload(300).replace(/(.{20})/g, '$1\n');
    expect(base64ByteLength(wrapped)).toBe(300);
  });
});

describe('profileIconUri', () => {
  it('builds a data URI for an icon large enough to carry a mark', () => {
    const uri = profileIconUri(payload(4096), 'png');
    expect(uri?.startsWith('data:image/png;base64,')).toBe(true);
  });

  it('uses the jpeg mime type when the card says jpg', () => {
    expect(profileIconUri(payload(4096), 'jpg')?.startsWith('data:image/jpeg;')).toBe(true);
  });

  it('skips a payload too small to be anything but a blank placeholder', () => {
    // A solid-colour PNG encodes to ~100 bytes; a real logo is kilobytes.
    expect(profileIconUri(payload(100), 'png')).toBeUndefined();
    expect(profileIconUri(payload(511), 'png')).toBeUndefined();
  });

  it('skips a missing icon', () => {
    expect(profileIconUri(undefined, 'png')).toBeUndefined();
    expect(profileIconUri('', 'png')).toBeUndefined();
  });
});
