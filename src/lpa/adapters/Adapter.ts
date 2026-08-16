import {Dispatch} from '@reduxjs/toolkit';

import {Adapters} from '@/lpa/adapters/registry';
import {setupDevice} from '@/lpa/bridge/runtime';
import {setDeviceState} from '@/store/slices';
import type {DeviceState} from '@/store/slices';
import type {EuiccInfoResult, Notification, ProgressUpdate} from '@/lpa/types/euicc';
import type {ProfileMetadataMap} from '@/lpa/types/profile';

/** Arguments accepted by the wasm LPA runtime. */
export type LpaArg = string | number;

/**
 * How long to let a card settle after a state-changing operation before we read
 * profiles back. Disabling needs the longest pause because the modem drops and
 * re-attaches. Device types absent here (ccid, ble_9el) settle immediately,
 * matching the original behaviour.
 */
const SETTLE_MS: Record<string, {disable: number; standard: number}> = {
  omapi: {disable: 1000, standard: 500},
  ble: {disable: 300, standard: 200},
};

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * A physical or virtual eUICC carrier: an on-device eSIM (OMAPI), a USB CCID
 * reader, or a Bluetooth writer. Implementations only need to move APDUs.
 */
export interface Device {
  available: boolean;
  slotAvailable?: boolean;
  description?: string;
  signatures?: string;
  channel: string;
  type: string;
  deviceName: string;
  displayName: string;
  deviceId: string;
  explicitConnectionRequired: boolean;
  connect: () => Promise<boolean>;
  accessRule?: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  refresh: () => Promise<boolean>;
  reconnect: () => Promise<boolean>;
  transmit: (apdu: string) => Promise<string>;
}

/**
 * Drives one {@link Device} through the LPA (Local Profile Assistant) protocol
 * and mirrors the results into Redux so screens can render them.
 *
 * Instances are interned in {@link Adapters} by device id — constructing an
 * Adapter for a device that already has one returns the existing instance.
 */
export class Adapter {
  obsolete = false;
  connected = false;
  eid = '';
  deviceId = '';
  device: Device;
  profiles: ProfileMetadataMap[] = [];
  smdp = '';
  notifications: Notification[] = [];
  dispatch: Dispatch;
  /** Guards the stateful APDU channel against concurrent commands. */
  isLocked = false;

  setState = (state: DeviceState) => {
    this.dispatch(setDeviceState([state, this.deviceId]));
  };

  /** Progress sink, replaced per-operation by download/authenticate calls. */
  callback: (update: ProgressUpdate) => void = () => {};

  constructor(device: Device, dispatcher: Dispatch) {
    this.obsolete = false;
    this.device = device;
    this.dispatch = dispatcher;
    this.deviceId = device.deviceId;

    const existing = Adapters[device.deviceId];
    if (existing) {
      existing.obsolete = false;
      return existing;
    }
    Adapters[device.deviceId] = this;
  }

  private settle(kind: 'disable' | 'standard'): Promise<void> {
    const ms = SETTLE_MS[this.device.type]?.[kind] ?? 0;
    return ms > 0 ? delay(ms) : Promise.resolve();
  }

  async reconnect(): Promise<boolean> {
    await this.disconnect();
    return this.connect();
  }

  async connect(): Promise<boolean> {
    try {
      if (!this.connected && (await this.device.connect())) {
        this.connected = true;
        return true;
      }
    } catch {
      // fall through to the failure path below
    }
    this.connected = false;
    return false;
  }

  async disconnect(): Promise<boolean> {
    try {
      if (this.connected) {
        await this.device.disconnect();
      }
      this.connected = false;
      return true;
    } catch {
      return false;
    }
  }

  async initialize(): Promise<void> {
    if (await this.connect()) {
      await this.getEuiccInfo();
      await this.getProfiles();
    }
  }

  async refresh(): Promise<void> {
    try {
      await this.getEuiccInfo();
      await this.getProfiles();
    } catch {
      await this.initialize();
    }
  }

  async _execute(command: string, args: LpaArg[]): Promise<any> {
    return (await setupDevice(this))(command, args);
  }

  /**
   * Runs a single LPA command against the device.
   *
   * Only one command may be in flight at a time: the underlying APDU channel is
   * stateful, so interleaving two commands corrupts both. If the first attempt
   * fails we re-initialise the wasm runtime once and retry, which recovers from
   * a dropped BLE/CCID link.
   */
  async execute(command: string, args: LpaArg[]): Promise<any> {
    if (this.isLocked) {
      throw new Error(`Device ${this.deviceId} is busy; cannot run "${command}" concurrently`);
    }
    this.isLocked = true;
    try {
      try {
        return await this._execute(command, args);
      } catch {
        // Retry once against a freshly set up runtime.
        return await (
          await setupDevice(this)
        )(command, args);
      }
    } finally {
      // Must run even when the retry throws, otherwise the device stays
      // locked for the rest of the session.
      this.isLocked = false;
    }
  }

