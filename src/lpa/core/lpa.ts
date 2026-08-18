/**
 * Local Profile Assistant (GSMA SGP.22).
 *
 * ES10a/b/c run over an injected `transmit(apduHex) -> responseHex`; ES9+ runs
 * over an injected `http(url, body) -> responseBody`. Nothing here touches
 * React Native directly, so the whole thing is unit-testable.
 *
 * The transport is expected to already have a logical channel open with the
 * ISD-R selected — every adapter in src/native/adapters does that on connect.
 */

import {
  Base64,
  bytesToHex,
  concatBytes,
  hexToBytes,
  intToHex,
  sha256,
  sha256Hex,
  swapNibbles,
  Utf8,
  ByteBuffer,
} from './bytes';
import { build, decode, findHex } from './bertlv';
import { CLA_PROPRIETARY, channelCla } from './channel';
import {
  ApduError,
  RemoteError,
  RemoteErrorException,
  profileResultMessage,
  remoteErrorFrom,
  statusWordHex,
  statusWordMessage,
} from './errors';
import {
  EuiccConfiguredAddresses,
  EuiccInfo2,
  InstallationResult,
  NotificationMetadata,
  PendingNotification,
  ProfileMetadata,
  boundProfilePackageSize,
  parseConfiguredAddresses,
  parseEuiccInfo2,
  parseInstallationResult,
  parseNotificationList,
  parsePendingNotifications,
  parseProfileInfoList,
  parseStoreMetadata,
  readAuthenticateServerResponse,
  readPrepareDownloadResponse,
  segmentBoundProfilePackage,
} from './models';

export type Transmit = (apduHex: string) => Promise<string>;
export type Http = (url: string, body: string) => Promise<string>;
export type ProgressCallback = (message: string, progress: number, total: number) => void;

export interface LpaOptions {
  transmit: Transmit;
  /** logical channel the ISD-R was selected on; CLA becomes 0x80 | channel */
  channel?: number;
  /** max bytes per STORE DATA block (lpac's "APDU MTU") */
  maxSegment?: number;
  http: Http;
  onProgress?: ProgressCallback;
}

const INS_STORE_DATA = 0xe2;
const INS_GET_RESPONSE = 0xc0;

/** Everything ES9+ needs to resume a download after the authenticate step. */
export interface DownloadSession {
  transactionId: string;
  smdpAddress: string;
  matchingId: string;
  smdpSigned2: string;
  smdpSignature2: string;
  smdpCertificate: string;
  isCcRequired: boolean;
  profile: ProfileMetadata;
}

/**
 * Profile fields to request, as SGP.22 tag bytes. `9F70` is two bytes; the
 * rest are one. Order follows the specification's own listing.
 */
const PROFILE_TAGS = new Uint8Array([
  0x5a, 0x4f, 0x9f, 0x70, 0x90, 0x91, 0x92, 0x95, 0xb6, 0xb7,
]);

/** The same, plus the icon type (93) and icon (94). */
const PROFILE_TAGS_WITH_ICONS = new Uint8Array([
  0x5a, 0x4f, 0x9f, 0x70, 0x90, 0x91, 0x92, 0x93, 0x94, 0x95, 0xb6, 0xb7,
]);

export class Lpa {
  private readonly transmitFn: Transmit;
  private readonly httpFn: Http;
  private readonly onProgress?: ProgressCallback;
  private channel: number;
  private maxSegment: number;

  constructor(options: LpaOptions) {
    this.transmitFn = options.transmit;
    this.httpFn = options.http;
    this.onProgress = options.onProgress;
    this.channel = options.channel === undefined ? 1 : options.channel;
    this.maxSegment = options.maxSegment === undefined ? 255 : options.maxSegment;
  }

  setChannel(channel: number): void {
    this.channel = channel;
  }

  /** lpac's `set_apdu_mtu`: caps the STORE DATA payload per block. */
  setMaxSegment(size: number): void {
    this.maxSegment = Math.max(1, Math.min(255, size));
  }

