import {Adapters} from "@/native/adapters/registry";
import {setupDevice} from "@/native/jsnative/setup";
import {setDeviceState} from "@/redux/stateStore";
import {Dispatch} from "@reduxjs/toolkit";
import {Notification} from "@/native/types/LPA";

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
  // getProfiles: () => (any[]);
  // getEid: () => string;
  connect: () => Promise<boolean>;
  accessRule?: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  refresh: () => Promise<boolean>;
  reconnect: () => Promise<boolean>;
  transmit: (s: string) => Promise<string>;
}

export class Adapter {
  obsolete: boolean = false;
  connected: boolean = false;
  eid: string = '';
  deviceId: string = '';
  device: Device;
  profiles: any[] = [];
  smdp: string = '';
  notifications: Notification[] = [];
  dispatch: Dispatch;
  isLocked = false;
  _set_mtu = false;


  setState = (state: object) => {
    this.dispatch(setDeviceState([state, this.deviceId]));
  }

  callback = (state: object) => {
    console.log(state);
  }

  constructor(device: Device, dispatcher: Dispatch) {
    this.obsolete = false;
    this.device = device;
    this.dispatch = dispatcher;
    this.deviceId = device.deviceId;
    if (Adapters[device.deviceId]) {
      Adapters[device.deviceId].obsolete = false;
      return Adapters[device.deviceId];
    }
    Adapters[device.deviceId] = this;
  }

  async reconnect(): Promise<boolean> {
    await this.disconnect();
    return await this.connect();
  }

  async connect() {
    try {
      if (!this.connected) {
        if (await this.device.connect()) {
          this.connected = true;
          return true;
        }
      }
    } catch {
      this.connected = false;
      return false;
    }
    this.connected = false;
    return false;
  }

  async disconnect() {
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

  async initialize() {
    if (await this.connect()) {
      await this.getEuiccInfo();
      await this.getProfiles();
    }
  }

  async refresh() {
    try {
      await this.getEuiccInfo();
      await this.getProfiles();
    } catch {
      await this.initialize();
    }
  }

  async _execute(s: string, args: any[]): Promise<any> {
    return (await setupDevice(this))(s, args);
  }

  async execute(s: string, args: any[]): Promise<any> {
    if (this.isLocked) {
      // Wait until the lock is released
      return Promise.reject(new Error("Function is currently locked and cannot be executed simultaneously"));
    }
    this.isLocked = true;
    let result;
    try {
      result = await this._execute(s, args);
    } catch (e) {
      result = (await setupDevice(this))(s, args);
    }
    this.isLocked = false;
    return result;
  }

  async get_eid() {
    const result = await this.execute('get_eid', []);
    this.connected = true;
    this.eid = result.eid;
    return result.eid;
  }


  async getEuiccInfo() {
    const euicc_info = await this.execute('get_euicc_info', []);
    if (euicc_info) {
      this.eid = euicc_info.eidValue;
      this.smdp = euicc_info?.EuiccConfiguredAddresses?.defaultDpAddress;
      this.setState({
        eid: euicc_info.eidValue,
        euiccInfo2: euicc_info.EUICCInfo2,
        euiccAddress: euicc_info.EuiccConfiguredAddresses,
        bytesFree: euicc_info.EUICCInfo2?.extCardResource.freeNonVolatileMemory,
      });
    }
    return euicc_info;
  }

  async getProfiles() {
    const profiles = await this.execute('get_profiles', []);
    if (profiles && (profiles.constructor == Array)) {
      this.profiles = profiles;
      this.setState({ profiles });
      return profiles;
    }
    return [];
  }

  async getNotifications() {
    const notifications = await this.execute('get_notifications', []);
    this.notifications = notifications;
    this.setState({ notifications });
    return notifications;
  }

  async deleteNotification(id: number) {
    const result = await this.execute('delete_notification_single', [id]);
    const notifications = await this.execute('get_notifications', []);
    this.notifications = notifications;
    this.setState({ notifications });
    return notifications;
  }

  async sendNotification(id: number) {
    return await this.execute('process_notification_single', [id]);
  }


  async disableProfileByIccId(iccid: string) {
    const result = await this.execute('disable_profile', [iccid, this.device.type == 'omapi' ? '1' : '0']);
    if (this.device.type == 'omapi') {
      await new Promise(res => setTimeout(res, 1000));
    } else if (this.device.type == 'ble') {
      await new Promise(res => setTimeout(res, 300));
    }
    await this.getEuiccInfo();
    await this.getProfiles();
    return result;
  }

  async enableProfileByIccId(iccid: string) {
    const result = await this.execute('enable_profile', [iccid, this.device.type == 'omapi' ? '1' : '0']);
    if (this.device.type == 'omapi') {
      await new Promise(res => setTimeout(res, 500));
    } else if (this.device.type == 'ble') {
      await new Promise(res => setTimeout(res, 200));
    }
    await this.getEuiccInfo();
    await this.getProfiles();
    return result;
  }

  async setNicknameByIccId(iccid: string, nickname: string) {
    const result = await this.execute('rename_profile', [iccid, nickname]);
    await this.getProfiles();
    return result;
  }

  async deleteProfileByIccId(iccid: string) {
    const result = await this.execute('delete_profile', [iccid]);
    if (this.device.type == 'omapi') {
      await new Promise(res => setTimeout(res, 500));
    } else if (this.device.type == 'ble') {
      await new Promise(res => setTimeout(res, 200));
    }
    await this.getEuiccInfo();
    await this.getProfiles();
    return result;
  }

  async authenticateProfile(smdp: string, matchingId: string, callback: (obj: object) => any, imei: string = "") {
    this.callback = callback;
    return await this.execute('authenticate_profile', [smdp, matchingId, imei]);
  }


  async smdsDiscovery(callback: (obj: object) => any) { // , smds: string, imei: string = ""
    this.callback = callback;
    return await this.execute('discover_profile', ["lpa.ds.gsma.com", "356303455555555"]);
  }

  async cancelSession(internal_state: string) {
    return await this.execute('cancel_download', [internal_state]);
  }

  async downloadProfile(internal_state: string, confirmation_code: string = "", callback: (obj: object) => any) {
    this.callback = callback;
    const result = await this.execute('download_profile', [internal_state, confirmation_code]);
    if (result.success) {
      await this.getProfiles();
      await this.getEuiccInfo();
    }
    return result;
  }

  async processNotifications(iccid: string) {
    await this.execute("process_notifications", [iccid, 0x90, 0]);
    await this.execute("process_notifications", [iccid, 0x60, 1]);
    return
  }

}
