/// <reference types="jest" />
import {
  Base64,
  bytesToHex,
  hexToBytes,
  sha256Hex,
  swapNibbles,
  toVersionString,
  Utf8,
} from '../bytes';
import { build, decode, encodeLength, find, findHex, findPath, toHex } from '../bertlv';
import {
  decodeIccid,
  decodeMccMnc,
  parseEuiccInfo2,
  parseInstallationResult,
  parseNotificationList,
  parseProfileInfoList,
  parseStoreMetadata,
  segmentBoundProfilePackage,
} from '../models';
import { Lpa } from '../lpa';
import { LpaDispatcher } from '../dispatcher';

/* ------------------------------------------------------------------ utils */

const tlv = (tag: string, body: string) => tag + encodeLength(body.length / 2) + body;
const utf8 = (s: string) => bytesToHex(Utf8.encode(s));
const ICCID = '89760000000000123456';
const ICCID_ENCODED = swapNibbles(ICCID);

/**
 * An eUICC that speaks the real ES10 transport: STORE DATA chaining on INS E2
 * (P1 0x11 "more" / 0x91 "last", P2 block counter) and GET RESPONSE on INS C0.
 */
class FakeCard {
  public readonly commands: string[] = [];
  public readonly raw: string[] = [];
  private assembled = '';
  private pending = '';

  constructor(private readonly respond: (commandHex: string) => string | undefined) {}

  transmit = async (apduHex: string): Promise<string> => {
    this.raw.push(apduHex);
    const bytes = hexToBytes(apduHex);
    const ins = bytes[1];

    if (ins === 0xe2) {
      const lc = bytes[4];
      this.assembled += bytesToHex(bytes.subarray(5, 5 + lc));
      if (bytes[2] !== 0x91) {
        return '9000';
      }
      const command = this.assembled;
      this.assembled = '';
      this.commands.push(command);
      const answer = this.respond(command);
      if (!answer) {
        return '9000';
      }
      this.pending = answer;
      return '61' + Math.min(this.pending.length / 2, 0xff).toString(16).padStart(2, '0');
    }

    if (ins === 0xc0) {
      const chunk = this.pending.substring(0, 255 * 2);
      this.pending = this.pending.substring(255 * 2);
      if (this.pending.length > 0) {
        return chunk + '61' + Math.min(this.pending.length / 2, 0xff).toString(16).padStart(2, '0');
      }
      return chunk + '9000';
    }

    return '9000';
  };
}

const makeLpa = (card: FakeCard, http: any = jest.fn(), maxSegment = 32) =>
  new Lpa({ transmit: card.transmit, http, channel: 1, maxSegment });

/* ------------------------------------------------------------------ bytes */

describe('bytes', () => {
  it('computes SHA-256 known vectors', () => {
    expect(sha256Hex('')).toBe('E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855');
    expect(sha256Hex('abc')).toBe('BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD');
    // message lengths around the padding boundaries
    expect(sha256Hex('a'.repeat(55))).toBe(
      '9F4390F8D30C2DD92EC9F095B65E2B9AE9B0A925A5258E241C9F1E910F734318',
    );
    expect(sha256Hex('a'.repeat(56))).toBe(
      'B35439A4AC6F0948B6D6F9E3C6AF0F5F590CE20F1BDE7090EF7970686EC6738A',
    );
  });

  it('round-trips base64 and utf-8', () => {
    for (let n = 0; n < 20; n++) {
      const bytes = new Uint8Array(n).map((_, i) => (i * 37) & 0xff);
      expect(Base64.toBytes(Base64.fromBytes(bytes))).toEqual(bytes);
    }
    expect(Base64.fromHex('BF2000')).toBe('vyAA');
    expect(Base64.toHex('vyAA')).toBe('BF2000');
    expect(Utf8.decode(Utf8.encode('Nekoko 中文 🐝'))).toBe('Nekoko 中文 🐝');
  });

  it('decodes BCD and version fields', () => {
    expect(swapNibbles(ICCID)).toBe('98670000000000214365');
    expect(decodeIccid('98670000000000214365')).toBe(ICCID);
    // 19-digit ICCID: the F filler is dropped
    expect(decodeIccid('986700000000002143F5')).toBe('8976000000000012345');
    expect(toVersionString('020202')).toBe('2.2.2');
  });

  it('decodes mccMnc into a plmn.json key', () => {
    // MCC 440 / MNC 10 -> octets 44 F0 01
    expect(decodeMccMnc('44F001')).toBe('44010');
    // MCC 310 / MNC 260 -> octets 13 00 62
    expect(decodeMccMnc('130062')).toBe('310260');
    expect(decodeMccMnc('')).toBe('');
  });
});