  private progress(message: string, progress = 0, total = 0): void {
    if (this.onProgress) {
      this.onProgress(message, progress, total);
    }
  }

  /* ---------------------------------------------------------------------
   * APDU layer
   * ------------------------------------------------------------------ */

  private get cla(): number {
    return channelCla(this.channel, CLA_PROPRIETARY);
  }

  private async transmit(apdu: Uint8Array): Promise<Uint8Array> {
    const response = await this.transmitFn(bytesToHex(apdu));
    if (!response || response.length < 4) {
      throw new ApduError(`Empty response to ${bytesToHex(apdu, 0, Math.min(5, apdu.length))}`);
    }
    return hexToBytes(response);
  }

  /**
   * ES10 command: STORE DATA chaining (P1 0x11 for "more", 0x91 for the last
   * block; P2 is the block counter) followed by GET RESPONSE.
   */
  async sendCommand(command: Uint8Array): Promise<Uint8Array> {
    const cla = this.cla;
    let block = 0;
    let offset = 0;

    for (;;) {
      const remaining = command.length - offset;
      const last = remaining <= this.maxSegment;
      const size = last ? remaining : this.maxSegment;
      const chunk = command.subarray(offset, offset + size);
      const header = new Uint8Array([cla, INS_STORE_DATA, last ? 0x91 : 0x11, block, size]);
      const response = await this.transmit(concatBytes(header, chunk));
      const sw1 = response[response.length - 2];
      const sw2 = response[response.length - 1];

      if (!last) {
        if (sw1 !== 0x90) {
          throw new ApduError(statusWordMessage(response), statusWordHex(response));
        }
        block++;
        offset += size;
        continue;
      }

      if (sw1 === 0x61) {
        return this.getResponse(sw2);
      }
      if (sw1 === 0x90) {
        return response.subarray(0, response.length - 2);
      }
      throw new ApduError(statusWordMessage(response), statusWordHex(response));
    }
  }

  private async getResponse(le: number): Promise<Uint8Array> {
    const buffer = new ByteBuffer(512);
    let expected = le;
    for (;;) {
      const response = await this.transmit(new Uint8Array([this.cla, INS_GET_RESPONSE, 0x00, 0x00, expected]));
      const sw1 = response[response.length - 2];
      const sw2 = response[response.length - 1];
      if (sw1 === 0x6c) {
        expected = sw2;
        continue;
      }
      buffer.append(response.subarray(0, response.length - 2));
      if (sw1 === 0x61) {
        expected = sw2;
        continue;
      }
      if (sw1 === 0x90) {
        return buffer.toBytes();
      }
      throw new ApduError(statusWordMessage(response), statusWordHex(response));
    }
  }

  /* ---------------------------------------------------------------------
   * ES10a / ES10c: eUICC and profile management
   * ------------------------------------------------------------------ */

  /** ES10c.GetEID */
  async getEid(): Promise<string> {
    const response = await this.sendCommand(new Uint8Array([0xbf, 0x3e, 0x03, 0x5c, 0x01, 0x5a]));
    const eid = findHex(decode(response), 'BF3E', '5A');
    if (!eid) {
      throw new ApduError('GetEID returned no EID');
    }
    return eid;
  }

  /** ES10b.GetEUICCInfo2 */
  async getEuiccInfo2(): Promise<EuiccInfo2> {
    return parseEuiccInfo2(await this.sendCommand(new Uint8Array([0xbf, 0x22, 0x00])));
  }

  /** ES10a.GetEuiccConfiguredAddresses */
  async getConfiguredAddresses(): Promise<EuiccConfiguredAddresses> {
    return parseConfiguredAddresses(await this.sendCommand(new Uint8Array([0xbf, 0x3c, 0x00])));
  }

