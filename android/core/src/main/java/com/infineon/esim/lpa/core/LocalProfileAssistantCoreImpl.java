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

import com.beanit.asn1bean.ber.types.BerBoolean;
import com.gsma.sgp.messages.rspdefinitions.DeleteProfileResponse;
import com.gsma.sgp.messages.rspdefinitions.DisableProfileResponse;
import com.gsma.sgp.messages.rspdefinitions.EUICCInfo1;
import com.gsma.sgp.messages.rspdefinitions.EUICCInfo2;
import com.gsma.sgp.messages.rspdefinitions.EnableProfileResponse;
import com.gsma.sgp.messages.rspdefinitions.GetEuiccDataResponse;
import com.gsma.sgp.messages.rspdefinitions.Iccid;
import com.gsma.sgp.messages.rspdefinitions.ProfileInfo;
import com.gsma.sgp.messages.rspdefinitions.ProfileInfoListResponse;
import com.gsma.sgp.messages.rspdefinitions.SetNicknameResponse;
import com.infineon.esim.lpa.core.dtos.ActivationCode;
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
import com.infineon.esim.lpa.core.worker.remote.AuthenticateWorker;
import com.infineon.esim.lpa.core.worker.remote.CancelSessionWorker;
import com.infineon.esim.lpa.core.worker.remote.DownloadProfileWorker;
import com.infineon.esim.lpa.core.worker.remote.HandleNotificationsWorker;
import com.infineon.esim.util.Bytes;
import com.infineon.esim.util.Log;

import java.util.ArrayList;
import java.util.List;

public class LocalProfileAssistantCoreImpl implements LocalProfileAssistantCore {
    private static final String TAG = LocalProfileAssistantCoreImpl.class.getName();

    private ProfileDownloadSession profileDownloadSession = null;

    public Es10Interface es10Interface;
    public Es9PlusInterface es9PlusInterface;

    public LocalProfileAssistantCoreImpl() {
        this.es9PlusInterface = new Es9PlusInterface();
    }

    public void setEuiccChannel(EuiccChannel euiccChannel, String name) {
        this.es10Interface = new Es10Interface(euiccChannel, name);
    }

    // Local functions

    @Override
    public EnableResult enableProfile(String iccidString, boolean refreshFlag) throws Exception {
        Iccid iccid = new Iccid(Bytes.decodeHexString(iccidString));
        EnableProfileResponse enableProfileResponse = es10Interface.es10c_enableProfileByIccid(iccid, new BerBoolean(refreshFlag));
        int result = enableProfileResponse.getEnableResult().intValue();
        if (refreshFlag && result > 0) { // retry?
            enableProfileResponse = es10Interface.es10c_enableProfileByIccid(iccid, new BerBoolean(false));
            result = enableProfileResponse.getEnableResult().intValue();
        }
        return new EnableResult(result);
    }

    @Override
    public DisableResult disableProfile(String iccidString) throws Exception {
        Iccid iccid = new Iccid(Bytes.decodeHexString(iccidString));
        BerBoolean refreshFlag = new BerBoolean(true);
        DisableProfileResponse disableProfileResponse = es10Interface.es10c_disableProfileByIccid(iccid,refreshFlag);
        return new DisableResult(disableProfileResponse.getDisableResult().intValue());
    }

    @Override
    public DeleteResult deleteProfile(String iccidString) throws Exception {
        Iccid iccid = new Iccid(Bytes.decodeHexString(iccidString));
        DeleteProfileResponse deleteProfileResponse = es10Interface.es10c_deleteProfileByIccid(iccid);
        return new DeleteResult(deleteProfileResponse.getDeleteResult().intValue());
    }

    @Override
    public SetNicknameResult setNickname(String iccidString, String nicknameNew) throws Exception {
        Iccid iccid = new Iccid(Bytes.decodeHexString(iccidString));
        SetNicknameResponse setNicknameResponse = es10Interface.es10c_setNickname(iccid, nicknameNew);
        return new SetNicknameResult(setNicknameResponse.getSetNicknameResult().intValue());
    }

    @Override
    public List<ProfileMetadata> getProfiles() throws Exception {

        ProfileInfoListResponse profileInfoListResponse = es10Interface.es10c_getProfilesInfoAll();

        List<ProfileMetadata> profileMetadataList = new ArrayList<>();

        for (ProfileInfo profileInfo : profileInfoListResponse.getProfileInfoListOk().getProfileInfo()) {
            if(profileInfo.getIccid() != null) {
                profileMetadataList.add(new ProfileMetadata(profileInfo));
            }
        }

        return profileMetadataList;
    }

    @Override
    public String getEID() throws Exception {
        GetEuiccDataResponse getEuiccDataResponse = es10Interface.es10c_getEid();
        return getEuiccDataResponse.getEidValue().toString();
    }

    @Override
    public EuiccInfo getEuiccInfo2() throws Exception {
        EUICCInfo2 euiccInfo2 = es10Interface.es10b_getEuiccInfo2();
        return new EuiccInfo(euiccInfo2);
    }

    public EUICCInfo1 getEuiccInfo1() throws Exception {
        return es10Interface.es10b_getEuiccInfo1();
    }

    // Remote functions

    @Override
    public AuthenticateResult authenticate(ActivationCode activationCode) throws Exception {
        Log.debug("AUTHENTICATE", activationCode.toString());
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
        return new DownloadProfileWorker(profileDownloadSession).downloadProfile(confirmationCode);
    }

    @Override
    public CancelSessionResult cancelSession(long cancelSessionReasonValue) throws Exception {
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

 }
