/**
 * This exposes the native CalendarModule module as a JS module. This has a
 * function 'createCalendarEvent' which takes the following parameters:

 * 1. String name: A string representing the name of the event
 * 2. String location: A string representing the location of the event
 */
import {NativeModules} from 'react-native';
import {Profiles} from "@/native/types";


const {InfineonDataModel} = NativeModules;

class InfiLPA {
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
        InfineonDataModel.selectEuicc(device);
    }
    static getProfiles(): Profiles {
        return JSON.parse(InfineonDataModel.getProfileListJSON()) as Profiles;
    }
    static enableProfileByIccId(iccid: string) {
        InfineonDataModel.enableProfileByIccId(iccid);
    }
    static refreshProfileList(device?: string) {
        if (device) {
            InfineonDataModel.refreshProfileListWithDevice(device);
        } else {
            InfineonDataModel.refreshProfileList();
        }
    }
    static disableProfileByIccId(iccid: string) {
        InfineonDataModel.disableProfileByIccId(iccid);
    }
    static deleteProfileByIccId(iccid: string) {
        InfineonDataModel.deleteProfileByIccId(iccid);
    }
    static setNicknameByIccId(iccid: string, nickname: string) {
        InfineonDataModel.setNicknameByIccId(iccid, nickname);
    }
    static authenticateWithCode(activationCode: string) {
        InfineonDataModel.authenticateWithCode(activationCode);
    }
    static downloadProfile(code: string) {
        InfineonDataModel.downloadProfile(code);
    }
    static cancelSession(reason: number) {
        InfineonDataModel.cancelSession(reason);
    }

}

export default InfiLPA;