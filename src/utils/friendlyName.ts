import {EuiccInfo2} from "@/native/types";
export function toFriendlyName(eid: string, euiccInfo2: EuiccInfo2 | undefined) {
  if (euiccInfo2 === undefined) {
    return "";
  }
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

export function toCIName(x: string) {

  if (x === "81370f5125d0b1d408d4c3b232e6d25e795bebfb") {
    return "GSMA"
  }
  if (x === "4c27967ad20c14b391e9601e41e604ad57c0222f") {
    return "OISITE"
  }
  if (x === "148030fc246c02ff222106125a8d6bda990afbe9") {
    return "Taier"
  }
  if (x === "16b5d16048e3ea02bd4b606e5f77a4bf20808d83") {
    return "CUnicom"
  }
  if (x === "cdf6d1c0a7b07f98a861b6e378b82f648d99663e") {
    return "CMobile"
  }
  if (x === "d3ef83fc503f9c6ec4b7f6ae055b7f1373d4ab1e") {
    return "CTelecom"
  }
  if (x === "665a1433d67c1a2c5db8b52c967f10a057ba5cb2") {
    return "SymantecTest"
  }
  if (x === "b60f0b897fd630b88cfed6161f8ea808c5382ac3") {
    return "GooglePixel"
  }
  if (x === "0b1359633d2ab469761ca9d82b2229350db722d7") {
    return "5ber.eSIM"
  }
  if (
    x === "f54172bdf98a95d65cbeb88a38a1c11d800a85c3" ||
    x === "c0bc70ba36929d43b467ff57570530e57ab8fcd8" ||
    x === "34eecf13156518d48d30bdf06853404d115f955d" ||
    x === "2209f61cd9ec5c9c854e787341ff83ecf9776a5b"
  ) {
    return "GSMA Test CI"
  }

  return x.substr(0, 6);
}