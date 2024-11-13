import {Adapters} from "@/native/adapters/registry";
import {setupDevice} from "@/native/jsnative/setup";
import {setDeviceState} from "@/redux/stateStore";
import {Dispatch} from "@reduxjs/toolkit";

export interface Device {
  type: string;
  deviceName: string;
  deviceId: string;
  explicitConnectionRequired: boolean;
  // getProfiles: () => (any[]);
  // getEid: () => string;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  transmit: (s: string) => Promise<string>;
}

export class Adapter {
  obsolete: boolean = false;
  connected: boolean = false;
  eid: string = '';
  deviceId: string = '';
  device: Device;
  profiles: string = '';
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
    if (!this.connected) {
      await this.device.connect();
    }
    this.connected = true;
    return true;
  }

  async disconnect() {
    if (this.connected) {
      await this.device.disconnect();
    }
    this.connected = false;
    return true;
  }

  async initialize() {
    await this.connect();
    const profiles = await this.get_profiles();
    this.setState({
      profiles,
    });
    const euicc_info = await this.get_euicc_info();
    this.setState({
      eid: euicc_info.eidValue,
      bytesFree: euicc_info.EUICCInfo2.extCardResource.freeNonVolatileMemory,
    });
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
    return await this.execute('get_euicc_info', []);
  }

  async get_profiles() {
    const profiles = await this.execute('get_profiles', []);
    this.profiles = profiles;
    this.setState({
      profiles,
    });
    return profiles;
  }

  async disableProfileByIccId(iccid: string) {
    const result = await this.execute('disable_profile', [iccid, this.device.type == 'omapi' ? '1': '0']);
    console.log("disable result", result);
    if (this.device.type == 'omapi') {
      await new Promise(res => setTimeout(res, 1000));
    }
    await this.get_profiles();
    return result;
  }

  async enableProfileByIccId(iccid: string) {
    const result = await this.execute('enable_profile', [iccid, this.device.type == 'omapi' ? '1': '0']);
    console.log("enable result", result);
    if (this.device.type == 'omapi') {
      await new Promise(res => setTimeout(res, 1000));
    }
    await this.get_profiles();
    return result;
  }

  async setNicknameByIccId(iccid: string, nickname: string) {
    const result = await this.execute('rename_profile', [iccid, nickname]);
    console.log("result", result);
    await this.get_profiles();
    return result;
  }

  async deleteProfileByIccId(iccid: string) {
    const result = await this.execute('delete_profile', [iccid]);
    if (this.device.type == 'omapi') {
      await new Promise(res => setTimeout(res, 1000));
    }
    await this.get_profiles();
    return result;
  }

  async authenticateProfile(smdp: string, matchingId: string, imei: string = "") {
    return await this.execute('authenticate_profile', [smdp, matchingId, imei]);
  }

  async cancelSession(internal_state: string) {
    return await this.execute('cancel_download', [internal_state]);
  }

  async downloadProfile(internal_state: string, confirmation_code: string = "") {
    return await this.execute('download_profile', [internal_state, confirmation_code]);
  }

  async processNotifications(iccid: string) {
    await this.execute("process_notifications", [iccid, 0x90, 0]);
    await this.execute("process_notifications", [iccid, 0x60, 1]);
    return
  }

}
