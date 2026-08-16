/**
 * The accent colours a user can pick from in Settings.
 *
 * Replaces a free-form HSL picker. Twelve fixed hues keep the generated themes
 * predictable: generateThemes derives foregrounds, tints and button colours
 * from this value, and an arbitrary hex could land somewhere that produces poor
 * contrast in one scheme or the other. These are all mid-to-dark enough to
 * carry white foreground text.
 */
export interface PresetColor {
  /** Stored in preferences and fed to generateThemes. */
  value: string;
  /** Shown under the swatch. */
  label: string;
}

/** Sentinel meaning "follow the system Material You palette" (Android only). */
export const MATERIAL_YOU = 'my';

/** Used when nothing is stored, and as the fallback everywhere else. */
export const DEFAULT_THEME_COLOR = '#813FF3';

export const PRESET_COLORS: PresetColor[] = [
  {value: '#813FF3', label: 'Purple'},
  {value: '#6366F1', label: 'Indigo'},
  {value: '#2563EB', label: 'Blue'},
  {value: '#0EA5E9', label: 'Sky'},
  {value: '#06B6D4', label: 'Cyan'},
  {value: '#0D9488', label: 'Teal'},
  {value: '#16A34A', label: 'Green'},
  {value: '#65A30D', label: 'Lime'},
  {value: '#CA8A04', label: 'Amber'},
  {value: '#EA580C', label: 'Orange'},
  {value: '#DC2626', label: 'Red'},
  {value: '#DB2777', label: 'Pink'},
];

/** True when `value` is one of the presets (case-insensitive). */
export function isPresetColor(value: string): boolean {
  return PRESET_COLORS.some(c => c.value.toLowerCase() === value.toLowerCase());
}
