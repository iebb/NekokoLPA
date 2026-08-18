/**
 * A trace that only exists in debug builds.
 *
 * Two things this is not: it is not `console.warn`, because a warning shows a
 * yellow badge over the app and belongs to conditions someone should act on —
 * an expected recovery or a protocol trace is neither, and using warn for them
 * trains people to ignore the badge. And it is not a bare `console.log`, which
 * would ship the trace, and with it whatever card data it names, to release
 * builds.
 *
 * Guarded with `typeof` so the helper is safe to import from code that also
 * runs under Jest, where `__DEV__` is not defined.
 */
export function devLog(...args: unknown[]): void {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}
