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

package com.infineon.esim.lpa.core.dtos;

import static com.infineon.esim.lpa.core.dtos.ProfileDownloadSession.ProfileDownloadSessionState.AUTHENTICATE_CLIENT_FINISHED;
import static com.infineon.esim.lpa.core.dtos.ProfileDownloadSession.ProfileDownloadSessionState.AUTHENTICATE_CLIENT_STARTED;
import static com.infineon.esim.lpa.core.dtos.ProfileDownloadSession.ProfileDownloadSessionState.AUTHENTICATE_SERVER_FINISHED;
import static com.infineon.esim.lpa.core.dtos.ProfileDownloadSession.ProfileDownloadSessionState.AUTHENTICATE_SERVER_STARTED;
import static com.infineon.esim.lpa.core.dtos.ProfileDownloadSession.ProfileDownloadSessionState.CANCEL_SESSION_EUICC_FINISHED;
import static com.infineon.esim.lpa.core.dtos.ProfileDownloadSession.ProfileDownloadSessionState.CANCEL_SESSION_EUICC_STARTED;
import static com.infineon.esim.lpa.core.dtos.ProfileDownloadSession.ProfileDownloadSessionState.CANCEL_SESSION_SMDP_STARTED;
import static com.infineon.esim.lpa.core.dtos.ProfileDownloadSession.ProfileDownloadSessionState.GET_BPP_FINISHED;
import static com.infineon.esim.lpa.core.dtos.ProfileDownloadSession.ProfileDownloadSessionState.GET_BPP_STARTED;
import static com.infineon.esim.lpa.core.dtos.ProfileDownloadSession.ProfileDownloadSessionState.INITIATE_AUTHENTICATION_FINISHED;
import static com.infineon.esim.lpa.core.dtos.ProfileDownloadSession.ProfileDownloadSessionState.INITIATE_AUTHENTICATION_STARTED;
import static com.infineon.esim.lpa.core.dtos.ProfileDownloadSession.ProfileDownloadSessionState.PREPARE_DOWNLOAD_FINISHED;
import static com.infineon.esim.lpa.core.dtos.ProfileDownloadSession.ProfileDownloadSessionState.PREPARE_DOWNLOAD_STARTED;
import static com.infineon.esim.lpa.core.dtos.ProfileDownloadSession.ProfileDownloadSessionState.PROFILE_INSTALLATION_FAILED;
import static com.infineon.esim.lpa.core.dtos.ProfileDownloadSession.ProfileDownloadSessionState.PROFILE_INSTALLATION_SUCCESS;
import static com.infineon.esim.lpa.core.dtos.ProfileDownloadSession.ProfileDownloadSessionState.SESSION_CANCELLED_FAILED;
import static com.infineon.esim.lpa.core.dtos.ProfileDownloadSession.ProfileDownloadSessionState.SESSION_CANCELLED_SUCCESS;

