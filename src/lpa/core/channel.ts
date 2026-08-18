/**
 * ISO 7816-4 logical channel addressing.
 *
 * A command says which logical channel it runs on through its class byte, and
 * the encoding is not simply the channel number:
 *
 *   - channels 0-3 sit in the low two bits (`CLA | channel`);
 *   - channels 4-19 set bit b7 and hold `channel - 4` in the low four bits.
 *
 * Assuming the first form for every channel works right up until a card hands
 * out channel 4 or higher, which it does once the low ones are taken — every
 * connection that opens a channel and never closes it uses one up, so a reader
 * that has failed to come up a few times is exactly where this starts. The
 * malformed class byte is answered `6D00`, so a SELECT of a perfectly present
 * ISD-R fails and the card presents as one with no supported AID on it.
 *
 * Kept free of React and adapter imports so it can be unit tested.
 */

/** Class byte bit marking a command as proprietary — SGP.22's ES10x. */
export const CLA_PROPRIETARY = 0x80;

/** The highest channel a class byte can address. */
export const MAX_LOGICAL_CHANNEL = 19;

/** Above this channel the class byte moves to the extended encoding. */
const LAST_BASIC_CHANNEL = 3;

/** Bit b7, which marks that extended encoding. */
const EXTENDED_CHANNEL_BIT = 0x40;

/**
 * The class byte addressing `channel`.
 *
 * @param base `0x00` for interindustry commands, {@link CLA_PROPRIETARY} for
 *   ES10x ones.
 */
export function channelCla(channel: number, base = 0x00): number {
  return channel <= LAST_BASIC_CHANNEL
    ? base | channel
    : base | EXTENDED_CHANNEL_BIT | (channel - LAST_BASIC_CHANNEL - 1);
}

/** {@link channelCla} as the two hex digits an APDU string starts with. */
export function channelClaHex(channel: number, base = 0x00): string {
  return channelCla(channel, base).toString(16).toUpperCase().padStart(2, '0');
}

/** True when the card can address this channel at all. */
export function isAddressableChannel(channel: number): boolean {
  return Number.isInteger(channel) && channel >= 0 && channel <= MAX_LOGICAL_CHANNEL;
}

/**
 * The logical channel a MANAGE CHANNEL (open) response granted.
 *
 * The answer is the channel number followed by 9000, and nothing else is
 * usable: that number becomes the class byte of every later command. Anything
 * else gives null — a card that refused, or a reader whose responses have
 * drifted out of step with the commands they answer.
 */
export function openedChannel(response: string): number | null {
  if (!/^[0-9a-f]{2}9000$/i.test(response)) {
    return null;
  }
  const channel = parseInt(response.substring(0, 2), 16);
  return isAddressableChannel(channel) && channel > 0 ? channel : null;
}

/** MANAGE CHANNEL (close), for one specific channel. */
export function closeChannelApdu(channel: number): string {
  return '007080' + channel.toString(16).toUpperCase().padStart(2, '0') + '00';
}
