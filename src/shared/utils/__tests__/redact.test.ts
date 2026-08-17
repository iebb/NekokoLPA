/// <reference types="jest" />
import {group, isRedactMode, maskEid, maskIccid, maskText} from '../redact';

const ICCID = '8944538523410512345';
const EID = '89044045216727494800000000169891';

describe('maskIccid', () => {
  it('returns the number untouched when redaction is off', () => {
    expect(maskIccid(ICCID, 'none')).toBe(ICCID);
  });

  it('keeps the issuer prefix and a tail so profiles stay distinguishable', () => {
    const masked = maskIccid(ICCID, 'medium');
    expect(masked).toHaveLength(ICCID.length);
    expect(masked.startsWith('8944')).toBe(true);
    expect(masked.endsWith('345')).toBe(true);
    expect(masked).not.toContain('5385');
  });

  it('drops the tail on hard', () => {
    const masked = maskIccid(ICCID, 'hard');
    expect(masked).toHaveLength(ICCID.length);
    expect(masked.startsWith('8944')).toBe(true);
    expect(masked.endsWith('345')).toBe(false);
  });

  it('leaves values too short to be an ICCID alone', () => {
    expect(maskIccid('123', 'hard')).toBe('123');
    expect(maskIccid(undefined, 'hard')).toBe('');
  });
});

describe('maskEid', () => {
  it('keeps the ends on medium so a user still recognises their card', () => {
    const masked = maskEid(EID, 'medium');
    expect(masked).toHaveLength(EID.length);
    expect(masked.startsWith('89044045')).toBe(true);
    expect(masked.endsWith('00169891')).toBe(true);
  });

  it('masks everything on hard', () => {
    expect(maskEid(EID, 'hard')).toBe('•'.repeat(EID.length));
  });

  it('preserves length so grouping stays aligned', () => {
    expect(group(maskEid(EID, 'medium')).split(' ')).toHaveLength(8);
  });
});

describe('block mode', () => {
  it('replaces every character, leaving nothing readable', () => {
    expect(maskIccid(ICCID, 'block')).toBe('█'.repeat(ICCID.length));
    expect(maskEid(EID, 'block')).toBe('█'.repeat(EID.length));
    expect(maskText('AI Mobile', 'block')).toBe('█'.repeat(9));
  });

  it('masks short values that the other modes leave alone', () => {
    // `hard` returns '123' untouched — too short to be an ICCID. `block` is
    // the level that promises nothing readable, so it masks regardless.
    expect(maskIccid('123', 'block')).toBe('███');
  });

  it('leaves text alone below block', () => {
    expect(maskText('AI Mobile', 'hard')).toBe('AI Mobile');
    expect(maskText(undefined, 'block')).toBe('');
  });
});

describe('isRedactMode', () => {
  it('accepts the three modes and nothing else', () => {
    expect(isRedactMode('none')).toBe(true);
    expect(isRedactMode('medium')).toBe(true);
    expect(isRedactMode('hard')).toBe(true);
    expect(isRedactMode('block')).toBe(true);
    expect(isRedactMode('off')).toBe(false);
    expect(isRedactMode(undefined)).toBe(false);
  });
});
