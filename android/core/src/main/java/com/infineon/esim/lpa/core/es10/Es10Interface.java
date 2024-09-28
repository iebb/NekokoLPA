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

package com.infineon.esim.lpa.core.es10;

import com.beanit.jasn1.ber.types.BerBitString;
import com.beanit.jasn1.ber.types.BerBoolean;
import com.beanit.jasn1.ber.types.BerInteger;
import com.beanit.jasn1.ber.types.BerOctetString;
import com.beanit.jasn1.ber.types.BerType;
import com.beanit.jasn1.ber.types.string.BerUTF8String;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateServerRequest;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateServerResponse;
import com.gsma.sgp.messages.rspdefinitions.CancelSessionRequest;
import com.gsma.sgp.messages.rspdefinitions.CancelSessionResponse;
import com.gsma.sgp.messages.rspdefinitions.DeleteProfileRequest;
import com.gsma.sgp.messages.rspdefinitions.DeleteProfileResponse;
import com.gsma.sgp.messages.rspdefinitions.DisableProfileRequest;
import com.gsma.sgp.messages.rspdefinitions.DisableProfileResponse;
import com.gsma.sgp.messages.rspdefinitions.EUICCInfo1;
import com.gsma.sgp.messages.rspdefinitions.EUICCInfo2;
import com.gsma.sgp.messages.rspdefinitions.EnableProfileRequest;
import com.gsma.sgp.messages.rspdefinitions.EnableProfileResponse;
import com.gsma.sgp.messages.rspdefinitions.EuiccConfiguredDataRequest;
import com.gsma.sgp.messages.rspdefinitions.EuiccConfiguredDataResponse;
import com.gsma.sgp.messages.rspdefinitions.EuiccMemoryResetRequest;
import com.gsma.sgp.messages.rspdefinitions.EuiccMemoryResetResponse;
import com.gsma.sgp.messages.rspdefinitions.GetEuiccChallengeRequest;
import com.gsma.sgp.messages.rspdefinitions.GetEuiccChallengeResponse;
import com.gsma.sgp.messages.rspdefinitions.GetEuiccDataRequest;
import com.gsma.sgp.messages.rspdefinitions.GetEuiccDataResponse;
import com.gsma.sgp.messages.rspdefinitions.GetEuiccInfo1Request;
import com.gsma.sgp.messages.rspdefinitions.GetEuiccInfo2Request;
import com.gsma.sgp.messages.rspdefinitions.GetRatRequest;
import com.gsma.sgp.messages.rspdefinitions.GetRatResponse;
import com.gsma.sgp.messages.rspdefinitions.Iccid;
import com.gsma.sgp.messages.rspdefinitions.ListNotificationRequest;
import com.gsma.sgp.messages.rspdefinitions.ListNotificationResponse;
import com.gsma.sgp.messages.rspdefinitions.NotificationEvent;
import com.gsma.sgp.messages.rspdefinitions.NotificationSentRequest;
import com.gsma.sgp.messages.rspdefinitions.NotificationSentResponse;
import com.gsma.sgp.messages.rspdefinitions.Octet1;
import com.gsma.sgp.messages.rspdefinitions.Octet4;
import com.gsma.sgp.messages.rspdefinitions.OctetTo16;
import com.gsma.sgp.messages.rspdefinitions.PrepareDownloadRequest;
import com.gsma.sgp.messages.rspdefinitions.PrepareDownloadResponse;
import com.gsma.sgp.messages.rspdefinitions.ProfileInfoListRequest;
import com.gsma.sgp.messages.rspdefinitions.ProfileInfoListResponse;
import com.gsma.sgp.messages.rspdefinitions.ProfileInstallationResult;
import com.gsma.sgp.messages.rspdefinitions.RetrieveNotificationsListRequest;
import com.gsma.sgp.messages.rspdefinitions.RetrieveNotificationsListResponse;
import com.gsma.sgp.messages.rspdefinitions.SetDefaultDpAddressRequest;
import com.gsma.sgp.messages.rspdefinitions.SetDefaultDpAddressResponse;
import com.gsma.sgp.messages.rspdefinitions.SetNicknameRequest;
import com.gsma.sgp.messages.rspdefinitions.SetNicknameResponse;
import com.infineon.esim.lpa.core.dtos.apdu.Apdu;
import com.infineon.esim.lpa.core.es10.base.SegmentedBoundProfilePackage;
import com.infineon.esim.lpa.core.es10.base.TransportCommand;
import com.infineon.esim.messages.Ber;
import com.infineon.esim.util.Bytes;
import com.infineon.esim.util.Log;

