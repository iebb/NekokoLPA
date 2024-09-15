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

package com.infineon.esim.lpa.core.worker.remote;

import com.gsma.sgp.messages.rspdefinitions.AuthenticateClientRequest;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateClientResponseEs9;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateServerRequest;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateServerResponse;
import com.gsma.sgp.messages.rspdefinitions.EUICCInfo1;
import com.gsma.sgp.messages.rspdefinitions.GetEuiccChallengeResponse;
import com.gsma.sgp.messages.rspdefinitions.InitiateAuthenticationRequest;
import com.gsma.sgp.messages.rspdefinitions.InitiateAuthenticationResponse;
import com.infineon.esim.lpa.core.dtos.ProfileDownloadSession;
import com.infineon.esim.lpa.core.es10.Es10Interface;
import com.infineon.esim.lpa.core.es9plus.Es9PlusInterface;
import com.infineon.esim.util.Log;

public class AuthenticateWorker {
    private static final String TAG = AuthenticateWorker.class.getName();

    private final ProfileDownloadSession profileDownloadSession;
    private final Es10Interface es10Interface;
    private final Es9PlusInterface es9PlusInterface;

    public AuthenticateWorker(ProfileDownloadSession profileDownloadSession) {
        this.profileDownloadSession = profileDownloadSession;
        this.es10Interface = profileDownloadSession.getEs10Interface();
        this.es9PlusInterface = profileDownloadSession.getEs9PlusInterface();
    }

    public boolean authenticate() throws Exception {
        Log.debug(TAG, "Authenticating ...");

        // Get required data from eUICC
        EUICCInfo1 euiccInfo1 = es10Interface.es10b_getEuiccInfo1();
        GetEuiccChallengeResponse euiccChallenge = es10Interface.es10b_getEuiccChallenge();

        profileDownloadSession.es10_processEuiccInfo1(euiccInfo1);
        profileDownloadSession.es10_processEuiccChallenge(euiccChallenge);

        // Send initiateAuthenticate to SM-DP+
        InitiateAuthenticationRequest initiateAuthenticationRequest = profileDownloadSession.es9Plus_getInitiateAuthenticationRequest();
        InitiateAuthenticationResponse initiateAuthenticationResponse = es9PlusInterface.initiateAuthentication(initiateAuthenticationRequest);
        profileDownloadSession.es9Plus_processInitiateAuthenticationResponse(es9PlusInterface.getFunctionExecutionStatus(), initiateAuthenticationResponse);

        // Send authenticateServer to eUICC
        AuthenticateServerRequest authenticateServerRequest = profileDownloadSession.es10_getAuthenticateServerRequest();
        AuthenticateServerResponse authenticateServerResponse = es10Interface.es10b_authenticateServer(authenticateServerRequest);
        profileDownloadSession.es10_processAuthenticateServerResponse(authenticateServerResponse);

        // Send authenticateClient to SM-DP+
        AuthenticateClientRequest authenticateClientRequest = profileDownloadSession.es9Plus_getAuthenticateClientRequest();
        AuthenticateClientResponseEs9 authenticateClientResponseEs9 = es9PlusInterface.authenticateClient(authenticateClientRequest);
        profileDownloadSession.es9Plus_processAuthenticateClientResponse(es9PlusInterface.getFunctionExecutionStatus(), authenticateClientResponseEs9);

        return profileDownloadSession.isClientAuthenticatedSuccessfully();
    }
}
