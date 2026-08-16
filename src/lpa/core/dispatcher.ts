/**
 * lpac-compatible command dispatcher.
 *
 * `Adapter.execute(fn, args)` used to ccall into the emscripten build of lpac;
 * it now calls {@link LpaDispatcher.execute}, which keeps the same function names,
 * argument order and JSON result shapes so no screen had to change.
 */

import { Lpa, DownloadSession, Transmit, Http, ProgressCallback } from './lpa';
import { RemoteError, RemoteErrorException } from './errors';
import { NotificationMetadata, ProfileMetadata } from './models';

export interface DispatcherOptions {
  transmit: Transmit;
  http: Http;
  channel?: number;
  maxSegment?: number;
  onProgress?: ProgressCallback;
}

/** Flattened so <RemoteErrorView remoteError={result} /> keeps working. */
function failure(error: unknown): any {
  if (error instanceof RemoteErrorException) {
    return { success: false, ...error.remoteError, remoteError: error.remoteError };
  }
  const message = error instanceof Error ? error.message : String(error);
  const remoteError: RemoteError = {
    status: 'Failed',
    message,
    reasonCode: '',
    subjectCode: '',
  };
  return { success: false, ...remoteError, remoteError };
}

export class LpaDispatcher {
  private readonly lpa: Lpa;
  private readonly sessions: { [key: string]: DownloadSession } = {};
  private sessionCounter = 0;

  constructor(options: DispatcherOptions) {
    this.lpa = new Lpa(options);
  }

  setChannel(channel: number): void {
    this.lpa.setChannel(channel);
  }

  setMaxSegment(size: number): void {
    this.lpa.setMaxSegment(size);
  }

  private storeSession(session: DownloadSession): string {
    const key = `session-${++this.sessionCounter}`;
    this.sessions[key] = session;
    return key;
  }

  private takeSession(key: string): DownloadSession {
    const session = this.sessions[key];
    if (!session) {
      throw new Error('Download session expired, please scan again');
    }
    return session;
  }

  /**
   * Send every pending notification whose operation matches `mask`, optionally
   * removing it afterwards. `iccid` empty means "all profiles".
   */
  private async processNotifications(iccid: string, mask: number, remove: boolean): Promise<void> {
    const all = await this.lpa.listNotifications();
    const wanted = all
      .filter(
        (n: NotificationMetadata) =>
          (n.profileManagementOperation & mask) !== 0 && (!iccid || n.iccid === iccid),
      )
      // SGP.22 §3.5: notifications are delivered in sequence-number order
      .sort((a: NotificationMetadata, b: NotificationMetadata) => a.seqNumber - b.seqNumber);
    for (const meta of wanted) {
      try {
        const pending = await this.lpa.retrieveNotification(meta.seqNumber);
        if (!pending) {
          continue;
        }
        await this.lpa.sendNotification(pending);
        if (remove) {
          await this.lpa.removeNotification(meta.seqNumber);
        }
      } catch (e) {
        // a server that refuses one notification must not block the others
      }
    }
  }

  async execute(fn: string, args: any[]): Promise<any> {
    switch (fn) {
      case 'set_apdu_mtu': {
        this.lpa.setMaxSegment(Number(args[0]));
        return { result: 0 };
      }

      case 'get_eid': {
        return { eid: await this.lpa.getEid() };
      }

      case 'get_euicc_info': {
        const eidValue = await this.lpa.getEid();
        const EUICCInfo2 = await this.lpa.getEuiccInfo2();
        const EuiccConfiguredAddresses = await this.lpa.getConfiguredAddresses();
        return { eidValue, EUICCInfo2, EuiccConfiguredAddresses };
      }

      case 'get_profiles': {
        return this.lpa.getProfiles();
      }

      case 'get_notifications': {
        return this.lpa.listNotifications();
      }

      case 'enable_profile': {
        await this.lpa.enableProfile(String(args[0]), String(args[1]) === '1');
        return { result: 0 };
      }

      case 'disable_profile': {
        await this.lpa.disableProfile(String(args[0]), String(args[1]) === '1');
        return { result: 0 };
      }

      case 'delete_profile': {
        await this.lpa.deleteProfile(String(args[0]));
        return { result: 0 };
      }

      case 'rename_profile': {
        await this.lpa.setNickname(String(args[0]), String(args[1]));
        return { result: 0 };
      }

      case 'delete_notification_single': {
        await this.lpa.removeNotification(Number(args[0]));
        return { result: 0 };
      }

      case 'process_notification_single': {
        try {
          const pending = await this.lpa.retrieveNotification(Number(args[0]));
          if (!pending) {
            return { result: -1 };
          }
          await this.lpa.sendNotification(pending);
          return { result: 0 };
        } catch (e) {
          return { result: -1, ...failure(e) };
        }
      }

      case 'process_notifications': {
        await this.processNotifications(String(args[0] || ''), Number(args[1]), Number(args[2]) === 1);
        return { result: 0 };
      }

      case 'authenticate_profile': {
        try {
          const session = await this.lpa.authenticate(String(args[0]), String(args[1] || ''), String(args[2] || ''));
          const profile: ProfileMetadata = session.profile;
          return {
            success: true,
            isCcRequired: session.isCcRequired,
            profile,
            profileMetadata: profile,
            _internal: this.storeSession(session),
          };
        } catch (e) {
          return failure(e);
        }
      }

      case 'discover_profile': {
        try {
          const smdp_list = await this.lpa.discover(
            String(args[0] || 'lpa.ds.gsma.com'),
            String(args[1] || ''),
          );
          return { success: true, smdp_list };
        } catch (e) {
          return { ...failure(e), smdp_list: [] };
        }
      }

      case 'download_profile': {
        try {
          const key = String(args[0]);
          const session = this.takeSession(key);
          const result = await this.lpa.downloadProfile(session, String(args[1] || ''));
          if (!result.success) {
            return {
              success: false,
              status: 'Failed',
              message: result.errorReason
                ? `${result.bppCommandId}: ${result.errorReason}`
                : 'Profile installation failed',
              reasonCode: '',
              subjectCode: '',
            };
          }
          delete this.sessions[key];
          return { success: true };
        } catch (e) {
          return failure(e);
        }
      }

      case 'cancel_download': {
        try {
          const key = String(args[0]);
          const session = this.takeSession(key);
          await this.lpa.cancelSession(session);
          delete this.sessions[key];
          return { result: 0 };
        } catch (e) {
          return { result: -1, ...failure(e) };
        }
      }

      default:
        throw new Error(`Unsupported LPA function: ${fn}`);
    }
  }
}
