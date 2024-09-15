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

package com.infineon.esim.lpa.core.es9plus.messages.request;

import androidx.annotation.NonNull;

import com.gsma.sgp.messages.rspdefinitions.AuthenticateClientRequest;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateServerResponse;
import com.gsma.sgp.messages.rspdefinitions.TransactionId;
import com.infineon.esim.lpa.core.es9plus.messages.request.base.RequestMsgBody;
import com.infineon.esim.messages.Ber;
import com.infineon.esim.util.Bytes;

public class AuthenticateClientReq extends RequestMsgBody {
    private String transactionId;
    private String authenticateServerResponse;

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getAuthenticateServerResponse() {
        return authenticateServerResponse;
    }

    public void setAuthenticateServerResponse(String authenticateServerResponse) {
        this.authenticateServerResponse = authenticateServerResponse;
    }

    public AuthenticateClientRequest getRequest() {
        AuthenticateClientRequest authenticateClientRequest = new AuthenticateClientRequest();

        authenticateClientRequest.setTransactionId(this.getTransactionIdParsed());
        authenticateClientRequest.setAuthenticateServerResponse(this.getAuthenticateServerResponseParsed());

        return authenticateClientRequest;
    }

    public void setRequest(AuthenticateClientRequest authenticateClientRequest) {
        setTransactionIdParsed(authenticateClientRequest.getTransactionId());
        setAuthenticateServerResponseParsed(authenticateClientRequest.getAuthenticateServerResponse());
    }

    private TransactionId getTransactionIdParsed() {
        return new TransactionId(Bytes.decodeHexString(this.transactionId));
    }

    private void setTransactionIdParsed(TransactionId transactionIdParsed) {
        transactionId = Ber.getEncodedValueAsHexString(transactionIdParsed);
    }

    private AuthenticateServerResponse getAuthenticateServerResponseParsed() {
        return Ber.createFromEncodedBase64String(AuthenticateServerResponse.class, authenticateServerResponse);
    }

    private void setAuthenticateServerResponseParsed(AuthenticateServerResponse authenticateServerResponseParsed) {
        authenticateServerResponse = Ber.getEncodedAsBase64String(authenticateServerResponseParsed);
    }

    @NonNull
    @Override
    public String toString() {
        return "AuthenticateClientReq{" +
                "transactionId='" + transactionId + '\'' +
                ", authenticateServerResponse='" + authenticateServerResponse + '\'' +
                '}';
    }
}