  /**
   * ES10c.GetProfilesInfo
   *
   * The request carries an explicit `5C` tag list. Sent empty (`BF2D 00`) the
   * card returns only the fields it chooses to volunteer, which on most eUICCs
   * omits the operator MCC/MNC (B7), the icon (93/94) and the profile class
   * (95) — so those arrived undefined no matter what the parser supported.
   *
   * `withIcons` is separable because the icons are the bulk of the response:
   * a list of profiles each carrying a logo is many times the size of one
   * without, over a link that is sometimes a BLE reader.
   */
  async getProfiles(withIcons = true): Promise<ProfileMetadata[]> {
    const tags = withIcons ? PROFILE_TAGS_WITH_ICONS : PROFILE_TAGS;
    const request = build([0xbf, 0x2d], build(0x5c, tags));
    return parseProfileInfoList(await this.sendCommand(request));
  }

  private iccidTlv(iccid: string): Uint8Array {
    return build(0x5a, hexToBytes(swapNibbles(iccid)));
  }

  private static refreshTlv(refresh: boolean): Uint8Array {
    return new Uint8Array([0x81, 0x01, refresh ? 0xff : 0x00]);
  }

  private async profileOperation(command: Uint8Array, tag: string, operation: string): Promise<void> {
    const response = await this.sendCommand(command);
    const code = findHex(decode(response), tag, '80') || findHex(decode(response), '80');
    if (code !== '00') {
      throw new Error(profileResultMessage(operation, code || 'unknown'));
    }
  }

  /** ES10c.EnableProfile */
  async enableProfile(iccid: string, refresh: boolean): Promise<void> {
    const command = build(
      [0xbf, 0x31],
      build(0xa0, this.iccidTlv(iccid)),
      Lpa.refreshTlv(refresh),
    );
    await this.profileOperation(command, 'BF31', 'EnableProfile');
  }

  /** ES10c.DisableProfile */
  async disableProfile(iccid: string, refresh: boolean): Promise<void> {
    const command = build(
      [0xbf, 0x32],
      build(0xa0, this.iccidTlv(iccid)),
      Lpa.refreshTlv(refresh),
    );
    await this.profileOperation(command, 'BF32', 'DisableProfile');
  }

  /** ES10c.DeleteProfile */
  async deleteProfile(iccid: string): Promise<void> {
    await this.profileOperation(build([0xbf, 0x33], this.iccidTlv(iccid)), 'BF33', 'DeleteProfile');
  }

  /** ES10c.SetNickname */
  async setNickname(iccid: string, nickname: string): Promise<void> {
    const command = build(
      [0xbf, 0x29],
      this.iccidTlv(iccid),
      build(0x90, Utf8.encode(nickname)),
    );
    await this.profileOperation(command, 'BF29', 'SetNickname');
  }

  /* ---------------------------------------------------------------------
   * ES10b: notifications
   * ------------------------------------------------------------------ */

  /** ES10b.ListNotification */
  async listNotifications(): Promise<NotificationMetadata[]> {
    return parseNotificationList(await this.sendCommand(new Uint8Array([0xbf, 0x28, 0x00])));
  }

  /** ES10b.RetrieveNotificationsList for one sequence number */
  async retrieveNotification(seqNumber: number): Promise<PendingNotification | undefined> {
    const command = build(
      [0xbf, 0x2b],
      build(0xa0, build(0x80, hexToBytes(intToHex(seqNumber, seqNumber > 0xff ? 2 : 1)))),
    );
    const list = parsePendingNotifications(await this.sendCommand(command));
    return list[0];
  }

  /** ES10b.RemoveNotificationFromList */
  async removeNotification(seqNumber: number): Promise<void> {
    const command = build(
      [0xbf, 0x30],
      build(0x80, hexToBytes(intToHex(seqNumber, seqNumber > 0xff ? 2 : 1))),
    );
    const response = await this.sendCommand(command);
    const code = findHex(decode(response), 'BF30', '80');
    if (code !== '00') {
      throw new Error(`RemoveNotificationFromList failed with result code ${code}`);
    }
  }

