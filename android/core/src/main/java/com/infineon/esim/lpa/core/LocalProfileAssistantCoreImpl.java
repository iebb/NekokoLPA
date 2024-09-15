/*
 * THE SOURCE CODE AND ITS RELATED DOCUMENTATION IS PROVIDED "AS IS". INFINEON
 * TECHNOLOGIES MAKES NO OTHER WARRANTY OF ANY KIND,WHETHER EXPRESS,IMPLIED OR,
 * STATUTORY AND DISCLAIMS ANY AND ALL IMPLIED WARRANTIES OF MERCHANTABILITY,
 * SATISFACTORY QUALITY, NON INFRINGEMENT AND FITNESS FOR A PARTICULAR PURPOSE.
 *
 * THE SOURCE CODE AND DOCUMENTATION MAY INCLUDE ERRORS. INFINEON TECHNOLOGIES
 * RESERVES THE RIGHT TO INCORPORATE MODIFICATIONS TO THE SOURCE CODE IN LATER
 * REVISIONS OF IT, AND TO MAKE IMPROVEMENTS OR CHANGES IN THE DOCUMENTATION OR
 * THE PRODUCTS OR TECHNOLOGIES DESCRIBED THEREIN AT ANY TIME.
 *
 * INFINEON TECHNOLOGIES SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT OR
 * CONSEQUENTIAL DAMAGE OR LIABILITY ARISING FROM YOUR USE OF THE SOURCE CODE OR
 * ANY DOCUMENTATION, INCLUDING BUT NOT LIMITED TO, LOST REVENUES, DATA OR
 * PROFITS, DAMAGES OF ANY SPECIAL, INCIDENTAL OR CONSEQUENTIAL NATURE, PUNITIVE
 * DAMAGES, LOSS OF PROPERTY OR LOSS OF PROFITS ARISING OUT OF OR IN CONNECTION
 * WITH THIS AGREEMENT, OR BEING UNUSABLE, EVEN IF ADVISED OF THE POSSIBILITY OR
 * PROBABILITY OF SUCH DAMAGES AND WHETHER A CLAIM FOR SUCH DAMAGE IS BASED UPON
 * WARRANTY, CONTRACT, TORT, NEGLIGENCE OR OTHERWISE.
 *
 * (C)Copyright INFINEON TECHNOLOGIES All rights reserved
 */

package com.infineon.esim.lpa.core;

import com.gsma.sgp.messages.rspdefinitions.EUICCInfo1;
import com.infineon.esim.lpa.core.dtos.ActivationCode;
import com.infineon.esim.lpa.core.dtos.DeviceInformation;
import com.infineon.esim.lpa.core.dtos.EuiccInfo;
import com.infineon.esim.lpa.core.dtos.ProfileDownloadSession;
import com.infineon.esim.lpa.core.dtos.profile.ProfileMetadata;
import com.infineon.esim.lpa.core.dtos.result.local.ClearNotificationsResult;
import com.infineon.esim.lpa.core.dtos.result.local.DeleteResult;
import com.infineon.esim.lpa.core.dtos.result.local.DisableResult;
import com.infineon.esim.lpa.core.dtos.result.local.EnableResult;
import com.infineon.esim.lpa.core.dtos.result.local.SetNicknameResult;
import com.infineon.esim.lpa.core.dtos.result.remote.AuthenticateResult;
import com.infineon.esim.lpa.core.dtos.result.remote.CancelSessionResult;
import com.infineon.esim.lpa.core.dtos.result.remote.DownloadResult;
import com.infineon.esim.lpa.core.dtos.result.remote.HandleNotificationsResult;
import com.infineon.esim.lpa.core.dtos.result.remote.RemoteError;
import com.infineon.esim.lpa.core.es10.Es10Interface;
import com.infineon.esim.lpa.core.es10.EuiccChannel;
import com.infineon.esim.lpa.core.es9plus.Es9PlusInterface;
import com.infineon.esim.lpa.core.worker.local.ClearAllNotificationsWorker;
import com.infineon.esim.lpa.core.worker.local.DeleteProfileWorker;
import com.infineon.esim.lpa.core.worker.local.DisableProfileWorker;
import com.infineon.esim.lpa.core.worker.local.EnableProfileWorker;
import com.infineon.esim.lpa.core.worker.local.GetEidWorker;
import com.infineon.esim.lpa.core.worker.local.GetEuiccInfo1Worker_M;
import com.infineon.esim.lpa.core.worker.local.GetEuiccInfo2Worker;
import com.infineon.esim.lpa.core.worker.local.ListProfilesWorker;
import com.infineon.esim.lpa.core.worker.local.SetNicknameWorker;
import com.infineon.esim.lpa.core.worker.remote.AuthenticateWorker;
import com.infineon.esim.lpa.core.worker.remote.CancelSessionWorker;
import com.infineon.esim.lpa.core.worker.remote.DownloadProfileWorker;
import com.infineon.esim.lpa.core.worker.remote.HandleNotificationsWorker;
import com.infineon.esim.util.Log;

import java.util.List;

public class LocalProfileAssistantCoreImpl implements LocalProfileAssistantCore {
    private static final String TAG = LocalProfileAssistantCoreImpl.class.getName();