import com.beanit.jasn1.ber.types.BerInteger;
import com.beanit.jasn1.ber.types.BerOctetString;
import com.beanit.jasn1.ber.types.string.BerUTF8String;
import com.gsma.sgp.messages.pkix1explicit88.Certificate;
import com.gsma.sgp.messages.pkix1implicit88.SubjectKeyIdentifier;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateClientOk;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateClientRequest;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateClientResponseEs9;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateErrorCode;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateResponseError;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateResponseOk;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateServerRequest;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateServerResponse;
import com.gsma.sgp.messages.rspdefinitions.BoundProfilePackage;
import com.gsma.sgp.messages.rspdefinitions.CancelSessionReason;
import com.gsma.sgp.messages.rspdefinitions.CancelSessionRequest;
import com.gsma.sgp.messages.rspdefinitions.CancelSessionRequestEs9;
import com.gsma.sgp.messages.rspdefinitions.CancelSessionResponse;
import com.gsma.sgp.messages.rspdefinitions.CancelSessionResponseEs9;
import com.gsma.sgp.messages.rspdefinitions.CancelSessionResponseOk;
import com.gsma.sgp.messages.rspdefinitions.CtxParams1;
import com.gsma.sgp.messages.rspdefinitions.CtxParamsForCommonAuthentication;
import com.gsma.sgp.messages.rspdefinitions.DeviceInfo;
import com.gsma.sgp.messages.rspdefinitions.DownloadErrorCode;
import com.gsma.sgp.messages.rspdefinitions.EUICCInfo1;
import com.gsma.sgp.messages.rspdefinitions.EUICCSigned2;
import com.gsma.sgp.messages.rspdefinitions.EuiccCancelSessionSigned;
import com.gsma.sgp.messages.rspdefinitions.EuiccSigned1;
import com.gsma.sgp.messages.rspdefinitions.GetBoundProfilePackageOk;
import com.gsma.sgp.messages.rspdefinitions.GetBoundProfilePackageRequest;
import com.gsma.sgp.messages.rspdefinitions.GetBoundProfilePackageResponse;
import com.gsma.sgp.messages.rspdefinitions.GetEuiccChallengeResponse;
import com.gsma.sgp.messages.rspdefinitions.InitiateAuthenticationOkEs9;
import com.gsma.sgp.messages.rspdefinitions.InitiateAuthenticationRequest;
import com.gsma.sgp.messages.rspdefinitions.InitiateAuthenticationResponse;
import com.gsma.sgp.messages.rspdefinitions.Octet16;
import com.gsma.sgp.messages.rspdefinitions.Octet32;
import com.gsma.sgp.messages.rspdefinitions.PrepareDownloadRequest;
import com.gsma.sgp.messages.rspdefinitions.PrepareDownloadResponse;
import com.gsma.sgp.messages.rspdefinitions.PrepareDownloadResponseError;
import com.gsma.sgp.messages.rspdefinitions.PrepareDownloadResponseOk;
import com.gsma.sgp.messages.rspdefinitions.ProfileInstallationResult;
import com.gsma.sgp.messages.rspdefinitions.ServerSigned1;
import com.gsma.sgp.messages.rspdefinitions.SmdpSigned2;
import com.gsma.sgp.messages.rspdefinitions.StoreMetadataRequest;
import com.gsma.sgp.messages.rspdefinitions.TransactionId;
import com.infineon.esim.lpa.core.dtos.result.remote.RemoteError;
import com.infineon.esim.lpa.core.es10.Es10Interface;
import com.infineon.esim.lpa.core.es10.base.SegmentedBoundProfilePackage;
import com.infineon.esim.lpa.core.es9plus.Es9PlusInterface;
import com.infineon.esim.lpa.core.es9plus.messages.response.base.FunctionExecutionStatus;
import com.infineon.esim.messages.RspVersion;
import com.infineon.esim.util.Log;

@SuppressWarnings({"unused", "FieldCanBeLocal"})
public class ProfileDownloadSession {
    private static final String TAG = ProfileDownloadSession.class.getName();

    private final Es10Interface es10Interface;
    private final Es9PlusInterface es9PlusInterface;


    private final BerUTF8String matchingId;
    private final BerUTF8String smdpAddress;
    private final String smdpAddressUrl;

    private DeviceInfo deviceInfo;
    private RspVersion rspVersion;
    private ProfileDownloadSessionState state;

    // Error handling
    private RemoteError lastError;

    // ES10:
    private EUICCInfo1 euiccInfo1;
    private GetEuiccChallengeResponse getEuiccChallengeResponse;
    private Octet16 euiccChallenge;

    // ES9+: InitiateAuthenticationResponse
    private InitiateAuthenticationResponse initiateAuthenticationResponse;
    private TransactionId transactionId;
    private SubjectKeyIdentifier euiccCiPkiIdToBeUsed;
    private ServerSigned1 serverSigned1;
    private BerOctetString serverSignature1;
    private Certificate serverCertificate;

    // ES10: AuthenticateServerResponse
    private AuthenticateServerResponse authenticateServerResponse;
    private EuiccSigned1 euiccSigned1;
    private BerOctetString euiccSignature1;
    private Certificate euiccCertificate;
    private Certificate eumCertificate;

