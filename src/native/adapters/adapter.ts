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

  setState = (state: object) => {
    this.dispatch(setDeviceState([state, this.deviceId]));
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

  async connect() {
    try {
      if (!this.connected) {
        await this.device.connect();
      }
      this.connected = true;
      return true;
    } catch {
      this.connected = false;
      return false;
    }
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
    await this.connect();
    await this.get_euicc_info();
    await this.get_profiles();
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


  async get_euicc_info() {
    const euicc_info = await this.execute('get_euicc_info', []);

    this.eid = euicc_info.eidValue;
    this.smdp = euicc_info?.EuiccConfiguredAddresses?.defaultDpAddress;
    this.setState({
      eid: euicc_info.eidValue,
      euiccInfo2: euicc_info.EUICCInfo2,
      euiccAddress: euicc_info.EuiccConfiguredAddresses,
      bytesFree: euicc_info.EUICCInfo2?.extCardResource.freeNonVolatileMemory,
    });
    return await euicc_info;
  }

  async get_profiles() {
    const profiles = await this.execute('get_profiles', []);
    if (profiles.constructor == Array) {
      this.profiles = profiles;
      this.setState({
        profiles,
      });
      return profiles;
    }
    return [];
  }

  async getNotifications() {
    const notifications = await this.execute('get_notifications', []);
    console.log('notifications', notifications);
    this.notifications = notifications;
    this.setState({ notifications });
    return notifications;
  }

  async deleteNotification(id: number) {
    const result = await this.execute('delete_notification_single', [id]);
    console.log('deleteNotification result', result);
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
    }
    await this.get_profiles();
    return result;
  }

  async enableProfileByIccId(iccid: string) {
    const result = await this.execute('enable_profile', [iccid, this.device.type == 'omapi' ? '1' : '0']);
    if (this.device.type == 'omapi') {
      await new Promise(res => setTimeout(res, 1000));
    }
    await this.get_profiles();
    return result;
  }

  async setNicknameByIccId(iccid: string, nickname: string) {
    const result = await this.execute('rename_profile', [iccid, nickname]);
    await this.get_profiles();
    return result;
  }

  async deleteProfileByIccId(iccid: string) {
    const result = await this.execute('delete_profile', [iccid]);
    if (this.device.type == 'omapi') {
      await new Promise(res => setTimeout(res, 1000));
    }
    await this.get_profiles();
    await this.get_euicc_info();
    return result;
  }

  async authenticateProfile(smdp: string, matchingId: string, imei: string = "356726381389691") {
    return await this.execute('authenticate_profile', [smdp, matchingId, imei]);
  }

  async cancelSession(internal_state: string) {
    return await this.execute('cancel_download', [internal_state]);
  }

  async downloadProfile(internal_state: string, confirmation_code: string = "") {
    const result = await this.execute('download_profile', [internal_state, confirmation_code]);
    if (result.success) {
      await this.get_profiles();
      await this.get_euicc_info();
    }
    return result;
  }

  async processNotifications(iccid: string) {
    await this.execute("process_notifications", [iccid, 0x90, 0]);
    await this.execute("process_notifications", [iccid, 0x60, 1]);
    return
  }

}
