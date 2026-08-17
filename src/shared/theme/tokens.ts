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

/**
 * Type scale.
 *
 * Sized for a phone held at arm's length, not for the prototype. The mock is
 * drawn in a desktop browser where 13px body copy is comfortable; transcribing
 * those numbers straight across produced a UI that reads small on device. Each
 * step is roughly two points up from the mock's equivalent.
 */
export const fontSize = {
  /** 12 — uppercase mono micro-labels ("EID", "APPEARANCE"), dense metadata. */
  xs: 12,
  /** 14 — captions, row values, tag chips. */
  sm: 14,
  /** 15 — secondary body: subtitles, helper text, section copy. */
  md: 15,
  /** 17 — row labels and buttons. The workhorse. */
  lg: 17,
  /** 18 — list-item titles, primary buttons. */
  xl: 18,
  /** 21 — sheet titles and the app name. */
  xxl: 21,
  /** 30 — screen titles. */
  display: 30,
  /** 46 — the download percentage, and nothing else. */
  hero: 46,
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

/**
 * Icon sizes.
 *
 * Sized for touch legibility rather than to match the mock's pixel values: the
 * prototype was drawn at desktop scale, where a 16px chevron reads fine, and
 * on a phone at arm's length it does not. Every glyph in a row or control uses
 * one of these.
 */
export const iconSize = {
  /** 22 — inline affordances: chevrons, header controls, tab glyphs. */
  sm: 22,
  /** 26 — row leading icons and sheet actions. */
  md: 26,
  /** 32 — list items that are the row's subject, e.g. a reader. */
  lg: 32,
} as const;

export type FontSize = (typeof fontSize)[keyof typeof fontSize];
export type Radius = (typeof radius)[keyof typeof radius];