    // ES9+: AuthenticateClientResponseEs9
    private AuthenticateClientResponseEs9 authenticateClientResponseEs9;
    private StoreMetadataRequest profileMetaData;
    private SmdpSigned2 smdpSigned2;
    private BerOctetString smdpSignature2;
    private Certificate smdpCertificate;

    // ES10: PrepareDownloadResponse
    private PrepareDownloadResponse prepareDownloadResponse;
    private EUICCSigned2 euiccSigned2;
    private BerOctetString euiccSignature2;

    // ES9+: GetBoundProfileResponse
    private GetBoundProfilePackageResponse getBoundProfilePackageResponse;
    private BoundProfilePackage boundProfilePackage;

    // ES10: LoadBoundProfilePackage
    private ProfileInstallationResult profileInstallationResult;

    // ES10: CancelSessionResponse
    private CancelSessionResponse cancelSessionResponse;
    private EuiccCancelSessionSigned euiccCancelSessionSigned;
    private BerOctetString euiccCancelSessionSignature;

    public ProfileDownloadSession(ActivationCode activationCode, Es10Interface es10Interface, Es9PlusInterface es9PlusInterface) {
        this.smdpAddressUrl = activationCode.getSmdpServer();
        this.state = ProfileDownloadSessionState.INITIAL;
        this.matchingId = new BerUTF8String(activationCode.getMatchingId());
        this.smdpAddress = new BerUTF8String(activationCode.getSmdpServer());
        this.lastError = new RemoteError();

        this.es10Interface = es10Interface;
        this.es9PlusInterface = es9PlusInterface;
    }

    public Es10Interface getEs10Interface() {
        return es10Interface;
    }

    public Es9PlusInterface getEs9PlusInterface() {
        es9PlusInterface.setSmdpAddress(smdpAddressUrl);
        return es9PlusInterface;
    }

    public BerUTF8String getMatchingId() {
        return matchingId;
    }

    public BerUTF8String getSmdpAddress() {
        return smdpAddress;
    }

    public TransactionId getTransactionId() {
        return transactionId;
    }

    public StoreMetadataRequest getProfileMetaData() {
        return profileMetaData;
    }

    public SmdpSigned2 getSmdpSigned2() {
        return smdpSigned2;
    }

    public RemoteError getLastError() {
        return lastError;
    }

    public void es10_processEuiccInfo1(EUICCInfo1 euiccInfo1) {
        this.euiccInfo1 = euiccInfo1;
        // TODO: Check if there is a better way to obtain the session RSP version (server selection?)
        this.rspVersion = new RspVersion(euiccInfo1);
        this.deviceInfo = DeviceInformation.getDeviceInfo(euiccInfo1);
    }

    public void es10_processEuiccChallenge(GetEuiccChallengeResponse getEuiccChallengeResponse) {
        this.getEuiccChallengeResponse = getEuiccChallengeResponse;
        this.euiccChallenge = getEuiccChallengeResponse.getEuiccChallenge();
    }

    public InitiateAuthenticationRequest es9Plus_getInitiateAuthenticationRequest() {
        InitiateAuthenticationRequest initiateAuthenticationRequest = new InitiateAuthenticationRequest();
        initiateAuthenticationRequest.setSmdpAddress(smdpAddress);
        initiateAuthenticationRequest.setEuiccChallenge(euiccChallenge);
        initiateAuthenticationRequest.setEuiccInfo1(euiccInfo1);

        // #SupportedFromV3.0.0#
        if(rspVersion.isFrom3_0_0()) {
            initiateAuthenticationRequest.setLpaRspCapability(LpaInformation.getLpaRspCapability());
        }

        updateState(INITIATE_AUTHENTICATION_STARTED);
        Log.verbose(TAG, "ES9+: InitiateAuthenticationRequest: " + initiateAuthenticationRequest);

        return initiateAuthenticationRequest;
    }


