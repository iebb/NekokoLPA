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

/**
 * Used when nothing is stored, and as the fallback everywhere else.
 *
 * The 2026 redesign pins the accent to azure blue. The other presets stay
 * available because the accent is a user preference, and every screen uses it
 * for state rather than decoration, so any hue holds up.
 */
export const DEFAULT_THEME_COLOR = '#0A84FF';

/**
 * The pre-redesign default.
 *
 * A stored preference always beats {@link DEFAULT_THEME_COLOR}, so without a
 * migration every existing install would keep the old purple and never see the
 * new accent. `migrateLegacyDefaultColor` clears it — but only when it matches
 * this value exactly, so anyone who actually chose purple keeps it.
 */
export const LEGACY_DEFAULT_THEME_COLOR = '#813FF3';

export const PRESET_COLORS: PresetColor[] = [
  {value: '#0A84FF', label: 'Azure'},
  {value: '#813FF3', label: 'Purple'},
  {value: '#6366F1', label: 'Indigo'},
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

/**
 * Drops a stored accent that is merely the old default, so the redesign's
 * accent applies. Runs once at startup; a deliberate choice is left alone.
 */
export function migrateLegacyDefaultColor(stored: string | undefined): string | undefined {
  if (stored && stored.toLowerCase() === LEGACY_DEFAULT_THEME_COLOR.toLowerCase()) {
    return undefined;
  }
  return stored;
}

/** True when `value` is one of the presets (case-insensitive). */
export function isPresetColor(value: string): boolean {
  return PRESET_COLORS.some(c => c.value.toLowerCase() === value.toLowerCase());
}