import java.util.List;

@SuppressWarnings("unused")
public class Es10Interface {
    private static final String TAG = Es10Interface.class.getName();

    private final EuiccChannel euiccChannel;

    public Es10Interface(EuiccChannel euiccChannel) {
        this.euiccChannel = euiccChannel;
    }

    // ES10a

    public EuiccConfiguredDataResponse es10a_getEuiccConfiguredAddresses() throws Exception {
        EuiccConfiguredDataRequest euiccConfiguredAddressesRequest = new EuiccConfiguredDataRequest();

        Log.debug(TAG, "ES10 -> : " + euiccConfiguredAddressesRequest);
        EuiccConfiguredDataResponse euiccConfiguredAddressesResponse = sendCommand(euiccConfiguredAddressesRequest, EuiccConfiguredDataResponse.class);
        Log.debug(TAG, "ES10 <- : " + euiccConfiguredAddressesResponse);

        return euiccConfiguredAddressesResponse;
    }

    public SetDefaultDpAddressResponse es10a_setDefaultDpAddress(BerUTF8String defaultDpAddress) throws Exception {
        SetDefaultDpAddressRequest setDefaultDpAddressRequest = new SetDefaultDpAddressRequest();
        setDefaultDpAddressRequest.setDefaultDpAddress(defaultDpAddress);

        Log.debug(TAG, "ES10 -> : " + setDefaultDpAddressRequest);
        SetDefaultDpAddressResponse setDefaultDpAddressResponse = sendCommand(setDefaultDpAddressRequest, SetDefaultDpAddressResponse.class);
        Log.debug(TAG, "ES10 <- : " + setDefaultDpAddressResponse);

        return setDefaultDpAddressResponse;
    }

    // ES10b

    public PrepareDownloadResponse es10b_prepareDownloadRequest(PrepareDownloadRequest prepareDownloadRequest) throws Exception {
        return sendCommand(prepareDownloadRequest, PrepareDownloadResponse.class);
    }

    public ProfileInstallationResult es10b_loadBoundProfilePackage(SegmentedBoundProfilePackage segmentedBoundProfilePackage) throws Exception {
        List<List<String>> segments = segmentedBoundProfilePackage.getSegments();

        for(int i = 0; i < (segments.size() - 1); i++) {
            sendCommand(segments.get(i), null);
        }

        return sendCommand(segments.get(segments.size() - 1), ProfileInstallationResult.class);
    }

    public GetEuiccChallengeResponse es10b_getEuiccChallenge() throws Exception {
        GetEuiccChallengeRequest getEuiccChallengeRequest = new GetEuiccChallengeRequest();

        return sendCommand(getEuiccChallengeRequest, GetEuiccChallengeResponse.class);
    }

    public EUICCInfo1 es10b_getEuiccInfo1() throws Exception {
        GetEuiccInfo1Request getEuiccInfo1Request = new GetEuiccInfo1Request();

        return sendCommand(getEuiccInfo1Request, EUICCInfo1.class);
    }

    public EUICCInfo2 es10b_getEuiccInfo2() throws Exception {
        GetEuiccInfo2Request getEuiccInfo2Request = new GetEuiccInfo2Request();

        return sendCommand(getEuiccInfo2Request, EUICCInfo2.class);
    }

    public ListNotificationResponse es10b_listNotification(NotificationEvent notificationEvent) throws Exception {
        ListNotificationRequest listNotificationRequest = new ListNotificationRequest();
        listNotificationRequest.setProfileManagementOperation(notificationEvent);

        return sendCommand(listNotificationRequest, ListNotificationResponse.class);
    }

    public RetrieveNotificationsListResponse es10b_retrieveNotificationsListBySeqNumber(BerInteger seqNumber) throws Exception {
        RetrieveNotificationsListRequest.SearchCriteria searchCriteria = new RetrieveNotificationsListRequest.SearchCriteria();
        searchCriteria.setSeqNumber(seqNumber);

        return es10b_retrieveNotificationsListBySeqNumber(searchCriteria);
    }