    private ProfileDownloadSession profileDownloadSession = null;

    public Es10Interface es10Interface;
    public Es9PlusInterface es9PlusInterface;

    public LocalProfileAssistantCoreImpl() {
    }

    public void setEuiccChannel(EuiccChannel euiccChannel) {
        this.es10Interface = new Es10Interface(euiccChannel);
    }

    public void enableEs9PlusInterface() {
        this.es9PlusInterface = new Es9PlusInterface();
    }

    public void disableEs9PlusInterface() {
        this.es9PlusInterface = null;
    }

    // Local functions

    @Override
    public EnableResult enableProfile(String iccid, boolean refreshFlag) throws Exception {
        int result = new EnableProfileWorker(es10Interface).enable(iccid, refreshFlag);

        return new EnableResult(result);
    }

    @Override
    public DisableResult disableProfile(String iccid) throws Exception {
        int result = new DisableProfileWorker(es10Interface).disable(iccid);

        return new DisableResult(result);
    }

    @Override
    public DeleteResult deleteProfile(String iccid) throws Exception {
        int result = new DeleteProfileWorker(es10Interface).delete(iccid);

        return new DeleteResult(result);
    }

    @Override
    public SetNicknameResult setNickname(String iccid, String nicknameNew) throws Exception {
        int result = new SetNicknameWorker(es10Interface).setNickname(iccid,nicknameNew);

        return new SetNicknameResult(result);
    }

    @Override
    public List<ProfileMetadata> getProfiles() throws Exception {
        return new ListProfilesWorker(es10Interface).listProfiles();
    }

    @Override
    public String getEID() throws Exception {
        return new GetEidWorker(es10Interface).getEid();
    }

    @Override
    public EuiccInfo getEuiccInfo2() throws Exception {
        return new GetEuiccInfo2Worker(es10Interface).getEuiccInfo2();
    }

    public EUICCInfo1 getEuiccInfo1() throws Exception {
        return new GetEuiccInfo1Worker_M(es10Interface).getEuiccInfo1();
    }

    // Remote functions

    @Override
    public AuthenticateResult authenticate(ActivationCode activationCode) throws Exception {
        if(isEs9PlusInterfaceUnavailable()) {
            Log.error(TAG, "ES9+ interface is not available! Enable internet connection?");
            throw new Exception("ES9+ interface is not available! Enable internet connection?");
        }

        profileDownloadSession = new ProfileDownloadSession(activationCode, es10Interface, es9PlusInterface);

        boolean success = new AuthenticateWorker(profileDownloadSession).authenticate();

        if(success) {
            ProfileMetadata profileMetadata =  new ProfileMetadata(profileDownloadSession.getProfileMetaData());
            return new AuthenticateResult(profileDownloadSession.isCcRequired(), profileMetadata);
        } else {
            return new AuthenticateResult(getLastEs9PlusError());
        }
    }

    @Override
    public DownloadResult downloadProfile(String confirmationCode) throws Exception {
        if(isEs9PlusInterfaceUnavailable()) {
            Log.error(TAG, "ES9+ interface is not available! Enable internet connection?");
            throw new Exception("ES9+ interface is not available! Enable internet connection?");
        }

        boolean success = new DownloadProfileWorker(profileDownloadSession).downloadProfile(confirmationCode);

        if(success) {
            return new DownloadResult();
        } else {
            return new DownloadResult(getLastEs9PlusError());
        }
    }

    @Override
    public CancelSessionResult cancelSession(long cancelSessionReasonValue) throws Exception {
        if(isEs9PlusInterfaceUnavailable()) {
            Log.error(TAG, "ES9+ interface is not available! Enable internet connection?");
            throw new Exception("ES9+ interface is not available! Enable internet connection?");
        }

        if (profileDownloadSession != null) {
            boolean success = new CancelSessionWorker(profileDownloadSession).cancelSession(cancelSessionReasonValue);

            if(success) {
                return new CancelSessionResult();
            } else {
                return new CancelSessionResult(getLastEs9PlusError());
            }
        }

        return new CancelSessionResult("Error: no profile download session active that can be cancelled.");
    }

    @Override
    public HandleNotificationsResult handleNotifications() throws Exception {
        if(isEs9PlusInterfaceUnavailable()) {
            Log.error(TAG, "ES9+ interface is not available! Enable internet connection?");
            throw new Exception("ES9+ interface is not available! Enable internet connection?");
        }

        boolean success = new HandleNotificationsWorker(es10Interface, es9PlusInterface).handleNotifications();

        if (success) {
            return new HandleNotificationsResult();
        } else {
            return new HandleNotificationsResult(getLastEs9PlusError());
        }
    }

    @Override
    public ClearNotificationsResult clearPendingNotifications() throws Exception {
        Log.debug(TAG,"Now clearing all pending notifications.");
        List<Integer> resultValues = new ClearAllNotificationsWorker(es10Interface).clearAllNotifications();

        return new ClearNotificationsResult(resultValues);
    }

    @Override
    public RemoteError getLastEs9PlusError() {
        return profileDownloadSession.getLastError();
    }


    private boolean isEs9PlusInterfaceUnavailable() {
        return es9PlusInterface == null;
    }
 }