/* ----------------------------------------------------------------- ber-tlv */

describe('BER-TLV', () => {
  it('encodes lengths in short and long form', () => {
    expect(encodeLength(0)).toBe('00');
    expect(encodeLength(127)).toBe('7F');
    expect(encodeLength(128)).toBe('8180');
    expect(encodeLength(255)).toBe('81FF');
    expect(encodeLength(256)).toBe('820100');
  });

  it('round-trips nested structures', () => {
    const hex = tlv('BF2D', tlv('A0', tlv('E3', tlv('5A', ICCID_ENCODED) + tlv('9F70', '01'))));
    const nodes = decode(hexToBytes(hex));
    expect(nodes).toHaveLength(1);
    expect(nodes[0].tag).toBe('BF2D');
    expect(toHex(nodes[0])).toBe(hex);
  });

  it('round-trips long-form lengths', () => {
    const hex = tlv('BF36', tlv('A0', tlv('87', 'AB'.repeat(400))));
    const node = decode(hexToBytes(hex))[0];
    expect(toHex(node)).toBe(hex);
  });

  it('searches by tag and by path', () => {
    const nodes = decode(hexToBytes(tlv('BF3E', tlv('5A', '89049032000000000000000000000001'))));
    expect(findHex(nodes, 'BF3E', '5A')).toBe('89049032000000000000000000000001');
    expect(findPath(nodes, 'BF3E', '5A')!.tag).toBe('5A');
    expect(find(nodes, '9F70')).toBeUndefined();
  });

  it('builds commands with computed lengths', () => {
    const command = build([0xbf, 0x33], build(0x5a, hexToBytes(ICCID_ENCODED)));
    expect(bytesToHex(command)).toBe('BF330C5A0A98670000000000214365');
    expect(bytesToHex(build(0x80, new Uint8Array(300)).subarray(0, 4))).toBe('8082012C');
  });
});

/* ------------------------------------------------------------------ models */

