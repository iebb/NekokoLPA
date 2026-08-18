/**
 * Turns the LPA's SGP.22 step messages into a progress percentage.
 *
 * The LPA reports a dozen steps, which is right for a log and wrong for a
 * progress screen. They collapse into three phases for display, but the
 * percentage is computed from the steps themselves, because the work is not
 * evenly distributed: authenticating is a handful of round trips, while
 * writing the bound profile package is the long part and the only step that
 * reports bytes.
 *
 * Weights follow that shape — everything before the download is the first
 * tenth, and loading the package owns the rest up to 90%.
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
 * Where each step starts, as a percentage.
 *
 * A step holds its own start until the next one arrives; a step that reports
 * bytes interpolates towards the following step's start. The keys are the
 * suffix after `download.stepN.`, which is what the LPA emits.
 */
const STEP_START: Record<string, number> = {
  es10b_get_euicc_challenge_and_info: 0,
  es9p_initiate_authentication: 2,
  es10b_authenticate_server: 4,
  es9p_authenticate_client: 6,
  es11_authenticate_client: 6,
  es10b_prepare_download: 10,
  es9p_get_bound_profile_package: 12,
  es10b_load_bound_profile_package: 15,
  load_bpp: 15,
  finalize: 90,
  finished: 100,
};

/** Steps whose byte counts should drive the bar between here and the next. */
const STEP_END: Record<string, number> = {
  es10b_load_bound_profile_package: 90,
  load_bpp: 90,
};

/** The `stepN.name` part of a raw progress message. */
function stepNameOf(message: string | undefined): {index: number; name: string} | null {
  const match = /^download\.step(\d+)\.(.+?)(?:_tx_\d+)?$/.exec(message ?? '');
  return match ? {index: Number(match[1]), name: match[2]} : null;
}

/**
 * Which phase a raw progress message belongs to.
 *
 * Steps 1-4 are the authenticate exchange, 5-6 fetch the bound profile
 * package, and 7 onwards write it to the eUICC. An unrecognised message keeps
 * the current phase rather than resetting to 0, so a new LPA step added
 * upstream degrades to "no movement" instead of jumping the UI backwards.
 */
export function phaseForMessage(message: string | undefined, fallback = 0): number {
  const step = stepNameOf(message);
  if (!step) {
    return fallback;
  }
  if (step.index <= 4) {
    return 0;
  }
  if (step.index <= 6) {
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
 * Completion for a raw progress payload, 0-100.
 *
 * `floor` is the highest value reported so far. Progress must never go
 * backwards: the byte-reporting step interpolates towards 90%, and the step
 * that follows it starts lower than where the interpolation ended, so without
 * a floor the bar visibly jumps back when the package finishes loading.
 */
export function percentForStep(
  message: string | undefined,
  progress?: number,
  total?: number,
  floor = 0,
): number {
  const step = stepNameOf(message);
  if (!step) {
    return floor;
  }

  const start = STEP_START[step.name];
  if (start === undefined) {
    return floor;
  }

  let value = start;
  const end = STEP_END[step.name];
  if (end !== undefined && total && total > 0 && progress !== undefined && progress >= 0) {
    const within = Math.min(1, Math.max(0, progress / total));
    value = start + (end - start) * within;
  }

  return Math.max(floor, Math.min(100, Math.round(value)));
}

/** True when the step reports byte counts worth showing under the bar. */
export function reportsBytes(message: string | undefined): boolean {
  const step = stepNameOf(message);
  return !!step && STEP_END[step.name] !== undefined;
}
