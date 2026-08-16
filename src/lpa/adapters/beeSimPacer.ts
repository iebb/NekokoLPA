/**
 * BeeSIM command pacing.
 *
 * The reader stops answering partway through a long exchange unless the client
 * pauses periodically. Its reference client allows a burst of commands and then
 * waits, and NekokoLPA 2 mirrors the same window — without it a profile list or
 * a download (both of which issue far more than a burst's worth of APDUs) dies
 * mid-session with a timeout that looks like a flaky link.
 *
 * The counter is checked *before* it is incremented, so commands 1..21 go out
 * immediately and command 22 waits first.
 *
 * Kept free of react-native-ble-plx imports so it can be unit tested.
 */

/** Commands allowed before a cooldown is required. */
export const COMMANDS_PER_BURST = 21;

/** How long to pause once a burst is exhausted. */
export const COOLDOWN_MS = 1200;

export type Sleep = (ms: number) => Promise<void>;

const defaultSleep: Sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export class BeeSimCommandPacer {
  private commandsSinceCooldown = 0;

  constructor(private readonly sleep: Sleep = defaultSleep) {}

  /**
   * Waits when the previous burst exhausted its allowance.
   *
   * Resolves to true when a cooldown was actually applied, so the caller can
   * log the recovery window without putting logging in here.
   */
  async beforeCommand(): Promise<boolean> {
    if (this.commandsSinceCooldown >= COMMANDS_PER_BURST) {
      await this.sleep(COOLDOWN_MS);
      this.commandsSinceCooldown = 1;
      return true;
    }
    this.commandsSinceCooldown++;
    return false;
  }

  /** Called on connect/disconnect: a fresh link starts with a full allowance. */
  reset(): void {
    this.commandsSinceCooldown = 0;
  }
}