    public void es9Plus_processInitiateAuthenticationResponse(FunctionExecutionStatus functionExecutionStatus, InitiateAuthenticationResponse initiateAuthenticationResponse) {
        Log.verbose(TAG, "ES9+: InitiateAuthenticationResponse: " + initiateAuthenticationResponse);

        this.lastError = new RemoteError(functionExecutionStatus);
        this.initiateAuthenticationResponse = initiateAuthenticationResponse;

        if(initiateAuthenticationResponse.getInitiateAuthenticationOk() == null) {
            if(initiateAuthenticationResponse.getInitiateAuthenticationError() != null) {
                BerInteger errorNumber = initiateAuthenticationResponse.getInitiateAuthenticationError();
                throw new RuntimeException("Error during initiateAuthentication call with error " + errorNumber + ".");
            }
            throw new RuntimeException("Error during initiateAuthentication call with unknown error.");
        }

        InitiateAuthenticationOkEs9 initiateAuthenticationOkEs9 = initiateAuthenticationResponse.getInitiateAuthenticationOk();
        this.transactionId = initiateAuthenticationOkEs9.getTransactionId();
        this.euiccCiPkiIdToBeUsed = initiateAuthenticationOkEs9.getEuiccCiPKIdToBeUsed();
        this.serverSigned1 = initiateAuthenticationOkEs9.getServerSigned1();
        this.serverSignature1 = initiateAuthenticationOkEs9.getServerSignature1();
        this.serverCertificate = initiateAuthenticationOkEs9.getServerCertificate();

        updateState(INITIATE_AUTHENTICATION_FINISHED);
    }

    public AuthenticateServerRequest es10_getAuthenticateServerRequest() {
        CtxParamsForCommonAuthentication ctxParamsForCommonAuthentication = new CtxParamsForCommonAuthentication();
        ctxParamsForCommonAuthentication.setMatchingId(this.matchingId);
        ctxParamsForCommonAuthentication.setDeviceInfo(this.deviceInfo);

        CtxParams1 ctxParams1 = new CtxParams1();
        ctxParams1.setCtxParamsForCommonAuthentication(ctxParamsForCommonAuthentication);

        AuthenticateServerRequest authenticateServerRequest = new AuthenticateServerRequest();
        authenticateServerRequest.setCtxParams1(ctxParams1);
        authenticateServerRequest.setEuiccCiPKIdToBeUsed(this.euiccCiPkiIdToBeUsed);
        authenticateServerRequest.setServerSigned1(this.serverSigned1);
        authenticateServerRequest.setServerSignature1(this.serverSignature1);
        authenticateServerRequest.setServerCertificate(this.serverCertificate);

        updateState(AUTHENTICATE_SERVER_STARTED);
        Log.verbose(TAG, "ES10: AuthenticateServerRequest: " + authenticateServerRequest);

        return authenticateServerRequest;
    }

    public void es10_processAuthenticateServerResponse(AuthenticateServerResponse authenticateServerResponse) {
        Log.verbose(TAG, "ES10: AuthenticateServerResponse: " + authenticateServerResponse);

        this.authenticateServerResponse = authenticateServerResponse;

        if(authenticateServerResponse.getAuthenticateResponseOk() == null) {
            if(authenticateServerResponse.getAuthenticateResponseError() != null) {
                AuthenticateResponseError authenticateResponseError = authenticateServerResponse.getAuthenticateResponseError();

                if(isTransactionIdInvalid(authenticateResponseError.getTransactionId())) {
                    throw new RuntimeException("Error during authenticateServer call: TransactionId incorrect: " + authenticateResponseError.getTransactionId());
                }

                AuthenticateErrorCode authenticateErrorCode =  authenticateResponseError.getAuthenticateErrorCode();
                throw new RuntimeException("Error during authenticateServer call with error " + authenticateErrorCode + ".");
            }
            throw new RuntimeException("Error during authenticateServer call with unknown error.");
        }

        AuthenticateResponseOk authenticateResponseOk = authenticateServerResponse.getAuthenticateResponseOk();
        this.euiccSigned1 = authenticateResponseOk.getEuiccSigned1();
        this.euiccSignature1 = authenticateResponseOk.getEuiccSignature1();
        this.euiccCertificate = authenticateResponseOk.getEuiccCertificate();
        this.eumCertificate = authenticateResponseOk.getNextCertInChain();

        updateState(AUTHENTICATE_SERVER_FINISHED);
    }