describe('models', () => {
  it('parses a profile list', () => {
    const profile =
      tlv('5A', ICCID_ENCODED) +
      tlv('4F', 'A0000005591010FFFFFFFF8900001000') +
      tlv('9F70', '01') +
      tlv('90', utf8('My SIM')) +
      tlv('91', utf8('Nekoko Mobile')) +
      tlv('92', utf8('Data Plan')) +
      tlv('95', '02') +
      tlv('B7', tlv('80', '44F001'));
    const list = parseProfileInfoList(hexToBytes(tlv('BF2D', tlv('A0', tlv('E3', profile)))));
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      iccid: ICCID,
      profileState: 1,
      profileNickname: 'My SIM',
      serviceProviderName: 'Nekoko Mobile',
      profileName: 'Data Plan',
      profileClass: 'operational',
      profileOwnerMccMnc: '44010',
    });
  });

  it('always gives profileOwnerMccMnc a string (MetadataView calls replaceAll on it)', () => {
    const profile = tlv('5A', ICCID_ENCODED) + tlv('9F70', '00');
    const [entry] = parseProfileInfoList(hexToBytes(tlv('BF2D', tlv('A0', tlv('E3', profile)))));
    expect(entry.profileOwnerMccMnc).toBe('');
    expect(entry.profileState).toBe(0);
  });

  it('parses notifications with numeric fields', () => {
    const meta =
      tlv('80', '0005') +
      tlv('81', '0640') +
      tlv('0C', utf8('rsp.example.com')) +
      tlv('5A', ICCID_ENCODED);
    const list = parseNotificationList(hexToBytes(tlv('BF28', tlv('A0', tlv('BF2F', meta)))));
    expect(list).toEqual([
      {
        seqNumber: 5,
        profileManagementOperation: 0x40,
        notificationAddress: 'rsp.example.com',
        iccid: ICCID,
      },
    ]);
  });

  it('parses EUICCInfo2 into the shape the UI reads', () => {
    const body =
      tlv('82', '020202') +
      tlv('81', '020100') +
      tlv('83', '040509') +
      tlv('84', tlv('81', '05') + tlv('82', '0007A120') + tlv('83', '1770')) +
      tlv('0C', utf8('82070045')) +
      tlv('A9', tlv('04', 'AA'.repeat(20))) +
      tlv('AA', tlv('04', 'BB'.repeat(20))) +
      tlv('99', '0640');
    const info = parseEuiccInfo2(hexToBytes(tlv('BF22', body)));
    expect(info.svn).toBe('2.2.2');
    expect(info.profileVersion).toBe('2.1.0');
    expect(info.euiccFirmwareVer).toBe('4.5.9');
    expect(info.sasAcreditationNumber).toBe('82070045');
    expect(info.extCardResource).toEqual({
      installedApplication: 5,
      freeNonVolatileMemory: 500000,
      freeVolatileMemory: 6000,
    });
    expect(info.euiccCiPKIdListForVerification).toEqual(['AA'.repeat(20)]);
    expect(info.euiccCiPKIdListForSigning).toEqual(['BB'.repeat(20)]);
    expect(info.euiccCategory).toBeNull();
  });

  it('parses SM-DP+ profile metadata', () => {
    const hex = tlv(
      'BF25',
      tlv('5A', ICCID_ENCODED) +
        tlv('91', utf8('Nekoko')) +
        tlv('92', utf8('Data')) +
        tlv('95', '02') +
        tlv('B7', tlv('80', '130062')),
    );
    const metadata = parseStoreMetadata(Base64.fromHex(hex));
    expect(metadata.iccid).toBe(ICCID);
    expect(metadata.serviceProviderName).toBe('Nekoko');
    expect(metadata.profileOwnerMccMnc).toBe('310260');
  });

  it('segments a bound profile package per SGP.22 §2.5.5', () => {
    const isc = tlv('BF23', tlv('80', '0102'));
    const a0 = tlv('A0', tlv('87', '0304'));
    const a1 = tlv('A1', tlv('88', '0506') + tlv('88', '0708'));
    const a2 = tlv('A2', tlv('87', '0910'));
    const a3 = tlv('A3', tlv('86', '1112') + tlv('86', '1314'));
    const body = isc + a0 + a1 + a2 + a3;
    const segments = segmentBoundProfilePackage(hexToBytes(tlv('BF36', body))).map((s) => bytesToHex(s));

    expect(segments).toEqual([
      'BF36' + encodeLength(body.length / 2) + isc,
      a0,
      'A108', tlv('88', '0506'), tlv('88', '0708'),
      a2,
      'A308', tlv('86', '1112'), tlv('86', '1314'),
    ]);
  });

  it('reads an installation result', () => {
    const notification =
      tlv('80', '01') + tlv('81', '0780') + tlv('0C', utf8('rsp.example.com')) + tlv('5A', ICCID_ENCODED);
    const ok = tlv(
      'BF37',
      tlv('BF27', tlv('80', 'AABBCCDD') + tlv('BF2F', notification) + tlv('A2', tlv('A0', tlv('4F', '00')))),
    );
    const success = parseInstallationResult(hexToBytes(ok));
    expect(success.success).toBe(true);
    expect(success.notification).toMatchObject({ seqNumber: 1, iccid: ICCID });

    const failed = tlv(
      'BF37',
      tlv('BF27', tlv('A2', tlv('A1', tlv('80', '05') + tlv('81', '0A')))),
    );
    const error = parseInstallationResult(hexToBytes(failed));
    expect(error.success).toBe(false);
    expect(error.bppCommandId).toBe('loadProfileElements');
    expect(error.errorReason).toBe('insufficient memory for profile');
  });
});

/* --------------------------------------------------------------- ES10 wire */

