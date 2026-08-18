import {Device} from '@/lpa/adapters/Adapter';
import {
  APDU_OPEN_CHANNEL,
  APDU_TERMINAL_CAPABILITIES,
  APDU_CLOSE_CHANNEL,
  NO_AID_FOUND,
  openedChannel,
  releaseChannel,
  selectSupportedAid,
} from '@/lpa/adapters/apdu';
import {CCIDPlugin} from '@/lpa/bridge/nativeModules';

export class CcidDevice implements Device {
  type = 'ccid';
  displayName = '';
  deviceName = '';
  deviceId = '';
  channel = '1';
  available = false;
  description = '';
  explicitConnectionRequired = false;

  constructor(deviceName: string, altName: string) {
    this.deviceName = deviceName;
    this.displayName = altName;
    this.deviceId = 'ccid:' + deviceName;
  }

  async reconnect(): Promise<boolean> {
    await this.disconnect();
    return await this.connect();
  }

  async refresh(): Promise<boolean> {
    return this.available;
  }

  async connect(): Promise<boolean> {
    try {
      await CCIDPlugin.connect(this.deviceName);
      await this.transmit(APDU_TERMINAL_CAPABILITIES);

      const channelResp = await this.transmit(APDU_OPEN_CHANNEL);
      const channel = openedChannel(channelResp);
      if (channel === null) {
        this.description = channelResp.startsWith('6a')
          ? 'Channel cannot be opened'
          : `Failed to open channel (${channelResp})`;
        return false;
      }
      this.channel = channel.toString(16);

      if (await selectSupportedAid(apdu => this.transmit(apdu), channel)) {
        this.available = true;
        return true;
      }
      await releaseChannel(apdu => this.transmit(apdu), channel);
      this.description = NO_AID_FOUND;
      return false;
    } catch (error: any) {
      console.error('[CCID] connect failed', error);
      this.description = error?.message;
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      await this.transmit(APDU_CLOSE_CHANNEL);
    } catch (error) {}
    await CCIDPlugin.disconnect(this.deviceName);
    return true;
  }

  async transmit(s: string): Promise<string> {
    return await CCIDPlugin.transceive(this.deviceName, s);
  }
}
