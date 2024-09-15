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

package com.infineon.esim.lpa.core.es9plus.messages.response;

import androidx.annotation.NonNull;

import com.gsma.sgp.messages.rspdefinitions.BoundProfilePackage;
import com.gsma.sgp.messages.rspdefinitions.GetBoundProfilePackageOk;
import com.gsma.sgp.messages.rspdefinitions.GetBoundProfilePackageResponse;
import com.gsma.sgp.messages.rspdefinitions.TransactionId;
import com.infineon.esim.lpa.core.es9plus.messages.response.base.ResponseMsgBody;
import com.infineon.esim.messages.Ber;
import com.infineon.esim.util.Bytes;


public class GetBoundProfilePackageResp extends ResponseMsgBody {

    private String transactionId;
    private String boundProfilePackage;

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getBoundProfilePackage() {
        return boundProfilePackage;
    }

    public void setBoundProfilePackage(String boundProfilePackage) {
        this.boundProfilePackage = boundProfilePackage;
    }

    public GetBoundProfilePackageResponse getResponse() {
        GetBoundProfilePackageOk getBoundProfilePackageOk = new GetBoundProfilePackageOk();
        getBoundProfilePackageOk.setTransactionId(this.getTransactionIdParsed());
        getBoundProfilePackageOk.setBoundProfilePackage(this.getBoundProfilePackageParsed());

        GetBoundProfilePackageResponse getBoundProfilePackageResponse = new GetBoundProfilePackageResponse();
        getBoundProfilePackageResponse.setGetBoundProfilePackageOk(getBoundProfilePackageOk);

        return getBoundProfilePackageResponse;
    }

    public void setResponse(GetBoundProfilePackageResponse getBoundProfilePackageResponse) {
        TransactionId transactionID = getBoundProfilePackageResponse.getGetBoundProfilePackageOk().getTransactionId();
        BoundProfilePackage boundProfilePackage = getBoundProfilePackageResponse.getGetBoundProfilePackageOk().getBoundProfilePackage();

        this.transactionId = this.getEncodedTransactionId(transactionID);
        this.boundProfilePackage = this.getEncodedBoundProfilePackage(boundProfilePackage);
    }

    public TransactionId getTransactionIdParsed() {
        return new TransactionId(Bytes.decodeHexString(this.transactionId));
    }

    public BoundProfilePackage getBoundProfilePackageParsed() {
        return Ber.createFromEncodedBase64String(BoundProfilePackage.class, boundProfilePackage);
    }

    private String getEncodedTransactionId(TransactionId transactionId) {
        return Ber.getEncodedValueAsHexString(transactionId);
    }

    private String getEncodedBoundProfilePackage(BoundProfilePackage boundProfilePackage) {
        return Ber.getEncodedAsBase64String(boundProfilePackage);
    }

    @NonNull
    @Override
    public String toString() {
        return "GetBoundProfilePackageResp{" +
                "header='" + super.getHeader() + '\'' +
                ", transactionId='" + transactionId + '\'' +
                ", boundProfilePackage='" + boundProfilePackage + '\'' +
                '}';
    }
}