    public AuthenticateClientRequest es9Plus_getAuthenticateClientRequest() {
        AuthenticateClientRequest authenticateClientRequest = new AuthenticateClientRequest();
        authenticateClientRequest.setTransactionId(this.transactionId);
        authenticateClientRequest.setAuthenticateServerResponse(this.authenticateServerResponse);

        updateState(AUTHENTICATE_CLIENT_STARTED);
        Log.verbose(TAG, "ES9+: AuthenticateClientRequest: " + authenticateClientRequest);

        return authenticateClientRequest;
    }

    public void es9Plus_processAuthenticateClientResponse(FunctionExecutionStatus functionExecutionStatus, AuthenticateClientResponseEs9 authenticateClientResponseEs9) {
        Log.verbose(TAG, "ES9+: AuthenticateClientResponseEs9: " + authenticateClientResponseEs9);

        this.lastError = new RemoteError(functionExecutionStatus);
        this.authenticateClientResponseEs9 = authenticateClientResponseEs9;

        if(authenticateClientResponseEs9.getAuthenticateClientOk() == null) {
            if(authenticateClientResponseEs9.getAuthenticateClientError() != null) {
                BerInteger errorCode = authenticateClientResponseEs9.getAuthenticateClientError();
                throw new RuntimeException("Error during authenticateClient call with error " + errorCode + ".");
            }
            throw new RuntimeException("Error during authenticateClient call with unknown error.");
        }

        AuthenticateClientOk authenticateClientOk = authenticateClientResponseEs9.getAuthenticateClientOk();
        this.profileMetaData = authenticateClientOk.getProfileMetadata();
        this.smdpSigned2 = authenticateClientOk.getSmdpSigned2();
        this.smdpSignature2 = authenticateClientOk.getSmdpSignature2();
        this.smdpCertificate = authenticateClientOk.getSmdpCertificate();

        if(isTransactionIdInvalid(authenticateClientOk.getTransactionId())) {
            throw new RuntimeException("Error during authenticateServer call: TransactionId incorrect: " + authenticateClientOk.getTransactionId());
        }

        updateState(AUTHENTICATE_CLIENT_FINISHED);
    }

    public PrepareDownloadRequest es10_getPrepareDownloadRequest(Octet32 hashCc) {
        PrepareDownloadRequest prepareDownloadRequest = new PrepareDownloadRequest();
        prepareDownloadRequest.setSmdpSigned2(this.smdpSigned2);
        prepareDownloadRequest.setSmdpSignature2(this.smdpSignature2);
        prepareDownloadRequest.setSmdpCertificate(this.smdpCertificate);
        prepareDownloadRequest.setHashCc(hashCc);

        updateState(PREPARE_DOWNLOAD_STARTED);
        Log.verbose(TAG, "ES10: PrepareDownloadRequest: " + prepareDownloadRequest);

        return prepareDownloadRequest;
    }

    public void es10_processPrepareDownloadResponse(PrepareDownloadResponse prepareDownloadResponse) {
        Log.verbose(TAG, "ES10: PrepareDownloadResponse: " + prepareDownloadResponse);

        this.prepareDownloadResponse = prepareDownloadResponse;

        if(prepareDownloadResponse.getDownloadResponseOk() == null) {
            if(prepareDownloadResponse.getDownloadResponseError() != null) {
                PrepareDownloadResponseError prepareDownloadResponseError = prepareDownloadResponse.getDownloadResponseError();

                if(isTransactionIdInvalid(prepareDownloadResponseError.getTransactionId())) {
                    throw new RuntimeException("Error during authenticateServer call: TransactionId incorrect: " + prepareDownloadResponseError.getTransactionId());
                }

                DownloadErrorCode downloadErrorCode =  prepareDownloadResponseError.getDownloadErrorCode();
                throw new RuntimeException("Error during prepareDownload call with error " + downloadErrorCode + ".");
            }
            throw new RuntimeException("Error during prepareDownload call with unknown error.");
        }

        PrepareDownloadResponseOk prepareDownloadResponseOk = prepareDownloadResponse.getDownloadResponseOk();
        this.euiccSigned2 = prepareDownloadResponseOk.getEuiccSigned2();
        this.euiccSignature2 = prepareDownloadResponseOk.getEuiccSignature2();

        updateState(PREPARE_DOWNLOAD_FINISHED);
    }

