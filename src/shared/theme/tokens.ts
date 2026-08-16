/**
 * Typography and radius scales.
 *
 * Retuned for the 2026 redesign. The values come from the `lpa-redesign`
 * prototype, rationalised into a scale: the prototype uses half-point sizes
 * (10.5, 11.5, 12.5, 13.5) that read as a designer nudging within a step, so
 * each is snapped to its nearest whole rather than carried into code.
 *
 * These are plain constants rather than Tamagui tokens deliberately: the
 * codebase mixes Tamagui props (`fontSize={…}`) with raw React Native styles
 * (`style={{borderRadius: …}}`), and numbers work in both.
 *
 * Identifiers — EID, ICCID, MCC/MNC, byte counts, firmware versions — are set
 * in the monospace family (see `fontFamily.mono`), never the UI face. That is a
 * rule of the design, not a preference: it is what makes a 32-digit EID
 * checkable against a card.
 */

import {Platform} from 'react-native';

/**
 * Type families.
 *
 * There is no custom UI face: the design uses each platform's system sans, so
 * the app looks native rather than branded. `mono` is the one deliberate
 * choice — every identifier is set in it.
 */
export const fontFamily = {
  mono: Platform.select({ios: 'Menlo', android: 'monospace', default: 'monospace'}),
} as const;

/** Type scale. */
export const fontSize = {
  /** 11 — uppercase mono micro-labels ("EID", "APPEARANCE"), dense metadata. */
  xs: 11,
  /** 12 — captions, row values, tag chips. */
  sm: 12,
  /** 13 — secondary body: subtitles, helper text, section copy. */
  md: 13,
  /** 14 — row labels and buttons. The workhorse. */
  lg: 14,
  /** 15 — list-item titles, primary buttons. */
  xl: 15,
  /** 17 — sheet titles and the app name. */
  xxl: 17,
  /** 25 — screen titles. */
  display: 25,
  /** 42 — the download percentage, and nothing else. */
  hero: 42,
} as const;

/**
 * Corner radii.
 *
 * `pill` is deliberately huge rather than a real measurement: it is used for
 * anything that should stay fully rounded regardless of its size — the flag
 * tile's switch, status dots, progress bars.
 */
export const radius = {
  /** 6 — status pills, notification op badges. */
  xs: 6,
  /** 9 — tag chips, flag tiles, segmented-control thumbs. */
  sm: 9,
  /** 11 — buttons. */
  md: 11,
  /** 14 — cards and row groups. The dominant radius of the design. */
  lg: 14,
  /** 18 — bottom sheets. */
  xl: 18,
  /** Fully rounded. */
  pill: 9999,
} as const;

/**
 * Letter-spacing for the uppercase mono labels that head every section.
 * Without it they read as shouting; with it they read as a legend.
 */
export const tracking = {
  label: 0.9,
  title: -0.4,
} as const;

export type FontSize = (typeof fontSize)[keyof typeof fontSize];
export type Radius = (typeof radius)[keyof typeof radius];
