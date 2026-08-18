/**
 * The icon a profile carries on the card (SGP.22 tags 93/94).
 *
 * Many profiles ship a placeholder rather than a logo — a solid white or black
 * square — and rendering those puts a blank tile next to every profile, which
 * is worse than showing nothing.
 *
 * There is no pixel access in React Native without pulling in an image
 * library, so the test is on the encoded size instead: a solid-colour image
 * compresses to almost nothing, while any real logo does not. The threshold is
 * generous in the safe direction — it rejects only what could not possibly
 * carry a mark, so a real logo is never dropped, at the cost of letting
 * through a placeholder that happens to be stored uncompressed.
 *
 * Kept free of React imports so it can be unit tested.
 */

/**
 * Below this many decoded bytes an image cannot hold a recognisable mark.
 *
 * For reference: a 32x32 single-colour PNG encodes to roughly 70-120 bytes,
 * while the smallest real operator logos observed are several kilobytes.
 */
const MIN_MEANINGFUL_BYTES = 512;

/** Decoded byte length of a base64 payload, without decoding it. */
export function base64ByteLength(base64: string): number {
  const clean = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  if (!clean) {
    return 0;
  }
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0;
  return Math.max(0, (clean.length * 3) / 4 - padding);
}

/**
 * The `data:` URI for a profile's icon, or undefined when there is nothing
 * worth showing.
 */
export function profileIconUri(
  icon: string | undefined,
  iconType: string | undefined,
): string | undefined {
  if (!icon) {
    return undefined;
  }
  if (base64ByteLength(icon) < MIN_MEANINGFUL_BYTES) {
    return undefined;
  }
  const mime = iconType === 'jpg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${icon}`;
}