describe('ES10 command layer', () => {
  it('reads the EID through STORE DATA + GET RESPONSE', async () => {
    const eid = '89049032000000000000000000000001';
    const card = new FakeCard(() => tlv('BF3E', tlv('5A', eid)));
    await expect(makeLpa(card).getEid()).resolves.toBe(eid);

    expect(card.commands).toEqual(['BF3E035C015A']);
    expect(card.raw[0]).toBe('81E2910006BF3E035C015A');
    expect(card.raw[1]).toBe('81C0000015');
  });

  it('chains STORE DATA blocks with an incrementing P2', async () => {
    const card = new FakeCard(() => undefined);
    const lpa = makeLpa(card, jest.fn(), 16);
    await lpa.sendCommand(new Uint8Array(40).fill(0x5a));

    expect(card.raw[0].substring(0, 10)).toBe('81E2110010');
    expect(card.raw[1].substring(0, 10)).toBe('81E2110110');
    expect(card.raw[2].substring(0, 10)).toBe('81E2910208');
  });

  it('reassembles a response longer than 255 bytes', async () => {
    const profile = tlv('5A', ICCID_ENCODED) + tlv('92', utf8('x'.repeat(300)));
    const response = tlv('BF2D', tlv('A0', tlv('E3', profile)));
    const card = new FakeCard(() => response);
    const profiles = await makeLpa(card).getProfiles();

    expect(profiles[0].profileName).toHaveLength(300);
    expect(card.raw.filter((a) => a.startsWith('81C0')).length).toBeGreaterThan(1);
  });

  it('builds enable/disable/delete/nickname commands', async () => {
    const card = new FakeCard((command) => tlv(command.substring(0, 4), tlv('80', '00')));
    const lpa = makeLpa(card);

    await lpa.enableProfile(ICCID, false);
    await lpa.disableProfile(ICCID, true);
    await lpa.deleteProfile(ICCID);
    await lpa.setNickname(ICCID, 'AB');

    expect(card.commands).toEqual([
      'BF3111A00C5A0A98670000000000214365810100',
      'BF3211A00C5A0A986700000000002143658101FF',
      'BF330C5A0A98670000000000214365',
      'BF2910' + '5A0A98670000000000214365' + '90024142',
    ]);
  });

  it('surfaces a non-zero profile result code', async () => {
    const card = new FakeCard(() => tlv('BF31', tlv('80', '03')));
    await expect(makeLpa(card).enableProfile(ICCID, false)).rejects.toThrow(/disallowed by policy/);
  });

  it('reports a bad status word', async () => {
    const card = new FakeCard(() => undefined);
    (card as any).transmit = async () => '6a82';
    await expect(makeLpa(card).getEid()).rejects.toThrow(/File not found/);
  });
});

/* ------------------------------------------------------- lpac-compatible API */

