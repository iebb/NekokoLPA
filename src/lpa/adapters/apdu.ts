import {getAIDList} from '@/shared/utils/aid';
import {channelClaHex, closeChannelApdu, openedChannel} from '@/lpa/core/channel';

/**
 * Shared APDU sequences and helpers used by every {@link Device}
 * implementation that talks to a card over a logical channel.
 */

/** Re-exported so an adapter has one import for everything channel-related. */
export {openedChannel};

/** TERMINAL CAPABILITIES — tells the card what the terminal supports. */
export const APDU_TERMINAL_CAPABILITIES = '80AA00000AA9088100820101830107';

/** MANAGE CHANNEL (open) — the response's first byte is the channel number. */
export const APDU_OPEN_CHANNEL = '0070000001';

/** MANAGE CHANNEL (close all). */
export const APDU_CLOSE_CHANNEL = '007080FF00';

/**
 * Gives back a channel that was opened but turned out to be unusable.
 *
 * A card has a small supply of them and hands out a higher number each time,
 * so a connection that opens one and walks away leaves the next attempt worse
 * off than it found it. Best-effort: the card may already be gone.
 */
export async function releaseChannel(
  transmit: (apdu: string) => Promise<string>,
  channel: number,
): Promise<void> {
  try {
    await transmit(closeChannelApdu(channel));
  } catch {
    // The card or the link is gone; the channel goes with it.
  }
}

/** SELECT by DF name, on the channel encoded in the caller's prefix. */
const SELECT_BY_NAME = 'A4040010';

/**
 * Java Card's SW_APPLET_SELECT_FAILED.
 *
 * The ISD-R is not multiselectable, so a card that still holds it open on
 * another logical channel refuses to select it again with this.
 */
const SW_APPLET_SELECT_FAILED = '6999';

/** Status words indicating success ('61xx' = more data available). */
function isSuccess(response: string): boolean {
  return response.startsWith('61') || response.startsWith('90');
}

interface SelectAttempt {
  /** The AID that selected, or null if none did. */
  aid: string | null;
  /** True when a card refused because the applet is open somewhere else. */
  appletHeldElsewhere: boolean;
}

/** One pass over the configured AIDs. */
async function trySelect(
  transmit: (apdu: string) => Promise<string>,
  prefix: string,
): Promise<SelectAttempt> {
  let appletHeldElsewhere = false;
  for (const aid of getAIDList().split(',')) {
    try {
      const response = await transmit(prefix + SELECT_BY_NAME + aid);
      if (isSuccess(response)) {
        return {aid, appletHeldElsewhere: false};
      }
      if (response.toUpperCase().startsWith(SW_APPLET_SELECT_FAILED)) {
        appletHeldElsewhere = true;
      }
    } catch {
      // This AID is not present on the card; try the next one.
    }
  }
  return {aid: null, appletHeldElsewhere};
}

/**
 * Closes every channel below `channel`.
 *
 * Only called to recover a card that has the ISD-R held open on a channel
 * nobody is using any more — the residue of sessions that ended without
 * closing theirs, which survives until the card is power-cycled. Closing a
 * channel that was never open is answered with an error and ignored.
 *
 * A channel another process is genuinely using would be closed too. That is
 * the trade being made deliberately: on a reader dedicated to eSIM management
 * the only plausible owner is an earlier run of this app, and the alternative
 * is a card that cannot be read at all until it is unplugged.
 */
async function releaseStaleChannels(
  transmit: (apdu: string) => Promise<string>,
  channel: number,
): Promise<void> {
  for (let stale = 1; stale < channel; stale++) {
    await releaseChannel(transmit, stale);
  }
}

/**
 * Tries each configured ISD-R AID in turn and returns the first that the card
 * SELECTs successfully.
 *
 * Cards differ in which AID exposes the eUICC, and a non-matching AID answers
 * with an error status word or throws, so per-AID failures are expected and
 * simply advance to the next candidate.
 *
 * When every AID reports the applet is held elsewhere, the leftover channels
 * are closed and the pass is repeated once — see {@link releaseStaleChannels}.
 *
 * @param transmit sends one APDU and resolves with the hex response.
 * @param channel the logical channel the card granted.
 * @returns the AID that selected successfully, or null if none did.
 */
export async function selectSupportedAid(
  transmit: (apdu: string) => Promise<string>,
  channel: number,
): Promise<string | null> {
  const prefix = channelClaHex(channel);

  const attempt = await trySelect(transmit, prefix);
  if (attempt.aid || !attempt.appletHeldElsewhere || channel <= 1) {
    return attempt.aid;
  }

  console.warn(`[LPA] ISD-R is held on another channel; closing 1-${channel - 1}`);
  await releaseStaleChannels(transmit, channel);
  return (await trySelect(transmit, prefix)).aid;
}

/** Message shown when no configured AID matched the card. */
export const NO_AID_FOUND = 'No supported AID found';
