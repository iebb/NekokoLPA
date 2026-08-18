/// <reference types="jest" />
import {
  CLA_PROPRIETARY,
  channelCla,
  channelClaHex,
  closeChannelApdu,
  isAddressableChannel,
  openedChannel,
} from '../channel';

describe('logical channel class bytes', () => {
  it('puts the basic channels in the low two bits', () => {
    expect([0, 1, 2, 3].map(c => channelCla(c))).toEqual([0x00, 0x01, 0x02, 0x03]);
    expect([0, 1, 2, 3].map(c => channelCla(c, CLA_PROPRIETARY))).toEqual([
      0x80, 0x81, 0x82, 0x83,
    ]);
  });

  it('switches to the extended encoding from channel 4', () => {
    // b7 set, and the low nibble counts from 4 rather than from 0 — the whole
    // point of the fix: channel 5 is 0x41, never 0x05
    expect(channelCla(4)).toBe(0x40);
    expect(channelCla(5)).toBe(0x41);
    expect(channelCla(19)).toBe(0x4f);
    expect(channelCla(4, CLA_PROPRIETARY)).toBe(0xc0);
    expect(channelCla(5, CLA_PROPRIETARY)).toBe(0xc1);
    expect(channelCla(19, CLA_PROPRIETARY)).toBe(0xcf);
  });

  it('formats the class byte as two hex digits', () => {
    expect(channelClaHex(1)).toBe('01');
    expect(channelClaHex(5)).toBe('41');
    expect(channelClaHex(5, CLA_PROPRIETARY)).toBe('C1');
  });

  it('knows which channels a class byte can address', () => {
    expect(isAddressableChannel(0)).toBe(true);
    expect(isAddressableChannel(19)).toBe(true);
    expect(isAddressableChannel(20)).toBe(false);
    expect(isAddressableChannel(-1)).toBe(false);
  });
});

describe('MANAGE CHANNEL responses', () => {
  it('reads the granted channel', () => {
    expect(openedChannel('019000')).toBe(1);
    expect(openedChannel('059000')).toBe(5);
    expect(openedChannel('139000')).toBe(19);
  });

  it('rejects anything that is not a granted channel', () => {
    expect(openedChannel('6a81')).toBeNull();
    expect(openedChannel('9000')).toBeNull();
    expect(openedChannel('')).toBeNull();
    // a response that drifted out of step is not a channel number
    expect(openedChannel('0190009000')).toBeNull();
    // channel 0 is the basic channel; it is never granted
    expect(openedChannel('009000')).toBeNull();
    // 20 and up cannot be addressed
    expect(openedChannel('149000')).toBeNull();
  });

  it('closes one specific channel', () => {
    expect(closeChannelApdu(1)).toBe('0070800100');
    expect(closeChannelApdu(5)).toBe('0070800500');
    expect(closeChannelApdu(19)).toBe('0070801300');
  });
});