describe('LpaDispatcher', () => {
  const eid = '89049032000000000000000000000001';

  const euiccInfo2 = tlv(
    'BF22',
    tlv('82', '020202') + tlv('84', tlv('81', '05') + tlv('82', '0007A120') + tlv('83', '1770')),
  );

  const buildCard = (overrides: { [prefix: string]: string | undefined } = {}) =>
    new FakeCard((command) => {
      const tag = command.substring(0, 4);
      if (Object.prototype.hasOwnProperty.call(overrides, tag)) {
        return overrides[tag];
      }
      switch (tag) {
        case 'BF3E': return tlv('BF3E', tlv('5A', eid));
        case 'BF22': return euiccInfo2;
        case 'BF3C': return tlv('BF3C', tlv('80', utf8('rsp.example.com')) + tlv('81', utf8('lpa.ds.gsma.com')));
        case 'BF2D': return tlv('BF2D', tlv('A0', tlv('E3', tlv('5A', ICCID_ENCODED) + tlv('9F70', '01'))));
        case 'BF28': return tlv('BF28', tlv('A0', ''));
        case 'BF30': return tlv('BF30', tlv('80', '00'));
        default: return undefined;
      }
    });

  it('answers get_eid and get_euicc_info in lpac shape', async () => {
    const bridge = new LpaDispatcher({ transmit: buildCard().transmit, http: jest.fn(), maxSegment: 64 });

    await expect(bridge.execute('get_eid', [])).resolves.toEqual({ eid });

    const info = await bridge.execute('get_euicc_info', []);
    expect(info.eidValue).toBe(eid);
    expect(info.EUICCInfo2.svn).toBe('2.2.2');
    expect(info.EUICCInfo2.extCardResource.freeNonVolatileMemory).toBe(500000);
    expect(info.EuiccConfiguredAddresses).toEqual({
      defaultDpAddress: 'rsp.example.com',
      rootDsAddress: 'lpa.ds.gsma.com',
    });
  });

  it('maps enable/disable refresh flags from the string arguments', async () => {
    const card = buildCard({ BF31: tlv('BF31', tlv('80', '00')), BF32: tlv('BF32', tlv('80', '00')) });
    const bridge = new LpaDispatcher({ transmit: card.transmit, http: jest.fn(), maxSegment: 64 });

    await expect(bridge.execute('enable_profile', [ICCID, '0'])).resolves.toEqual({ result: 0 });
    await expect(bridge.execute('disable_profile', [ICCID, '1'])).resolves.toEqual({ result: 0 });

    expect(card.commands[0].endsWith('810100')).toBe(true);
    expect(card.commands[1].endsWith('8101FF')).toBe(true);
  });

  /** A scripted SM-DP+ that walks the full ES9+ download exchange. */
  const makeServer = (options: { ccRequired?: boolean } = {}) => {
    const calls: { url: string; body: any }[] = [];
    const smdpSigned2 = Base64.fromHex(
      tlv('30', tlv('80', 'AABBCCDD') + tlv('01', options.ccRequired ? 'FF' : '00')),
    );
    const http = jest.fn(async (url: string, body: string) => {
      calls.push({ url, body: JSON.parse(body) });
      const ok = { header: { functionExecutionStatus: { status: 'Executed-Success' } } };
      if (url.endsWith('initiateAuthentication')) {
        return JSON.stringify({
          ...ok,
          transactionId: 'AABBCCDD',
          serverSigned1: Base64.fromHex(tlv('30', tlv('80', 'AABBCCDD'))),
          serverSignature1: Base64.fromHex(tlv('5F37', '00')),
          euiccCiPKIdToBeUsed: Base64.fromHex(tlv('04', 'AA'.repeat(20))),
          serverCertificate: Base64.fromHex(tlv('30', tlv('02', '01'))),
        });
      }
      if (url.endsWith('es9plus/authenticateClient') && url.includes('lpa.ds.gsma.com')) {
        // an SM-DS answers the same endpoint with event entries, not a profile
        return JSON.stringify({
          ...ok,
          eventEntries: [
            {eventId: 'evt-1', rspServerAddress: 'rsp.one.example'},
            {eventId: 'evt-2', rspServerAddress: 'rsp.two.example'},
          ],
        });
      }
      if (url.endsWith('es9plus/authenticateClient')) {
        return JSON.stringify({
          ...ok,
          transactionId: 'AABBCCDD',
          profileMetadata: Base64.fromHex(
            tlv('BF25', tlv('5A', ICCID_ENCODED) + tlv('91', utf8('Nekoko')) + tlv('92', utf8('Data'))),
          ),
          smdpSigned2,
          smdpSignature2: Base64.fromHex(tlv('5F37', '00')),
          smdpCertificate: Base64.fromHex(tlv('30', tlv('02', '01'))),
        });
      }
      if (url.endsWith('getBoundProfilePackage')) {
        return JSON.stringify({
          ...ok,
          boundProfilePackage: Base64.fromHex(
            tlv('BF36', tlv('BF23', tlv('80', '0102')) + tlv('A0', tlv('87', '0304'))),
          ),
        });
      }
      return JSON.stringify(ok);
    });
    return { http, calls };
  };

  const installResult = tlv(
    'BF37',
    tlv(
      'BF27',
      tlv('80', 'AABBCCDD') +
        tlv('BF2F', tlv('80', '01') + tlv('81', '0780') + tlv('0C', utf8('rsp.example.com')) + tlv('5A', ICCID_ENCODED)) +
        tlv('A2', tlv('A0', tlv('4F', '00'))),
    ),
  );

  it('runs authenticate_profile then download_profile end to end', async () => {
    let bppSegments = 0;
    const card = new FakeCard((command) => {
      const tag = command.substring(0, 4);
      switch (tag) {
        case 'BF3E': return tlv('BF3E', tlv('5A', eid));
        case 'BF2E': return tlv('BF2E', tlv('80', '00112233445566778899AABBCCDDEEFF'));
        case 'BF20': return tlv('BF20', tlv('82', '020202'));
        case 'BF38': return tlv('BF38', tlv('A0', tlv('5F37', '00')));
        case 'BF21': return tlv('BF21', tlv('A0', tlv('5F37', '00')));
        case 'BF22': return euiccInfo2;
        case 'BF30': return tlv('BF30', tlv('80', '00'));
        case 'BF36': // BPP header segment
          bppSegments++;
          return undefined;
        case 'A004': // final BPP segment
          bppSegments++;
          return installResult;
        default: return undefined;
      }
    });

    const { http, calls } = makeServer();
    const progress: string[] = [];
    const bridge = new LpaDispatcher({
      transmit: card.transmit,
      http,
      maxSegment: 64,
      onProgress: (message) => progress.push(message),
    });

    const auth = await bridge.execute('authenticate_profile', [
      'rsp.example.com',
      'QR-G-5C-1LS',
      '356303455555555',
    ]);

    expect(auth.success).toBe(true);
    expect(auth.isCcRequired).toBe(false);
    expect(auth.profile).toMatchObject({ iccid: ICCID, serviceProviderName: 'Nekoko' });
    expect(auth.profileMetadata).toBe(auth.profile);
    expect(auth._internal).toBeTruthy();

    // the matching id and the device info reach the card inside ctxParams1.
    // TS 23.003 GSM-BCD: 356303455555555 -> 53363054555555F5, TAC = first 4 bytes
    const authenticateServer = card.commands.find((c) => c.startsWith('BF38'))!;
    expect(authenticateServer).toContain(utf8('QR-G-5C-1LS'));
    expect(authenticateServer).toContain('8004' + '53363054');
    expect(authenticateServer).toContain('8208' + '53363054555555F5');

    const download = await bridge.execute('download_profile', [auth._internal, '']);
    expect(download.success).toBe(true);
    expect(bppSegments).toBe(2);

    expect(calls.map((c) => c.url)).toEqual([
      'https://rsp.example.com/gsma/rsp2/es9plus/initiateAuthentication',
      'https://rsp.example.com/gsma/rsp2/es9plus/authenticateClient',
      'https://rsp.example.com/gsma/rsp2/es9plus/getBoundProfilePackage',
      'https://rsp.example.com/gsma/rsp2/es9plus/handleNotification',
    ]);

    // the install notification is acknowledged and then dropped from the card
    expect(card.commands.some((c) => c.startsWith('BF30'))).toBe(true);

    expect(progress).toEqual(
      expect.arrayContaining([
        'download.step1.es10b_get_euicc_challenge_and_info',
        'download.step2.es9p_initiate_authentication',
        'download.step3.es10b_authenticate_server',
        'download.step4.es9p_authenticate_client',
        'download.step5.es10b_prepare_download',
        'download.step6.es9p_get_bound_profile_package',
        'download.step7.es10b_load_bound_profile_package',
        'download.step8.load_bpp',
        'download.step9.finalize',
      ]),
    );
  });

  it('hashes the confirmation code into PrepareDownload', async () => {
    const card = new FakeCard((command) => {
      const tag = command.substring(0, 4);
      switch (tag) {
        case 'BF2E': return tlv('BF2E', tlv('80', '00'));
        case 'BF20': return tlv('BF20', tlv('82', '020202'));
        case 'BF38': return tlv('BF38', tlv('A0', tlv('5F37', '00')));
        case 'BF21': return tlv('BF21', tlv('A0', tlv('5F37', '00')));
        default: return undefined;
      }
    });
    const { http } = makeServer({ ccRequired: true });
    const bridge = new LpaDispatcher({ transmit: card.transmit, http, maxSegment: 64 });

    const auth = await bridge.execute('authenticate_profile', ['rsp.example.com', 'MATCH', '']);
    expect(auth.isCcRequired).toBe(true);

    await bridge.execute('download_profile', [auth._internal, 'secret']);

    // hashCc = SHA256( SHA256(cc) || transactionId ), carried in tag '04'
    const expected = sha256Hex(hexToBytes(sha256Hex('secret') + 'AABBCCDD'));
    const prepare = card.commands.find((c) => c.startsWith('BF21'))!;
    expect(prepare).toContain('0420' + expected);
  });

  it('refuses to download when a confirmation code is required but missing', async () => {
    const card = new FakeCard((command) => {
      switch (command.substring(0, 4)) {
        case 'BF2E': return tlv('BF2E', tlv('80', '00'));
        case 'BF20': return tlv('BF20', tlv('82', '020202'));
        case 'BF38': return tlv('BF38', tlv('A0', tlv('5F37', '00')));
        default: return undefined;
      }
    });
    const { http } = makeServer({ ccRequired: true });
    const bridge = new LpaDispatcher({ transmit: card.transmit, http, maxSegment: 64 });

    const auth = await bridge.execute('authenticate_profile', ['rsp.example.com', 'MATCH', '']);
    const result = await bridge.execute('download_profile', [auth._internal, '']);
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/confirmation code/i);
  });

  it('flattens an SM-DP+ error so RemoteErrorView can render it', async () => {
    const card = new FakeCard((command) =>
      command.startsWith('BF2E') ? tlv('BF2E', tlv('80', '00')) : tlv('BF20', tlv('82', '020202')),
    );
    const http = jest.fn(async () =>
      JSON.stringify({
        header: {
          functionExecutionStatus: {
            status: 'Failed',
            statusCodeData: {
              subjectCode: '8.2.6',
              reasonCode: '3.8',
              message: 'The Profile is not in the expected state',
            },
          },
        },
      }),
    );
    const bridge = new LpaDispatcher({ transmit: card.transmit, http, maxSegment: 64 });

    const result = await bridge.execute('authenticate_profile', ['rsp.example.com', 'MATCH', '']);
    expect(result).toMatchObject({
      success: false,
      status: 'Failed',
      reasonCode: '3.8',
      subjectCode: '8.2.6',
      message: 'The Profile is not in the expected state',
    });
  });

  it('discovers SM-DP+ addresses over ES11', async () => {
    const card = new FakeCard((command) => {
      switch (command.substring(0, 4)) {
        case 'BF2E': return tlv('BF2E', tlv('80', '00'));
        case 'BF20': return tlv('BF20', tlv('82', '020202'));
        case 'BF38': return tlv('BF38', tlv('A0', tlv('5F37', '00')));
        default: return undefined;
      }
    });
    const { http, calls } = makeServer();
    const bridge = new LpaDispatcher({ transmit: card.transmit, http, maxSegment: 64 });

    const result = await bridge.execute('discover_profile', ['lpa.ds.gsma.com', '356303455555555']);
    expect(result).toEqual({ success: true, smdp_list: ['rsp.one.example', 'rsp.two.example'] });
    // ES11.AuthenticateClient lives on the ES9+ path; GSMA's root DS 404s on /es11/
    expect(calls[1].url).toBe('https://lpa.ds.gsma.com/gsma/rsp2/es9plus/authenticateClient');
  });

  it('strips whitespace out of an SM-DP+ address', async () => {
    const card = new FakeCard((command) =>
      command.startsWith('BF2E') ? tlv('BF2E', tlv('80', '00')) : tlv('BF20', tlv('82', '020202')),
    );
    const { http, calls } = makeServer();
    const bridge = new LpaDispatcher({ transmit: card.transmit, http, maxSegment: 64 });

    await bridge.execute('authenticate_profile', ['https://rsp. example.com/ ', 'MATCH', '']);
    expect(calls[0].url).toBe('https://rsp.example.com/gsma/rsp2/es9plus/initiateAuthentication');
  });

  it('sends and removes notifications by mask', async () => {
    const notification = (seq: string, op: string) =>
      tlv('BF2F', tlv('80', seq) + tlv('81', op) + tlv('0C', utf8('rsp.example.com')) + tlv('5A', ICCID_ENCODED));

    const removed: string[] = [];
    const card = new FakeCard((command) => {
      const tag = command.substring(0, 4);
      if (tag === 'BF28') {
        return tlv('BF28', tlv('A0', notification('01', '0780') + notification('02', '0410')));
      }
      if (tag === 'BF2B') {
        return tlv('BF2B', tlv('A0', tlv('BF37', tlv('BF27', notification('01', '0780')))));
      }
      if (tag === 'BF30') {
        removed.push(command);
        return tlv('BF30', tlv('80', '00'));
      }
      return undefined;
    });
    const { http, calls } = makeServer();
    const bridge = new LpaDispatcher({ transmit: card.transmit, http, maxSegment: 64 });

    // install notifications only, and keep them on the card
    await bridge.execute('process_notifications', [ICCID, 0x80, 0]);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://rsp.example.com/gsma/rsp2/es9plus/handleNotification');
    expect(removed).toHaveLength(0);

    // delete notifications, and remove them afterwards
    await bridge.execute('process_notifications', [ICCID, 0x10, 1]);
    expect(removed).toHaveLength(1);
  });

  it('falls back to a fixed TAC and omits the imei when none is given', async () => {
    const card = new FakeCard((command) => {
      switch (command.substring(0, 4)) {
        case 'BF2E': return tlv('BF2E', tlv('80', '00'));
        case 'BF20': return tlv('BF20', tlv('82', '020202'));
        case 'BF38': return tlv('BF38', tlv('A0', tlv('5F37', '00')));
        default: return undefined;
      }
    });
    const { http } = makeServer();
    const bridge = new LpaDispatcher({ transmit: card.transmit, http, maxSegment: 64 });

    await bridge.execute('authenticate_profile', ['rsp.example.com', 'MATCH', '']);
    const authenticateServer = card.commands.find((c) => c.startsWith('BF38'))!;
    expect(authenticateServer).toContain('800435290611');
    expect(authenticateServer).not.toContain('8208');
  });

  it('treats an empty ES9+ body as success (HandleNotification has no response)', async () => {
    const card = new FakeCard((command) => {
      switch (command.substring(0, 4)) {
        case 'BF28':
          return tlv(
            'BF28',
            tlv('A0', tlv('BF2F', tlv('80', '01') + tlv('81', '0780') + tlv('0C', utf8('rsp.example.com')) + tlv('5A', ICCID_ENCODED))),
          );
        case 'BF2B':
          return tlv('BF2B', tlv('A0', tlv('BF37', tlv('BF27', tlv('BF2F', tlv('80', '01') + tlv('0C', utf8('rsp.example.com')))))));
        default:
          return undefined;
      }
    });
    // a 204 No Content comes back as an empty string
    const http = jest.fn(async () => '');
    const bridge = new LpaDispatcher({ transmit: card.transmit, http, maxSegment: 64 });

    await expect(bridge.execute('process_notification_single', [1])).resolves.toEqual({ result: 0 });
    expect(http).toHaveBeenCalledTimes(1);
  });

  it('still reports a failed install to the SM-DP+', async () => {
    const failedInstall = tlv(
      'BF37',
      tlv(
        'BF27',
        tlv('BF2F', tlv('80', '07') + tlv('81', '0780') + tlv('0C', utf8('rsp.example.com')) + tlv('5A', ICCID_ENCODED)) +
          tlv('A2', tlv('A1', tlv('80', '05') + tlv('81', '0A'))),
      ),
    );
    const card = new FakeCard((command) => {
      switch (command.substring(0, 4)) {
        case 'BF2E': return tlv('BF2E', tlv('80', '00'));
        case 'BF20': return tlv('BF20', tlv('82', '020202'));
        case 'BF38': return tlv('BF38', tlv('A0', tlv('5F37', '00')));
        case 'BF21': return tlv('BF21', tlv('A0', tlv('5F37', '00')));
        case 'BF22': return euiccInfo2;
        case 'BF30': return tlv('BF30', tlv('80', '00'));
        case 'A004': return failedInstall;
        default: return undefined;
      }
    });
    const { http, calls } = makeServer();
    const bridge = new LpaDispatcher({ transmit: card.transmit, http, maxSegment: 64 });

    const auth = await bridge.execute('authenticate_profile', ['rsp.example.com', 'MATCH', '']);
    const result = await bridge.execute('download_profile', [auth._internal, '']);

    expect(result.success).toBe(false);
    expect(result.message).toContain('insufficient memory for profile');
    expect(calls.map((c) => c.url)).toContain(
      'https://rsp.example.com/gsma/rsp2/es9plus/handleNotification',
    );
  });

  it('cancels a session with endUserRejection and tells the SM-DP+', async () => {
    const card = new FakeCard((command) => {
      switch (command.substring(0, 4)) {
        case 'BF2E': return tlv('BF2E', tlv('80', '00'));
        case 'BF20': return tlv('BF20', tlv('82', '020202'));
        case 'BF38': return tlv('BF38', tlv('A0', tlv('5F37', '00')));
        case 'BF41': return tlv('BF41', tlv('A0', tlv('80', 'AABBCCDD')));
        default: return undefined;
      }
    });
    const { http, calls } = makeServer();
    const bridge = new LpaDispatcher({ transmit: card.transmit, http, maxSegment: 64 });

    const auth = await bridge.execute('authenticate_profile', ['rsp.example.com', 'MATCH', '']);
    await expect(bridge.execute('cancel_download', [auth._internal])).resolves.toEqual({ result: 0 });

    const cancel = card.commands.find((c) => c.startsWith('BF41'))!;
    expect(cancel).toBe('BF4109' + '8004AABBCCDD' + '810100');
    expect(calls[calls.length - 1].url).toBe('https://rsp.example.com/gsma/rsp2/es9plus/cancelSession');
  });

  it('rejects an unknown function', async () => {
    const bridge = new LpaDispatcher({ transmit: buildCard().transmit, http: jest.fn() });
    await expect(bridge.execute('not_a_function', [])).rejects.toThrow(/Unsupported LPA function/);
  });
});
