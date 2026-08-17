/**
 * Maps the LPA's fine-grained progress messages onto the three phases the
 * download screen shows.
 *
 * The LPA reports a dozen SGP.22 steps (`download.step6.es9p_get_bound_profile_
 * package` and friends). That granularity is right for a log and wrong for a
 * progress screen — nobody waiting on a download needs to distinguish
 * `es10b_authenticate_server` from `es9p_authenticate_client`. They collapse
 * into the three things that actually happen: talk to the server, fetch the
 * package, write it to the card.
 *
 * Kept free of React imports so it can be unit tested.
 */

export type PhaseState = 'done' | 'current' | 'pending';

export interface Phase {
  /** i18n key under the `main` namespace. */
  labelKey: string;
  state: PhaseState;
}

/** The phases, in order. Index is the phase number. */
export const PHASE_KEYS = [
  'main:download_phase_authenticating',
  'main:download_phase_downloading',
  'main:download_phase_installing',
] as const;

/**
 * Which phase a raw progress message belongs to.
 *
 * Steps 1-4 are the authenticate exchange, 5-6 fetch the bound profile
 * package, and 7 onwards write it to the eUICC. An unrecognised message keeps
 * the current phase rather than resetting to 0, so a new LPA step added
 * upstream degrades to "no movement" instead of jumping the UI backwards.
 */
export function phaseForMessage(message: string | undefined, fallback = 0): number {
  if (!message) {
    return fallback;
  }
  const step = /^download\.step(\d+)\./.exec(message);
  if (!step) {
    return fallback;
  }
  const n = Number(step[1]);
  if (n <= 4) {
    return 0;
  }
  if (n <= 6) {
    return 1;
  }
  return 2;
}

/** Builds the phase list for the given active phase. */
export function phasesFor(active: number): Phase[] {
  return PHASE_KEYS.map((labelKey, index) => ({
    labelKey,
    state: index < active ? 'done' : index === active ? 'current' : 'pending',
  }));
}

/**
 * Overall completion, 0-100.
 *
 * Each phase owns a third of the bar. Within the install phase the LPA reports
 * bytes written, so that third fills smoothly; the earlier phases have no
 * sub-progress and sit at their phase boundary. Returning the boundary rather
 * than interpolating avoids a bar that races ahead and then stalls.
 */
export function percentFor(active: number, progress?: number, total?: number): number {
  const base = (active / PHASE_KEYS.length) * 100;
  const span = 100 / PHASE_KEYS.length;
  if (total && total > 0 && progress !== undefined && progress >= 0) {
    const within = Math.min(1, progress / total);
    return Math.round(base + within * span);
  }
  return Math.round(base);
}
