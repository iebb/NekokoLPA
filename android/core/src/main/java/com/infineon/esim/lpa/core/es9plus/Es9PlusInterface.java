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

package com.infineon.esim.lpa.core.es9plus;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateClientRequest;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateClientResponseEs9;
import com.gsma.sgp.messages.rspdefinitions.CancelSessionRequestEs9;
import com.gsma.sgp.messages.rspdefinitions.CancelSessionResponseEs9;
import com.gsma.sgp.messages.rspdefinitions.GetBoundProfilePackageRequest;
import com.gsma.sgp.messages.rspdefinitions.GetBoundProfilePackageResponse;
import com.gsma.sgp.messages.rspdefinitions.InitiateAuthenticationRequest;
import com.gsma.sgp.messages.rspdefinitions.InitiateAuthenticationResponse;
import com.gsma.sgp.messages.rspdefinitions.PendingNotification;
import com.infineon.esim.lpa.core.dtos.result.remote.FuncExecException;
import com.infineon.esim.lpa.core.dtos.result.remote.RemoteErrorException;
import com.infineon.esim.lpa.core.es9plus.messages.HttpResponse;
import com.infineon.esim.lpa.core.es9plus.messages.request.AuthenticateClientReq;
import com.infineon.esim.lpa.core.es9plus.messages.request.CancelSessionReq;
import com.infineon.esim.lpa.core.es9plus.messages.request.GetBoundProfilePackageReq;
import com.infineon.esim.lpa.core.es9plus.messages.request.HandleNotificationReq;
import com.infineon.esim.lpa.core.es9plus.messages.request.InitiateAuthenticationReq;
import com.infineon.esim.lpa.core.es9plus.messages.response.AuthenticateClientResp;
import com.infineon.esim.lpa.core.es9plus.messages.response.CancelSessionResp;
import com.infineon.esim.lpa.core.es9plus.messages.response.GetBoundProfilePackageResp;
import com.infineon.esim.lpa.core.es9plus.messages.response.InitiateAuthenticationResp;
import com.infineon.esim.lpa.core.es9plus.messages.response.base.FunctionExecutionStatus;
import com.infineon.esim.lpa.core.es9plus.messages.response.base.ResponseMsgBody;
import com.infineon.esim.util.Log;

import javax.net.ssl.HttpsURLConnection;

public class Es9PlusInterface {
    private static final String TAG = Es9PlusInterface.class.getName();

    private static final Gson GS = new GsonBuilder().disableHtmlEscaping().create();

    private static final String INITIATE_AUTHENTICATION_PATH = "/gsma/rsp2/es9plus/initiateAuthentication";
    private static final String AUTHENTICATE_CLIENT_PATH = "/gsma/rsp2/es9plus/authenticateClient";
    private static final String GET_BOUND_PROFILE_PACKAGE_PATH = "/gsma/rsp2/es9plus/getBoundProfilePackage";
    private static final String HANDLE_NOTIFICATION_PATH = "/gsma/rsp2/es9plus/handleNotification";
    private static final String CANCEL_SESSION_PATH = "/gsma/rsp2/es9plus/cancelSession";

    private final HttpsClient httpsClient;

    private String smdpAddress;

    private FunctionExecutionStatus lastFunctionExecutionStatus = null;

    public Es9PlusInterface() {
        this.httpsClient = new HttpsClient();
    }

    public void setSmdpAddress(String smdpAddress) {
        this.smdpAddress = smdpAddress;
    }

    public InitiateAuthenticationResponse initiateAuthentication(InitiateAuthenticationRequest initiateAuthenticationRequest) throws Exception {
        ensureSmdpAddressIsAvailable();

        Log.debug(TAG, "ES9+ -> : " + initiateAuthenticationRequest);

        InitiateAuthenticationReq initiateAuthenticationReq = new InitiateAuthenticationReq();
        initiateAuthenticationReq.setRequest(initiateAuthenticationRequest);

        HttpResponse httpResponse = httpsClient.sendRequest(GS.toJson(initiateAuthenticationReq), smdpAddress, INITIATE_AUTHENTICATION_PATH, true);
        checkHttpStatusCode("InitiateAuthentication", httpResponse, HttpsURLConnection.HTTP_OK);

        InitiateAuthenticationResp initiateAuthenticationResp = GS.fromJson(httpResponse.getContent(), InitiateAuthenticationResp.class);
        checkFunctionExecutionStatus("InitiateAuthentication", initiateAuthenticationResp);

        InitiateAuthenticationResponse initiateAuthenticationResponse = initiateAuthenticationResp.getResponse();
        Log.debug(TAG, "ES9+ <- : " + initiateAuthenticationResponse);

        return initiateAuthenticationResponse;
    }

    public AuthenticateClientResponseEs9 authenticateClient(AuthenticateClientRequest authenticateClientRequest) throws Exception {
        ensureSmdpAddressIsAvailable();

        Log.debug(TAG, "ES9+ -> : " + authenticateClientRequest);

        AuthenticateClientReq authenticateClientReq = new AuthenticateClientReq();
        authenticateClientReq.setRequest(authenticateClientRequest);

        HttpResponse httpResponse = httpsClient.sendRequest(GS.toJson(authenticateClientReq), smdpAddress, AUTHENTICATE_CLIENT_PATH, true);
        checkHttpStatusCode("AuthenticateClient", httpResponse, HttpsURLConnection.HTTP_OK);

        AuthenticateClientResp authenticateClientResp = GS.fromJson(httpResponse.getContent(), AuthenticateClientResp.class);
        checkFunctionExecutionStatus("AuthenticateClient", authenticateClientResp);

        AuthenticateClientResponseEs9 authenticateClientResponseEs9 = authenticateClientResp.getResponse();
        Log.debug(TAG, "ES9+ <- : " + authenticateClientResponseEs9);

        return authenticateClientResponseEs9;
    }

