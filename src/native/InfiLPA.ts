import {NativeModules} from 'react-native';
import {Profiles} from "@/native/types";


const {
    InfineonDataModel
} = NativeModules;

class InfiLPA {

    static currentEuicc = "";

    static refreshEUICC() {
        InfineonDataModel.refreshEuiccs();
    }
    static getCurrentEuicc() {
        return InfineonDataModel.getCurrentEuicc();
    }
    static getEuiccList(): string[] {
        return JSON.parse(InfineonDataModel.getEuiccListJSON()) as string[];
    }

    static selectEUICC(device: string) {
        this.currentEuicc = device;
        // InfineonDataModel.selectEuicc(device);
    }

    static refreshProfileList(device?: string) {
        if (device) {
            InfineonDataModel.refreshProfileListWithDevice(device);
        } else {
            InfineonDataModel.refreshProfileList();
        }
    }

    static enableProfileByIccId(device: string, iccid: string) {
        InfineonDataModel.enableProfileByIccId(device, iccid);
    }
    static disableProfileByIccId(device: string, iccid: string) {
        InfineonDataModel.disableProfileByIccId(device, iccid);
    }
    static deleteProfileByIccId(device: string, iccid: string) {
        InfineonDataModel.deleteProfileByIccId(device, iccid);
    }
    static setNicknameByIccId(device: string, iccid: string, nickname: string) {
        InfineonDataModel.setNicknameByIccId(device, iccid, nickname);
    }
    static authenticateWithCode(device: string, activationCode: string): object {
        const v = InfineonDataModel.authenticateWithCode(device, activationCode);
        return JSON.parse(v);
    }
    static downloadProfile(device: string, code: string) {
        return JSON.parse(InfineonDataModel.downloadProfile(device, code));
    }
    static cancelSession(device: string, reason: number) {
        return JSON.parse(InfineonDataModel.cancelSession(device, reason));
    }

}

export default InfiLPA;