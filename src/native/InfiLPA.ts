import {NativeModules, Platform} from 'react-native';
import {Profiles} from "@/native/types";
import {CancelSessionReasons} from "@/native/consts";


const {
    LPABridge
} = NativeModules;

class InfiLPA {

    static currentEuicc = "";

    static refreshEUICC() {
        LPABridge.refreshEuiccs();
    }

    static isAllowed() {
        return Platform.OS === 'android';
    }

    static getCurrentEuicc() {
        return LPABridge.getCurrentEuicc();
    }
    static getEuiccList(): string[] {
        return JSON.parse(LPABridge.getEuiccListJSON()) as string[];
    }

    static selectEUICC(device: string) {
        this.currentEuicc = device;
        // LPABridge.selectEuicc(device);
    }

    static refreshProfileList(device?: string) {
        if (device) {
            LPABridge.refreshProfileListWithDevice(device);
        } else {
            LPABridge.refreshProfileList();
        }
    }

    static enableProfileByIccId(device: string, iccid: string) {
        LPABridge.enableProfileByIccId(device, iccid);
    }
    static disableProfileByIccId(device: string, iccid: string) {
        LPABridge.disableProfileByIccId(device, iccid);
    }
    static deleteProfileByIccId(device: string, iccid: string) {
        LPABridge.deleteProfileByIccId(device, iccid);
    }
    static setNicknameByIccId(device: string, iccid: string, nickname: string) {
        LPABridge.setNicknameByIccId(device, iccid, nickname);
    }
    static authenticateWithCode(device: string, activationCode: string): object {
        const v = LPABridge.authenticateWithCode(device, activationCode);
        return JSON.parse(v);
    }
    static downloadProfile(device: string, code: string) {
        return JSON.parse(LPABridge.downloadProfile(device, code));
    }
    static cancelSession(device: string) {
        return JSON.parse(LPABridge.cancelSession(device, CancelSessionReasons.END_USER_REJECTION));
    }
    static getLogs() {
        return LPABridge.getLogs();
    }
}

export default InfiLPA;