    public RetrieveNotificationsListResponse es10b_retrieveNotificationsListByNotificationEvent(NotificationEvent notificationEvent) throws Exception {
        RetrieveNotificationsListRequest.SearchCriteria searchCriteria = new RetrieveNotificationsListRequest.SearchCriteria();
        searchCriteria.setProfileManagementOperation(notificationEvent);

        return es10b_retrieveNotificationsListBySeqNumber(searchCriteria);
    }

    private RetrieveNotificationsListResponse es10b_retrieveNotificationsListBySeqNumber(RetrieveNotificationsListRequest.SearchCriteria searchCriteria) throws Exception {
        RetrieveNotificationsListRequest retrieveNotificationsListRequest = new RetrieveNotificationsListRequest();
        retrieveNotificationsListRequest.setSearchCriteria(searchCriteria);

        return sendCommand(retrieveNotificationsListRequest, RetrieveNotificationsListResponse.class);
    }

    public NotificationSentResponse es10b_removeNotificationFromList(BerInteger seqNumber) throws Exception {
        NotificationSentRequest notificationSentRequest = new NotificationSentRequest();
        notificationSentRequest.setSeqNumber(seqNumber);

        return sendCommand(notificationSentRequest,NotificationSentResponse.class);
    }

    public AuthenticateServerResponse es10b_authenticateServer(AuthenticateServerRequest authenticateServerRequest) throws Exception {
        return sendCommand(authenticateServerRequest, AuthenticateServerResponse.class);
    }


    public CancelSessionResponse es10b_cancelSession(CancelSessionRequest cancelSessionRequest) throws Exception {
        return sendCommand(cancelSessionRequest, CancelSessionResponse.class);
    }

    // ES10c

    public ProfileInfoListResponse es10c_getProfilesInfoAll() throws Exception {
        ProfileInfoListRequest profileInfoListRequest = new ProfileInfoListRequest();
        profileInfoListRequest.setTagList(
                new BerOctetString(Bytes.decodeHexString("5A4F9F709091929395B6B7"))
                // 9F25: profile size (not supported)
                // 9F25 9F24 9F1F unsupported: new additions
                // 94 icon
                // B8 SM-DP+ proprietary data - may crash!
                // 99 Profile Policy Rules - may crash!
        );
        return sendCommand(profileInfoListRequest, ProfileInfoListResponse.class);
    }

    public EnableProfileResponse es10c_enableProfileByIccid(Iccid iccid, BerBoolean refreshFlag) throws Exception {
        EnableProfileRequest.ProfileIdentifier profileIdentifier = new EnableProfileRequest.ProfileIdentifier();
        profileIdentifier.setIccid(iccid);

        return es10c_enableProfile(profileIdentifier, refreshFlag);
    }

    public EnableProfileResponse es10c_enableProfileByIsdpAid(OctetTo16 isdpAid, BerBoolean refreshFlag) throws Exception {
        EnableProfileRequest.ProfileIdentifier profileIdentifier = new EnableProfileRequest.ProfileIdentifier();
        profileIdentifier.setIsdpAid(isdpAid);

        return es10c_enableProfile(profileIdentifier, refreshFlag);
    }

    private EnableProfileResponse es10c_enableProfile(EnableProfileRequest.ProfileIdentifier profileIdentifier, BerBoolean refreshFlag) throws Exception {
        EnableProfileRequest enableProfileRequest = new EnableProfileRequest();
        enableProfileRequest.setProfileIdentifier(profileIdentifier);
        enableProfileRequest.setRefreshFlag(refreshFlag);

        return sendCommand(enableProfileRequest, EnableProfileResponse.class);
    }

    public DisableProfileResponse es10c_disableProfileByIccid(Iccid iccid, BerBoolean refreshFlag) throws Exception {
        DisableProfileRequest.ProfileIdentifier profileIdentifier = new DisableProfileRequest.ProfileIdentifier();
        profileIdentifier.setIccid(iccid);

        return es10c_disableProfile(profileIdentifier, refreshFlag);
    }

    public DisableProfileResponse es10c_disableProfileByIsdpAid(OctetTo16 isdpAid, BerBoolean refreshFlag) throws Exception {
        DisableProfileRequest.ProfileIdentifier profileIdentifier = new DisableProfileRequest.ProfileIdentifier();
        profileIdentifier.setIsdpAid(isdpAid);

        return es10c_disableProfile(profileIdentifier, refreshFlag);
    }

