import {Device} from '@/lpa/adapters/Adapter';
import {
  APDU_OPEN_CHANNEL,
  APDU_TERMINAL_CAPABILITIES,
  APDU_CLOSE_CHANNEL,
  NO_AID_FOUND,
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
      const channelPrefix = channelResp.substring(0, 2);
      this.channel = channelPrefix.substring(1);

      if (channelResp.startsWith('6a')) {
        this.description = 'Channel cannot be opened';
        return false;
      }

      if (await selectSupportedAid(apdu => this.transmit(apdu), channelPrefix)) {
        this.available = true;
        return true;
      }
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
