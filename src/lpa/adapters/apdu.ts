import {getAIDList} from '@/shared/utils/aid';

/**
 * Shared APDU sequences and helpers used by every {@link Device}
 * implementation that talks to a card over a logical channel.
 */

/** TERMINAL CAPABILITIES — tells the card what the terminal supports. */
export const APDU_TERMINAL_CAPABILITIES = '80AA00000AA9088100820101830107';

/** MANAGE CHANNEL (open) — the response's first byte is the channel number. */
export const APDU_OPEN_CHANNEL = '0070000001';

/** MANAGE CHANNEL (close all). */
export const APDU_CLOSE_CHANNEL = '007080FF00';

/** SELECT by DF name, on the channel encoded in the caller's prefix. */
const SELECT_BY_NAME = 'A4040010';

/** Status words indicating success ('61xx' = more data available). */
function isSuccess(response: string): boolean {
  return response.startsWith('61') || response.startsWith('90');
}

/**
 * Tries each configured ISD-R AID in turn and returns the first that the card
 * SELECTs successfully.
 *
 * Cards differ in which AID exposes the eUICC, and a non-matching AID answers
 * with an error status word or throws, so per-AID failures are expected and
 * simply advance to the next candidate.
 *
 * @param transmit sends one APDU and resolves with the hex response.
 * @param channelPrefix the 2-hex-digit class byte identifying the channel.
 * @returns the AID that selected successfully, or null if none did.
 */
export async function selectSupportedAid(
  transmit: (apdu: string) => Promise<string>,
  channelPrefix: string,
): Promise<string | null> {
  for (const aid of getAIDList().split(',')) {
    try {
      const response = await transmit(channelPrefix + SELECT_BY_NAME + aid);
      if (isSuccess(response)) {
        return aid;
      }
    } catch {
      // This AID is not present on the card; try the next one.
    }
  }
  return null;
}

/** Message shown when no configured AID matched the card. */
export const NO_AID_FOUND = 'No supported AID found';
