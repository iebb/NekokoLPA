import _PLMN from "./plmn.json";
import _MCC from "./mcc.json";

export interface T_MCC {
  MCC:      string;
  Region:   string;
  Country:  string;
  ISO:     string;
  ISO1:     string;
  Emoji:    string;
};

export interface T_PLMN {
  MCC:      string;
  Region:   string;
  Country:  string;
  ISO:      string;
  ISO1:     string;
  Emoji:    string;
  MNC?:      string;
  PLMN?:     string;
  Operator?: string;
  Brand?:    string;
  TADIG?:    string;
  Bands?:    string;
};

const PLMN = _PLMN as {[key: string]: T_PLMN};
const MCC = _MCC as {[key: string]: T_MCC};

export function resolveMccMnc(uMCCMNC: string): T_PLMN {

  const mcc = uMCCMNC.substring(0, 3);
  const mnc = uMCCMNC.substring(3);
  const plmn = mcc + mnc;
  if (PLMN[plmn]) {
    return PLMN[plmn];
  }
  return {...MCC[mcc], MNC: mnc, PLMN: plmn, Operator: uMCCMNC};
}