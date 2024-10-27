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

import com.beanit.jasn1.ber.types.BerOctetString;
import com.gsma.sgp.messages.pkix1explicit88.Certificate;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateClientOk;
import com.gsma.sgp.messages.rspdefinitions.AuthenticateClientResponseEs9;
import com.gsma.sgp.messages.rspdefinitions.SmdpSigned2;
import com.gsma.sgp.messages.rspdefinitions.StoreMetadataRequest;
import com.gsma.sgp.messages.rspdefinitions.TransactionId;
import com.infineon.esim.lpa.core.es9plus.messages.response.base.ResponseMsgBody;
import com.infineon.esim.messages.Ber;
import com.infineon.esim.util.Bytes;


public class AuthenticateClientResp extends ResponseMsgBody {
    private String transactionId;
    private String profileMetadata;
    private String smdpSigned2;
    private String smdpSignature2;
    private String smdpCertificate;

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getProfileMetadata() {
        return profileMetadata;
    }

    public void setProfileMetadata(String profileMetadata) {
        this.profileMetadata = profileMetadata;
    }

    public String getSmdpSigned2() {
        return smdpSigned2;
    }

    public void setSmdpSigned2(String smdpSigned2) {
        this.smdpSigned2 = smdpSigned2;
    }

    public String getSmdpSignature2() {
        return smdpSignature2;
    }

    public void setSmdpSignature2(String smdpSignature2) {
        this.smdpSignature2 = smdpSignature2;
    }

    public String getSmdpCertificate() {
        return smdpCertificate;
    }

    public void setSmdpCertificate(String smdpCertificate) {
        this.smdpCertificate = smdpCertificate;
    }

    public AuthenticateClientResponseEs9 getResponse() {
        AuthenticateClientOk authenticateClientOk = new AuthenticateClientOk();
        authenticateClientOk.setTransactionId(this.getTransactionIdParsed());
        authenticateClientOk.setProfileMetadata(this.getProfileMetadataParsed());
        authenticateClientOk.setSmdpSigned2(this.getSmdpSigned2Parsed());
        authenticateClientOk.setSmdpSignature2(this.getSmdpSignature2Parsed());
        authenticateClientOk.setSmdpCertificate(this.getSmdpCertificateParsed());

        AuthenticateClientResponseEs9 authenticateClientResponseEs9 = new AuthenticateClientResponseEs9();
        authenticateClientResponseEs9.setAuthenticateClientOk(authenticateClientOk);

        return authenticateClientResponseEs9;
    }

    public void setResponse(AuthenticateClientResponseEs9 authenticateClientResponseEs9) {
        TransactionId transactionID = authenticateClientResponseEs9.getAuthenticateClientOk().getTransactionId();
        StoreMetadataRequest profileMetadata = authenticateClientResponseEs9.getAuthenticateClientOk().getProfileMetadata();
        SmdpSigned2 smdpSigned2 = authenticateClientResponseEs9.getAuthenticateClientOk().getSmdpSigned2();
        BerOctetString smdpSignature2 = authenticateClientResponseEs9.getAuthenticateClientOk().getSmdpSignature2();
        Certificate smdpCertificate = authenticateClientResponseEs9.getAuthenticateClientOk().getSmdpCertificate();

        this.transactionId = this.getEncodedTransactionId(transactionID);
        this.profileMetadata = this.getEncodedProfileMetadata(profileMetadata);
        this.smdpSigned2 = this.getEncodedSmdpSigned2(smdpSigned2);
        this.smdpSignature2 = this.getEncodedSmdpSignature2(smdpSignature2);
        this.smdpCertificate = this.getEncodedSmdpCertificate(smdpCertificate);
    }

    private String getEncodedTransactionId(TransactionId transactionId) {
        return Ber.getEncodedValueAsHexString(transactionId);
    }

    private TransactionId getTransactionIdParsed() {
        return new TransactionId(Bytes.decodeHexString(this.transactionId));
    }

    private String getEncodedProfileMetadata(StoreMetadataRequest profileMetadata) {
        return Ber.getEncodedAsBase64String(profileMetadata);
    }

    private StoreMetadataRequest getProfileMetadataParsed() {
        return Ber.createFromEncodedBase64String(StoreMetadataRequest.class, profileMetadata);
    }

    private String getEncodedSmdpSigned2(SmdpSigned2 smdpSigned2) {
        return Ber.getEncodedAsBase64String(smdpSigned2);
    }

    private SmdpSigned2 getSmdpSigned2Parsed() {
        return Ber.createFromEncodedBase64String(SmdpSigned2.class, smdpSigned2);
    }

    private String getEncodedSmdpSignature2(BerOctetString smdpSignature2) {
        // Remove BerOctetString tag and encode signature with tag 0x5F37
        return Bytes.encodeBase64String(Ber.swapTag(Ber.getEncodedAsByteArray(smdpSignature2), Ber.BER_TAG_SIGNATURE));
    }

    private BerOctetString getSmdpSignature2Parsed() {
        // Remove tag 0x5F37 and encode as BerOctetString
        return new BerOctetString(Ber.stripTagAndLength(Bytes.decodeBase64String(this.smdpSignature2)));
    }

    private String getEncodedSmdpCertificate(Certificate smdpCertificate) {
        return Ber.getEncodedAsBase64String(smdpCertificate);
    }

    private Certificate getSmdpCertificateParsed() {
        return Ber.createFromEncodedBase64String(Certificate.class, smdpCertificate);
    }

    @NonNull
    @Override
    public String toString() {
        return "AuthenticateClientResp{" +
                "header='" + super.getHeader() + '\'' +
                ", transactionId='" + transactionId + '\'' +
                ", profileMetadata='" + profileMetadata + '\'' +
                ", smdpSigned2='" + smdpSigned2 + '\'' +
                ", smdpSignature2='" + smdpSignature2 + '\'' +
                ", smdpCertificate='" + smdpCertificate + '\'' +
                '}';
    }
}
