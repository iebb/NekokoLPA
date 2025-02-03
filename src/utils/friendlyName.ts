import {EuiccInfo2} from "@/native/types";
export function toFriendlyName(eid: string, euiccInfo2: EuiccInfo2) {

  if (eid.startsWith("89044045")) {
    switch (euiccInfo2.euiccFirmwareVer) {
      case "36.7.2": return "9eSIM v2 (10P)"
      case "36.9.3": return "9eSIM v2.1"
      case "36.17.4": return "9eSIM v2.2"
      case "36.17.39": return "9eSIM v3 beta"
      case "36.18.5": return "9eSIM v3"
    }
  }
  return "";
}