  /** Post one pending notification to its SM-DP+ (ES9+ handleNotification). */
  async sendNotification(notification: PendingNotification): Promise<void> {
    const address = notification.metadata.notificationAddress;
    if (!address) {
      throw new Error('Notification has no SM-DP+ address');
    }
    await this.es9(address, 'handleNotification', { pendingNotification: notification.payload });
  }

  /* ---------------------------------------------------------------------
   * ES9+ transport
   * ------------------------------------------------------------------ */

  private static normalizeAddress(address: string): string {
    // whitespace inside the address has been seen in the wild (Orange PL)
    return address
      .replace(/\s/g, '')
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/, '');
  }

  private async es9(address: string, fn: string, body: object): Promise<any> {
    return this.rspCall(address, `es9plus/${fn}`, body);
  }

  private async rspCall(address: string, path: string, body: object): Promise<any> {
    const url = `https://${Lpa.normalizeAddress(address)}/gsma/rsp2/${path}`;
    const raw = await this.httpFn(url, JSON.stringify(body));
    // ES9+.HandleNotification has no response body (SGP.22 §6.5.2.8)
    if (!raw || !raw.trim()) {
      return {};
    }
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // Include what actually came back: an HTML error page or a bare status
      // string here means the endpoint is wrong or the server rejected us, and
      // "malformed response" on its own sends you looking in the wrong place.
      const snippet = raw.replace(/\s+/g, ' ').trim().slice(0, 120);
      throw new RemoteErrorException({
        status: 'Failed',
        message: `Unexpected non-JSON response from ${path}: ${snippet}`,
        reasonCode: '',
        subjectCode: '',
      });
    }
    const remoteError = remoteErrorFrom(parsed);
    if (remoteError) {
      throw new RemoteErrorException(remoteError);
    }
    return parsed;
  }

  /* ---------------------------------------------------------------------
   * Download: authenticate step
   * ------------------------------------------------------------------ */

  /**
   * ctxParams1 for ES10b.AuthenticateServer:
   *   A0 { [0] matchingId, [1] DeviceInfo { [0] tac, [1] deviceCapabilities, [2] imei } }
   */
  private static ctxParams1(matchingId: string, imei: string): Uint8Array {
    const digits = (imei || '').replace(/\D/g, '');
    // 3GPP TS 23.003 GSM-BCD: nibble-swapped, odd length padded with 'F'.
    // As in lpac, the TAC is the first four octets of the encoded IMEI, and a
    // fixed TAC is used when no IMEI is supplied.
    const encodedImei = digits.length >= 14
      ? hexToBytes(swapNibbles(digits.length % 2 === 0 ? digits : digits + 'F'))
      : undefined;
    const tac = encodedImei ? encodedImei.subarray(0, 4) : hexToBytes('35290611');

    const parts: Uint8Array[] = [build(0x80, tac), build(0xa1, new Uint8Array(0))];
    if (encodedImei) {
      parts.push(build(0x82, encodedImei));
    }
    const deviceInfo = build(0xa1, concatBytes(...parts));
    return matchingId
      ? build(0xa0, build(0x80, Utf8.encode(matchingId)), deviceInfo)
      : build(0xa0, deviceInfo);
  }

  /** ES10b.GetEUICCChallenge */
  private async getEuiccChallenge(): Promise<string> {
    const response = await this.sendCommand(new Uint8Array([0xbf, 0x2e, 0x00]));
    const challenge = findHex(decode(response), 'BF2E', '80');
    if (!challenge) {
      throw new ApduError('GetEUICCChallenge returned no challenge');
    }
    return Base64.fromHex(challenge);
  }

  /** ES10b.GetEUICCInfo1 (returned verbatim, the SM-DP+ wants the raw TLV) */
  private async getEuiccInfo1(): Promise<string> {
    return Base64.fromBytes(await this.sendCommand(new Uint8Array([0xbf, 0x20, 0x00])));
  }

  /**
   * Steps 1-4 of a download: challenge, initiateAuthentication,
   * AuthenticateServer, authenticateClient. Returns the session to hand back
   * to {@link downloadProfile}.
   */
  /**
   * Common prelude of every RSP session (SM-DP+ download and SM-DS discovery):
   * challenge the eUICC, let the server sign it, then have the eUICC verify
   * the server. Returns the transaction and the eUICC's signed answer.
   */
  private async beginAuthentication(
    address: string,
    matchingId: string,
    imei: string,
  ): Promise<{ transactionId: string; authenticateServerResponse: string }> {
    this.progress('download.step1.es10b_get_euicc_challenge_and_info');
    const euiccChallenge = await this.getEuiccChallenge();
    const euiccInfo1 = await this.getEuiccInfo1();

    this.progress('download.step2.es9p_initiate_authentication');
    const initiate = await this.es9(address, 'initiateAuthentication', {
      euiccChallenge,
      euiccInfo1,
      smdpAddress: Lpa.normalizeAddress(address),
    });

    this.progress('download.step3.es10b_authenticate_server');
    const authenticateServerResponse = readAuthenticateServerResponse(
      await this.sendCommand(
        build(
          [0xbf, 0x38],
          Base64.toBytes(initiate.serverSigned1),
          Base64.toBytes(initiate.serverSignature1),
          Base64.toBytes(initiate.euiccCiPKIdToBeUsed),
          Base64.toBytes(initiate.serverCertificate),
          Lpa.ctxParams1(matchingId, imei),
        ),
      ),
    );

    return { transactionId: initiate.transactionId, authenticateServerResponse };
  }

  async authenticate(smdpAddress: string, matchingId: string, imei: string): Promise<DownloadSession> {
    const { transactionId, authenticateServerResponse } = await this.beginAuthentication(
      smdpAddress,
      matchingId,
      imei,
    );

    this.progress('download.step4.es9p_authenticate_client');
    const client = await this.es9(smdpAddress, 'authenticateClient', {
      transactionId,
      authenticateServerResponse,
    });

    const smdpSigned2 = client.smdpSigned2;
    const isCcRequired = findHex(decode(Base64.toBytes(smdpSigned2)), '30', '01') === 'FF';

    return {
      transactionId,
      smdpAddress: Lpa.normalizeAddress(smdpAddress),
      matchingId,
      smdpSigned2,
      smdpSignature2: client.smdpSignature2,
      smdpCertificate: client.smdpCertificate,
      isCcRequired,
      profile: parseStoreMetadata(client.profileMetadata),
    };
  }

  /**
   * ES11 SM-DS discovery: same authentication prelude, but the event entries
   * come back from the discovery server instead of a profile.
   * Returns the RSP server addresses that have something waiting for this EID.
   */
  async discover(smdsAddress: string, imei: string): Promise<string[]> {
    const { transactionId, authenticateServerResponse } = await this.beginAuthentication(smdsAddress, '', imei);
    this.progress('download.step4.es9p_authenticate_client');
    // ES11.AuthenticateClient is served from the ES9+ path rather than an
    // /es11/ one: the SM-DS reuses the same endpoint and only the response
    // differs (eventEntries instead of profile metadata). GSMA's root DS
    // answers 404 on /gsma/rsp2/es11/authenticateClient.
    const response = await this.es9(smdsAddress, 'authenticateClient', {
      transactionId,
      authenticateServerResponse,
    });
    const entries = response.eventEntries || [];
    return entries
      .map((entry: any) => entry.rspServerAddress)
      .filter((address: string) => !!address);
  }

  /* ---------------------------------------------------------------------
   * Download: install step
   * ------------------------------------------------------------------ */

  /** hashCc = SHA256( SHA256(confirmationCode) || transactionId ) */
  private static hashConfirmationCode(transactionIdHex: string, confirmationCode: string): Uint8Array {
    return sha256(hexToBytes(sha256Hex(confirmationCode) + transactionIdHex));
  }

  /**
   * Steps 5-9: PrepareDownload, getBoundProfilePackage,
   * LoadBoundProfilePackage, then handleNotification + cleanup.
   */
  async downloadProfile(session: DownloadSession, confirmationCode: string): Promise<InstallationResult> {
    if (session.isCcRequired && !confirmationCode) {
      throw new Error('This profile requires a confirmation code');
    }

    this.progress('download.step5.es10b_prepare_download');
    const signed2 = Base64.toBytes(session.smdpSigned2);
    const parts: Uint8Array[] = [signed2, Base64.toBytes(session.smdpSignature2)];
    if (confirmationCode) {
      const transactionId = findHex(decode(signed2), '30', '80') || session.transactionId;
      parts.push(build(0x04, Lpa.hashConfirmationCode(transactionId, confirmationCode)));
    }
    parts.push(Base64.toBytes(session.smdpCertificate));

    const prepareDownloadResponse = readPrepareDownloadResponse(
      await this.sendCommand(build([0xbf, 0x21], concatBytes(...parts))),
    );

    this.progress('download.step6.es9p_get_bound_profile_package');
    const bound = await this.es9(session.smdpAddress, 'getBoundProfilePackage', {
      transactionId: session.transactionId,
      prepareDownloadResponse,
    });

    this.progress('download.step7.es10b_load_bound_profile_package');
    const result = await this.loadBoundProfilePackage(bound.boundProfilePackage);

    this.progress('download.step9.finalize');
    await this.finalizeInstall(session, result);
    return result;
  }

  /**
   * ES10b.LoadBoundProfilePackage.
   *
   * Each BPP segment is its own complete STORE DATA chain (SGP.22 §5.7.6):
   * the eUICC accumulates them and answers 9000 until the final segment, which
   * comes back with the ProfileInstallationResult.
   */
  async loadBoundProfilePackage(boundProfilePackage: string): Promise<InstallationResult> {
    const segments = segmentBoundProfilePackage(boundProfilePackage);
    const total = boundProfilePackageSize(segments);
    let written = 0;
    let response: Uint8Array | undefined;

    for (const segment of segments) {
      const answer = await this.sendCommand(segment);
      written += segment.length;
      this.progress('download.step8.load_bpp', written, total);
      if (answer.length > 0) {
        response = answer;
        break;
      }
    }

    if (!response) {
      throw new Error('The eUICC returned no installation result');
    }
    return parseInstallationResult(response);
  }

  /**
   * Report the install to the SM-DP+ and drop the notification from the card.
   *
   * SGP.22 §3.1.3: the ProfileInstallationResult is delivered whether the
   * install succeeded or failed — a failed install the SM-DP+ never hears
   * about leaves the order stuck. A notification that cannot be delivered is
   * kept on the card so the Notifications screen can retry it.
   */
  private async finalizeInstall(session: DownloadSession, result: InstallationResult): Promise<void> {
    const notification = result.notification;
    if (!notification) {
      return;
    }
    try {
      await this.es9(notification.notificationAddress || session.smdpAddress, 'handleNotification', {
        pendingNotification: result.payload,
      });
      await this.removeNotification(notification.seqNumber);
    } catch (e) {
      // keep the notification on the card; the Notifications screen can retry
    }
  }

  /**
   * ES10b.CancelSession + ES9+ cancelSession.
   * CancelSessionReason ::= INTEGER { endUserRejection(0), postponed(1),
   * timeout(2), pprNotAllowed(3), metadataMismatch(4),
   * loadBppExecutionError(5), undefinedReason(127) }
   */
  async cancelSession(session: DownloadSession, reason = 0): Promise<void> {
    const command = build(
      [0xbf, 0x41],
      build(0x80, hexToBytes(session.transactionId)),
      build(0x81, new Uint8Array([reason])),
    );
    const response = await this.sendCommand(command);
    const cancelSessionResponse = Base64.fromBytes(response);
    await this.es9(session.smdpAddress, 'cancelSession', {
      transactionId: session.transactionId,
      cancelSessionResponse,
    });
  }
}

export type { RemoteError, InstallationResult, NotificationMetadata, ProfileMetadata };
