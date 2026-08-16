# LPA (GSMA SGP.22) in TypeScript

This replaces `src/lpa/bridge/web.out.js`, the emscripten/wasm2js build of
[lpac](https://github.com/estkme-group/lpac), with a direct implementation of
the parts of SGP.22 the app uses.

```
bytes.ts    hex / BCD / UTF-8 / base64 / SHA-256 / growable buffer
bertlv.ts   BER-TLV codec + a schema-driven TLV -> object mapper
models.ts   SGP.22 response parsers (profiles, notifications, EUICCInfo2, BPP)
errors.ts   ISO 7816 status words, ES10 result codes, ES9+ RemoteError
lpa.ts      ES10a/b/c command set + ES9+/ES11 flows
dispatcher.ts   the lpac-compatible execute(fn, args) dispatcher
```

Nothing here imports React Native, so it is all unit-testable
(`npx jest src/lpa/core`).

## How it plugs in

`Adapter.execute(fn, args)` is unchanged. `bridge/runtime.ts` now builds an
`LpaDispatcher` per device instead of instantiating a wasm module, and injects:

- `transmit(apduHex) => responseHex` — `Device.transmit`, with the class byte
  rewritten to `8<channel>` exactly as before.
- `http(url, body) => responseBody` — `CustomHttp.sendHttpRequest`, which
  already sets `X-Admin-Protocol` and the rest of the ES9+ headers.
- `onProgress(message, progress, total)` — the same message ids the
  `progress_download.stepN.*` translation keys expect.

The adapters open the logical channel and select the ISD-R on connect, so this
layer never does channel management; it only speaks ES10 over STORE DATA
(`INS E2`, `P1` 0x11/0x91, `P2` block counter) and GET RESPONSE (`INS C0`).

## SGP.22 coverage

Everything the app calls is implemented. The gaps below are functions no screen
currently reaches; they are listed so the next person does not have to rederive
the audit.

### ES10a — LPA ↔ ISD-R (addresses)

| Function | Tag | Status |
| --- | --- | --- |
| GetEuiccConfiguredAddresses | BF3C | implemented |
| SetDefaultDpAddress | BF3F | **not implemented** — no UI writes the default SM-DP+ |

### ES10b — RSP session

| Function | Tag | Status |
| --- | --- | --- |
| GetEUICCChallenge | BF2E | implemented |
| GetEUICCInfo1 / GetEUICCInfo2 | BF20 / BF22 | implemented |
| AuthenticateServer | BF38 | implemented |
| PrepareDownload | BF21 | implemented |
| LoadBoundProfilePackage | BF36 → BF37 | implemented |
| ListNotification | BF28 | implemented |
| RetrieveNotificationsList | BF2B | implemented |
| RemoveNotificationFromList | BF30 | implemented |
| CancelSession | BF41 | implemented |
| LoadCRL | BF35 | **not implemented** — optional, certificate validation happens on the eUICC |
| GetRAT | BF43 | **not implemented** — see Profile Policy Rules below |

### ES10c — profile management

| Function | Tag | Status |
| --- | --- | --- |
| GetProfilesInfo | BF2D | implemented |
| EnableProfile / DisableProfile | BF31 / BF32 | implemented (refreshFlag honoured) |
| DeleteProfile | BF33 | implemented |
| SetNickname | BF29 | implemented |
| GetEID | BF3E | implemented |
| eUICCMemoryReset | BF34 | **not implemented** — no UI exposes a factory reset |

### ES9+ / ES11

`initiateAuthentication`, `authenticateClient`, `getBoundProfilePackage`,
`handleNotification` and `cancelSession` are implemented against the standard
REST binding (`https://<host>/gsma/rsp2/es9plus/<function>`). SM-DS discovery
uses the same prelude and finishes at `/gsma/rsp2/es11/authenticateClient`,
returning `eventEntries[].rspServerAddress`.

### Known functional gaps

- **Profile Policy Rules are not enforced.** SGP.22 §2.9.1 lets an LPA refuse a
  profile whose PPRs are not authorised by the Rules Authorisation Table
  (ES10b.GetRAT). The rules are parsed and surfaced in the metadata, but nothing
  blocks on them. lpac does not enforce them either, so this is not a regression.
- **No device change / RPM.** Those are SGP.22 v3 features; this app talks
  `gsma/rsp/v2.2.0`.
- **No certificate revocation checking** (LoadCRL). The eUICC validates the
  SM-DP+ certificate chain itself; the LPA only shuttles the blobs.

### Spec details worth not re-discovering

- The BPP is split into the segments prescribed by §2.5.5 (BF36 header + BF23,
  then A0, then the A1 header and each 88 separately, then A2, then the A3
  header and each 86 separately). Each segment is its own complete STORE DATA
  chain; the eUICC answers `9000` until the last one, which returns the
  ProfileInstallationResult.
- `hashCc = SHA256( SHA256(confirmationCode) || transactionId )`, sent as tag
  `04` in PrepareDownload, and only when the SM-DP+ set `ccRequiredFlag`.
- `DeviceInfo` carries the TAC as the first four octets of the GSM-BCD
  (nibble-swapped) IMEI, with the IMEI itself in tag `82`. When no IMEI is
  supplied the TAC falls back to `35290611`. This matches lpac byte for byte.
- ES9+.HandleNotification has no response body (§6.5.2.8), so an empty HTTP
  response is success, not a parse failure.
- The ProfileInstallationResult is reported to the SM-DP+ whether the install
  succeeded or failed (§3.1.3) — otherwise a failed order is never released
  server-side.
- Notifications are delivered in ascending `seqNumber` order (§3.5).

## Testing

`npx jest src/lpa/core` — 36 tests covering SHA-256/base64 against known
vectors, TLV round trips (long-form lengths, multi-byte tags), every response
parser, BPP segmentation, the STORE DATA/GET RESPONSE transport against a fake
eUICC, and the full authenticate → download → notify flow against a scripted
SM-DP+, asserting the exact command bytes.

It was also run against a real eUICC: an eSTK.me RED over PC/SC, driving the
compiled module through the same bring-up the CCID adapter performs. Read-only
(`GetEID`, `GetEUICCInfo2`, `GetEuiccConfiguredAddresses`, `GetProfilesInfo`,
`ListNotification`) — 24 profiles and the eUICC info decoded correctly,
including a GetProfilesInfo response spanning several GET RESPONSE chunks.
The download path has not been exercised against a live SM-DP+.

Note that `profileOwnerMccMnc` comes back empty from `GetProfilesInfo` on that
card: the eUICC does not return tag `B7` for the default (no tag list) request.
lpac never parsed `B7` there either — upstream treats it as an unhandled tag —
so the profile rows keep falling back to `predictCountryForICCID`. It is parsed
when present, and the download metadata (BF25) does carry it. Requesting an
explicit tag list would be a separate change.

## One deliberate behaviour change

`profileOwnerMccMnc` is now decoded to a plain `plmn.json` key: MCC digits
followed by MNC digits, with the `F` filler of a two-digit MNC dropped
(`44F001` → `44010`). `src/data/plmn.json` is keyed exactly this way, so
operator lookups in `resolveMccMnc` now hit instead of falling back to the
MCC-only entry. The `replaceAll("F", " ")` in `MetadataView` becomes a no-op
rather than something the value depends on.