    public GetBoundProfilePackageRequest es9Plus_getBoundProfilePackageRequest() {
        GetBoundProfilePackageRequest getBoundProfilePackageRequest = new GetBoundProfilePackageRequest();
        getBoundProfilePackageRequest.setTransactionId(this.transactionId);
        getBoundProfilePackageRequest.setPrepareDownloadResponse(this.prepareDownloadResponse);

        updateState(GET_BPP_STARTED);
        Log.verbose(TAG, "ES9+: GetBoundProfilePackageRequest: " + getBoundProfilePackageRequest);


        return getBoundProfilePackageRequest;
    }

    public void es9Plus_processGetBoundProfilePackageResponse(FunctionExecutionStatus functionExecutionStatus, GetBoundProfilePackageResponse getBoundProfilePackageResponse) {
        Log.verbose(TAG, "ES9+: GetBoundProfilePackageResponse: " + getBoundProfilePackageResponse);

        this.lastError = new RemoteError(functionExecutionStatus);
        this.getBoundProfilePackageResponse = getBoundProfilePackageResponse;

        if(getBoundProfilePackageResponse.getGetBoundProfilePackageOk() == null) {
            if(getBoundProfilePackageResponse.getGetBoundProfilePackageError() != null) {
                BerInteger errorCode = getBoundProfilePackageResponse.getGetBoundProfilePackageError();
                throw new RuntimeException("Error during getBoundProfilePackage call with error " + errorCode + ".");
            }
            throw new RuntimeException("Error during getBoundProfilePackage call with unknown error.");
        }

        GetBoundProfilePackageOk getBoundProfilePackageOk = getBoundProfilePackageResponse.getGetBoundProfilePackageOk();
        this.boundProfilePackage = getBoundProfilePackageOk.getBoundProfilePackage();

        if(isTransactionIdInvalid(getBoundProfilePackageOk.getTransactionId())) {
            throw new RuntimeException("Error during getBoundProfilePackage call: TransactionId incorrect: " + getBoundProfilePackageOk.getTransactionId());
        }

        updateState(GET_BPP_FINISHED);
    }

    public SegmentedBoundProfilePackage es10_getBoundProfilePackage() {
        SegmentedBoundProfilePackage segmentedBoundProfilePackage = new SegmentedBoundProfilePackage(boundProfilePackage);

        Log.verbose(TAG, "ES10: SegmentedBoundProfilePackage: " + segmentedBoundProfilePackage);

        return segmentedBoundProfilePackage;
    }

    public void es10_processProfileInstallationResult(ProfileInstallationResult profileInstallationResult) {
        Log.verbose(TAG, "ES10: ProfileInstallationResult: " + profileInstallationResult);

        this.profileInstallationResult = profileInstallationResult;

        if((profileInstallationResult.getProfileInstallationResultData() != null) &&
                (profileInstallationResult.getProfileInstallationResultData().getFinalResult() != null)) {

            if(profileInstallationResult.getProfileInstallationResultData().getFinalResult().getSuccessResult() != null) {
                updateState(PROFILE_INSTALLATION_SUCCESS);
                return;
            }
        }

        updateState(PROFILE_INSTALLATION_FAILED);
    }

    public CancelSessionRequest es10_getCancelSessionRequest(CancelSessionReason cancelSessionReason) {
        CancelSessionRequest cancelSessionRequest = new CancelSessionRequest();
        cancelSessionRequest.setTransactionId(this.transactionId);
        cancelSessionRequest.setReason(cancelSessionReason);

        updateState(CANCEL_SESSION_EUICC_STARTED);
        Log.verbose(TAG, "ES10: CancelSessionRequest: " + cancelSessionRequest);

        return cancelSessionRequest;
    }