    private DisableProfileResponse es10c_disableProfile(DisableProfileRequest.ProfileIdentifier profileIdentifier, BerBoolean refreshFlag) throws Exception {
        DisableProfileRequest disableProfileRequest = new DisableProfileRequest();
        disableProfileRequest.setProfileIdentifier(profileIdentifier);
        disableProfileRequest.setRefreshFlag(refreshFlag);

        return sendCommand(disableProfileRequest, DisableProfileResponse.class);
    }

    public DeleteProfileResponse es10c_deleteProfileByIccid(Iccid iccid) throws Exception {
        DeleteProfileRequest deleteProfileRequest = new DeleteProfileRequest();
        deleteProfileRequest.setIccid(iccid);

        return sendCommand(deleteProfileRequest, DeleteProfileResponse.class);
    }

    public DeleteProfileResponse es10c_deleteProfileByIsdpAid(OctetTo16 isdpAid) throws Exception {
        DeleteProfileRequest deleteProfileRequest = new DeleteProfileRequest();
        deleteProfileRequest.setIsdpAid(isdpAid);

        return sendCommand(deleteProfileRequest, DeleteProfileResponse.class);
    }

    public EuiccMemoryResetResponse es10c_eUiccMemoryReset(BerBitString resetOptions) throws Exception {
        EuiccMemoryResetRequest euiccMemoryResetRequest = new EuiccMemoryResetRequest();
        euiccMemoryResetRequest.setResetOptions(resetOptions);

        return sendCommand(euiccMemoryResetRequest, EuiccMemoryResetResponse.class);
    }

    public GetEuiccDataResponse es10c_getEid() throws Exception {
        GetEuiccDataRequest getEuiccDataRequest = new GetEuiccDataRequest();
        getEuiccDataRequest.setTagList(new Octet1(Bytes.decodeHexString("5A")));

        return sendCommand(getEuiccDataRequest, GetEuiccDataResponse.class);
    }

    public SetNicknameResponse es10c_setNickname(Iccid iccid, String nickname) throws Exception {
        SetNicknameRequest setNicknameRequest = new SetNicknameRequest();
        setNicknameRequest.setIccid(iccid);
        setNicknameRequest.setProfileNickname(new BerUTF8String(nickname));

        return sendCommand(setNicknameRequest, SetNicknameResponse.class);
    }

    public GetRatResponse es10c_getRat() throws Exception {
        GetRatRequest getRatRequest = new GetRatRequest();

        return sendCommand(getRatRequest, GetRatResponse.class);
    }

    // INTERNAL

    private <T extends BerType> T sendCommand(BerType berRequest, Class<T> berResponseClass) throws Exception {
        List<String> requests =  TransportCommand.getTransportCommands(berRequest);

        Log.debug(TAG, "ES10 -> : " + berRequest.getClass().getSimpleName() + "\n" + berRequest);
        String response = transmitApdus(requests);

        if(Apdu.isSuccessResponse(response)) {
            T berResponse = Ber.createFromEncodedHexString(berResponseClass, response);
            Log.debug(TAG, "ES10 <- : " + berResponse.getClass().getSimpleName() + "\n" + berResponse);

            return berResponse;
        } else {
            throw new Exception("Error: APDU response is no success: " + Apdu.getStatusWord(response));
        }
    }

    private <T extends BerType> T sendCommand(List<String> encodedRequests, Class<T> berResponseClass) throws Exception {
        List<String> requests =  TransportCommand.getTransportCommands(encodedRequests);

        String response = transmitApdus(requests);

        if(Apdu.isSuccessResponse(response)) {
            if(berResponseClass != null) {
                return Ber.createFromEncodedHexString(berResponseClass, response);
            } else {
                return null;
            }
        } else {
            throw new Exception("Error: APDU response is no success: " + Apdu.getStatusWord(response));
        }
    }

    private String transmitApdus(List<String> apduRequests) throws Exception {
        List<String> apduResponses;
        String finalApduResponse = null;

        Log.debug(TAG, "ES10 - Transmit APDUs requests:  " + apduRequests);
        apduResponses = euiccChannel.transmitAPDUS(apduRequests);
        Log.debug(TAG, "ES10 - Transmit APDUs responses:  " + apduResponses);

        // Return first response APDU that contains data
        for (String apduResponse : apduResponses) {
            finalApduResponse = apduResponse;
            if (Apdu.doesResponseContainData(apduResponse)) {
                return apduResponse;
            }
        }

        return finalApduResponse;
    }
}