    public GetBoundProfilePackageResponse getBoundProfilePackage(GetBoundProfilePackageRequest getBoundProfilePackageRequest) throws Exception {
        ensureSmdpAddressIsAvailable();

        Log.debug(TAG, "ES9+ -> : " + getBoundProfilePackageRequest);

        GetBoundProfilePackageReq getBoundProfilePackageReq = new GetBoundProfilePackageReq();
        getBoundProfilePackageReq.setRequest(getBoundProfilePackageRequest);

        HttpResponse httpResponse = httpsClient.sendRequest(GS.toJson(getBoundProfilePackageReq), smdpAddress, GET_BOUND_PROFILE_PACKAGE_PATH, true);
        checkHttpStatusCode("GetBoundProfilePackage", httpResponse, HttpsURLConnection.HTTP_OK);

        GetBoundProfilePackageResp getBoundProfilePackageResp = GS.fromJson(httpResponse.getContent(), GetBoundProfilePackageResp.class);
        checkFunctionExecutionStatus("GetBoundProfilePackage", getBoundProfilePackageResp);

        GetBoundProfilePackageResponse getBoundProfilePackageResponse = getBoundProfilePackageResp.getResponse();
        Log.debug(TAG, "ES9+ <- : " + getBoundProfilePackageResponse);

        return getBoundProfilePackageResponse;
    }

    public CancelSessionResponseEs9 cancelSession(CancelSessionRequestEs9 cancelSessionRequest) throws Exception {
        ensureSmdpAddressIsAvailable();

        Log.debug(TAG, "ES9+ -> : " + cancelSessionRequest);

        CancelSessionReq cancelSessionReq = new CancelSessionReq();
        cancelSessionReq.setRequest(cancelSessionRequest);

        HttpResponse httpResponse = httpsClient.sendRequest(GS.toJson(cancelSessionReq), smdpAddress, CANCEL_SESSION_PATH, true);
        checkHttpStatusCode("CancelSession", httpResponse, HttpsURLConnection.HTTP_OK);

        CancelSessionResp cancelSessionResp = GS.fromJson(httpResponse.getContent(), CancelSessionResp.class);
        checkFunctionExecutionStatus("CancelSession", cancelSessionResp);

        CancelSessionResponseEs9 cancelSessionResponseEs9 = cancelSessionResp.getResponse();
        Log.debug(TAG, "ES9+ <- : " + cancelSessionResponseEs9);

        return cancelSessionResponseEs9;
    }

    public void handleNotification(PendingNotification pendingNotification) throws Exception {
        ensureSmdpAddressIsAvailable();

        Log.debug(TAG, "ES9+ -> : " + pendingNotification);

        HandleNotificationReq handleNotificationReq = new HandleNotificationReq();
        handleNotificationReq.setRequest(pendingNotification);

        HttpResponse httpResponse = httpsClient.sendRequest(GS.toJson(handleNotificationReq), smdpAddress, HANDLE_NOTIFICATION_PATH, true);
        // No content for response

        checkHttpStatusCode("HandleNotification", httpResponse, HttpsURLConnection.HTTP_NO_CONTENT);
    }

    public FunctionExecutionStatus getFunctionExecutionStatus() {
        return lastFunctionExecutionStatus;
    }

    private void ensureSmdpAddressIsAvailable() throws Exception {
        if(smdpAddress == null) {
            Log.error(TAG, "SM-DP+ address is not available.");
            throw new Exception("SM-DP+ address is not available.");
        }
    }

    private void checkHttpStatusCode(String functionName, HttpResponse httpResponse, int expectedHttpStatusCode) {
        if(httpResponse.getStatusCode() != expectedHttpStatusCode) {
            throw new RuntimeException("Error in " + functionName + ": wrong HTTP status code: " + httpResponse.getStatusCode());
        }
    }

    private void checkFunctionExecutionStatus(String functionName, ResponseMsgBody responseMessage) {
        if((responseMessage.getHeader() != null) &&
                (responseMessage.getHeader().getFunctionExecutionStatus() != null)) {

            this.lastFunctionExecutionStatus = responseMessage.getHeader().getFunctionExecutionStatus();
            String status = lastFunctionExecutionStatus.getStatus();

            if(status.equals(FunctionExecutionStatus.EXECUTION_STATUS_SUCCESS) ||
                    status.equals(FunctionExecutionStatus.EXECUTION_STATUS_WITH_WARNING)) {
                return;
            } else {
                throw new FuncExecException("Error in " + functionName + ": FunctionExecutionStatus: " + lastFunctionExecutionStatus.toString(), lastFunctionExecutionStatus);
            }
        }

        throw new RuntimeException("Error in " + functionName + ": FunctionExecutionStatus not found in response.");
    }
}