    public void es10_processCancelSessionResponse(CancelSessionResponse cancelSessionResponse) {
        Log.verbose(TAG, "ES10: CancelSessionResponse: " + cancelSessionResponse);

        this.cancelSessionResponse = cancelSessionResponse;

        if(cancelSessionResponse.getCancelSessionResponseOk() == null) {
            if(cancelSessionResponse.getCancelSessionResponseError() != null) {
                BerInteger errorCode = cancelSessionResponse.getCancelSessionResponseError();
                throw new RuntimeException("Error during authenticateServer call with error " + errorCode + ".");
            }
            throw new RuntimeException("Error during authenticateServer call with unknown error.");
        }

        CancelSessionResponseOk cancelSessionResponseOk = cancelSessionResponse.getCancelSessionResponseOk();
        this.euiccCancelSessionSigned = cancelSessionResponseOk.getEuiccCancelSessionSigned();
        this.euiccCancelSessionSignature = cancelSessionResponseOk.getEuiccCancelSessionSignature();

        updateState(CANCEL_SESSION_EUICC_FINISHED);
    }

    public CancelSessionRequestEs9 es9Plus_getCancelSessionRequest() {
        CancelSessionRequestEs9 cancelSessionRequestEs9 = new CancelSessionRequestEs9();
        cancelSessionRequestEs9.setTransactionId(this.transactionId);
        cancelSessionRequestEs9.setCancelSessionResponse(this.cancelSessionResponse);

        updateState(CANCEL_SESSION_SMDP_STARTED);
        Log.verbose(TAG, "ES9+: CancelSessionRequestEs9: " + cancelSessionRequestEs9);

        return cancelSessionRequestEs9;
    }

    public void es9Plus_processCancelSessionResponse(CancelSessionResponseEs9 cancelSessionResponseEs9) {
        Log.verbose(TAG, "ES9+: CancelSessionResponseEs9: " + cancelSessionResponseEs9);

        // Intentionally blank
        if(cancelSessionResponseEs9.getCancelSessionOk() != null) {
            updateState(SESSION_CANCELLED_SUCCESS);
            return;
        }

        updateState(SESSION_CANCELLED_FAILED);
    }

    private boolean isTransactionIdInvalid(TransactionId transactionId) {
        if(transactionId == null) {
            return false;
        } else {
            Log.verbose(TAG, "Comparing transaction IDs:\n" + transactionId + "\n" + this.transactionId);
            return !transactionId.toString().equals(this.transactionId.toString());
        }
    }

    private void updateState(ProfileDownloadSessionState state) {
        this.state = state;
    }

    public boolean isCcRequired() {
        if(smdpSigned2 != null) {
            return smdpSigned2.getCcRequiredFlag().value;
        }

        return false;
    }

    public boolean isClientAuthenticatedSuccessfully() {
        return this.state == AUTHENTICATE_CLIENT_FINISHED;
    }

    public Boolean isProfileInstalledSuccessfully() {
        return this.state == PROFILE_INSTALLATION_SUCCESS;
    }

    public boolean isProfileSessionCancelledSuccessfully() {
        return this.state == SESSION_CANCELLED_SUCCESS;
    }

    @SuppressWarnings("unused")
    public enum ProfileDownloadSessionState{
        INITIAL,
        INITIATE_AUTHENTICATION_STARTED,
        INITIATE_AUTHENTICATION_FINISHED,
        AUTHENTICATE_SERVER_STARTED,
        AUTHENTICATE_SERVER_FINISHED,
        AUTHENTICATE_CLIENT_STARTED,
        AUTHENTICATE_CLIENT_FINISHED,
        PREPARE_DOWNLOAD_STARTED,
        PREPARE_DOWNLOAD_FINISHED,
        GET_BPP_STARTED,
        GET_BPP_FINISHED,
        LOAD_BPP_STARTED,
        LOAD_BPP_FINISHED,
        HANDLE_NOTIFICATION_STARTED,
        HANDLE_NOTIFICATION_FINISHED,
        REMOVE_NOTIFICATION_STARTED,
        REMOVE_NOTIFICATION_FINISHED,
        CANCEL_SESSION_EUICC_STARTED,
        CANCEL_SESSION_EUICC_FINISHED,
        CANCEL_SESSION_SMDP_STARTED,
        PROFILE_INSTALLATION_SUCCESS,
        PROFILE_INSTALLATION_FAILED,
        SESSION_CANCELLED_SUCCESS,
        SESSION_CANCELLED_FAILED
    }
}