  async getEid(): Promise<string> {
    const result = await this.execute('get_eid', []);
    this.connected = true;
    this.eid = result.eid;
    return result.eid;
  }

  async getEuiccInfo(): Promise<EuiccInfoResult | undefined> {
    const info: EuiccInfoResult | undefined = await this.execute('get_euicc_info', []);
    if (info) {
      this.eid = info.eidValue;
      this.smdp = info.EuiccConfiguredAddresses?.defaultDpAddress ?? '';
      this.setState({
        eid: info.eidValue,
        euiccInfo2: info.EUICCInfo2,
        euiccAddress: info.EuiccConfiguredAddresses,
        bytesFree: info.EUICCInfo2?.extCardResource?.freeNonVolatileMemory,
      });
    }
    return info;
  }

  async getProfiles(): Promise<ProfileMetadataMap[]> {
    const profiles = await this.execute('get_profiles', []);
    if (Array.isArray(profiles)) {
      this.profiles = profiles;
      this.setState({profiles});
      return profiles;
    }
    return [];
  }

  async getNotifications(): Promise<Notification[]> {
    const notifications: Notification[] = await this.execute('get_notifications', []);
    this.notifications = notifications;
    this.setState({notifications});
    return notifications;
  }

  async deleteNotification(seqNumber: number): Promise<Notification[]> {
    await this.execute('delete_notification_single', [seqNumber]);
    return this.getNotifications();
  }

  async sendNotification(seqNumber: number): Promise<any> {
    return this.execute('process_notification_single', [seqNumber]);
  }

  /** Re-reads eUICC info and profiles after a state-changing operation. */
  private async reloadAfterChange(kind: 'disable' | 'standard'): Promise<void> {
    await this.settle(kind);
    await this.getEuiccInfo();
    await this.getProfiles();
  }

  async disableProfileByIccId(iccid: string): Promise<any> {
    const refreshFlag = this.device.type === 'omapi' ? '1' : '0';
    const result = await this.execute('disable_profile', [iccid, refreshFlag]);
    await this.reloadAfterChange('disable');
    return result;
  }

  async enableProfileByIccId(iccid: string): Promise<any> {
    const refreshFlag = this.device.type === 'omapi' ? '1' : '0';
    const result = await this.execute('enable_profile', [iccid, refreshFlag]);
    await this.reloadAfterChange('standard');
    return result;
  }

  async setNicknameByIccId(iccid: string, nickname: string): Promise<any> {
    const result = await this.execute('rename_profile', [iccid, nickname]);
    await this.getProfiles();
    return result;
  }

  async deleteProfileByIccId(iccid: string): Promise<any> {
    const result = await this.execute('delete_profile', [iccid]);
    await this.reloadAfterChange('standard');
    return result;
  }

  async authenticateProfile(
    smdp: string,
    matchingId: string,
    callback: (update: ProgressUpdate) => void,
    imei = '',
  ): Promise<any> {
    this.callback = callback;
    return this.execute('authenticate_profile', [smdp, matchingId, imei]);
  }

  async smdsDiscovery(callback: (update: ProgressUpdate) => void): Promise<any> {
    this.callback = callback;
    return this.execute('discover_profile', ['lpa.ds.gsma.com', '356303455555555']);
  }

  async cancelSession(internalState: string): Promise<any> {
    return this.execute('cancel_download', [internalState]);
  }

  async downloadProfile(
    internalState: string,
    confirmationCode: string,
    callback: (update: ProgressUpdate) => void,
  ): Promise<any> {
    this.callback = callback;
    const result = await this.execute('download_profile', [internalState, confirmationCode]);
    if (result?.success) {
      await this.getProfiles();
      await this.getEuiccInfo();
    }
    return result;
  }

  /**
   * Acknowledges pending notifications with the operator.
   *
   * Delete notifications are sent but kept on the card (flag 0); install/enable/
   * disable notifications are sent and then removed (flag 1).
   */
  async processNotifications(iccid: string): Promise<void> {
    const DELETE = 0x10;
    const INSTALL_ENABLE_DISABLE = 0x20 | 0x40 | 0x80;
    await this.execute('process_notifications', [iccid, DELETE, 0]);
    await this.execute('process_notifications', [iccid, INSTALL_ENABLE_DISABLE, 1]);
    await this.getNotifications();
  }
}
