export function toCIName(x: string) {

  if (x === "81370f5125d0b1d408d4c3b232e6d25e795bebfb") {
    return "GSMA CI"
  }
  if (x === "4c27967ad20c14b391e9601e41e604ad57c0222f") {
    return "OISITE G1"
  }
  if (x === "148030fc246c02ff222106125a8d6bda990afbe9") {
    return "Taier"
  }
  if (x === "16b5d16048e3ea02bd4b606e5f77a4bf20808d83") {
    return "ChinaUnicom"
  }
  if (x === "cdf6d1c0a7b07f98a861b6e378b82f648d99663e") {
    return "ChinaMobile"
  }
  if (x === "d3ef83fc503f9c6ec4b7f6ae055b7f1373d4ab1e") {
    return "ChinaTelecom"
  }
  if (x === "665a1433d67c1a2c5db8b52c967f10a057ba5cb2") {
    return "Symantec Test CA"
  }
  if (x === "b60f0b897fd630b88cfed6161f8ea808c5382ac3") {
    return "SubMan V4.2 CI Google Pixel"
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