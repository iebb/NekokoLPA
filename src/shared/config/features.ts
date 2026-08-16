/**
 * Build-level feature flags.
 *
 * Simplified mode hides the advanced settings rows (unit, subtitle, AID,
 * protection, theme colour) and forces sensible defaults elsewhere.
 *
 * This used to read a sibling `features.json`. That file is gone: it declared
 * `simplifiedMode: true` while this function returned a hardcoded `false`, so
 * it had no effect, and — worse — its basename collided with this module.
 * Metro resolves `.json` before `.ts`, so `@/shared/config/features` loaded the
 * JSON and every `isSimplifiedMode` import came back undefined. Keep the flag
 * here, in code, where it cannot be shadowed.
 */
const SIMPLIFIED_MODE = false;

export const isSimplifiedMode = (): boolean => SIMPLIFIED_MODE;
