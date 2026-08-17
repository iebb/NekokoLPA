/**
 * Redaction of the identifiers on screen.
 *
 * Users show this app to support staff and photograph it for forum posts, and
 * an EID or ICCID is enough to identify a card. `redactMode` is the setting
 * that controls it; every screen reads it through here rather than
 * reimplementing the masking, which is how the eUICC card ended up never
 * redacting at all.
 *
 * Masking keeps the digit positions rather than collapsing to an ellipsis: the
 * leading digits identify the issuer and the trailing few are what someone
 * reads out to check they are looking at the right card, so both stay useful
 * while the identifying middle does not.
 *
 * Kept free of React imports so it can be unit tested.
 */

export type RedactMode = 'none' | 'medium' | 'hard';

/** Bullet used for masked digits. Same width as a digit in the mono face. */
const DOT = '•';

export function isRedactMode(value: string | undefined): value is RedactMode {
  return value === 'none' || value === 'medium' || value === 'hard';
}

/**
 * Masks an ICCID.
 *
 * `medium` keeps the issuer prefix and the last three digits — enough to tell
 * two profiles apart without publishing the number. `hard` masks everything
 * but the prefix.
 */
export function maskIccid(iccid: string | undefined, mode: RedactMode): string {
  const value = String(iccid ?? '');
  if (mode === 'none' || value.length < 10) {
    return value;
  }
  const keepTail = mode === 'medium' ? 3 : 0;
  const head = value.slice(0, 4);
  const tail = keepTail ? value.slice(-keepTail) : '';
  return head + DOT.repeat(value.length - head.length - tail.length) + tail;
}

/**
 * Masks an EID.
 *
 * `medium` keeps the first and last eight, which is the form the app already
 * used in its shortened display, so a user who knows their card still
 * recognises it. `hard` masks the lot.
 */
export function maskEid(eid: string | undefined, mode: RedactMode): string {
  const value = String(eid ?? '');
  if (mode === 'none' || value.length < 20) {
    return value;
  }
  if (mode === 'hard') {
    return DOT.repeat(value.length);
  }
  return value.slice(0, 8) + DOT.repeat(value.length - 16) + value.slice(-8);
}

/** Groups a long identifier into fours so it can be read off a card. */
export function group(value: string, size = 4): string {
  return value.replace(new RegExp(`(.{${size}})`, 'g'), '$1 ').trim();
}
