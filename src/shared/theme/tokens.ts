/**
 * Typography and radius scales.
 *
 * The UI previously used 12 distinct font sizes (10–28) and 10 distinct border
 * radii, chosen ad hoc per component, while the token block in
 * `tamagui.config.ts` went unused. These are plain constants rather than
 * Tamagui tokens deliberately: the codebase mixes Tamagui props
 * (`fontSize={…}`) with raw React Native styles (`style={{borderRadius: …}}`),
 * and plain numbers work in both.
 */

/** Type scale. Steps are ~1.15× apart, with a display size for screen titles. */
export const fontSize = {
  /** 11 — tag chips, dense metadata. */
  xs: 11,
  /** 12 — captions, secondary rows, subtitles. */
  sm: 12,
  /** 14 — body text. The most common size by a wide margin. */
  md: 14,
  /** 16 — emphasised body, list item titles, primary buttons. */
  lg: 16,
  /** 18 — section headings. */
  xl: 18,
  /** 20 — prominent inline messages and calls to action. */
  xxl: 20,
  /** 28 — screen titles. */
  display: 28,
} as const;

/**
 * Corner radii.
 *
 * `pill` is deliberately huge rather than a real measurement: it is used for
 * anything that should stay fully rounded regardless of its size — circular
 * icon buttons, day cells, progress bars, tag chips.
 */
export const radius = {
  /** 4 — small decorations, image corners. */
  xs: 4,
  /** 8 — buttons, inputs, compact controls. */
  sm: 8,
  /** 12 — cards and rows. */
  md: 12,
  /** 16 — sheets and large containers. */
  lg: 16,
  /** Fully rounded. */
  pill: 9999,
} as const;

export type FontSize = (typeof fontSize)[keyof typeof fontSize];
export type Radius = (typeof radius)[keyof typeof radius];
