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
import com.gsma.sgp.messages.pkix1implicit88.SubjectKeyIdentifier;
import com.gsma.sgp.messages.rspdefinitions.InitiateAuthenticationOkEs9;
import com.gsma.sgp.messages.rspdefinitions.InitiateAuthenticationResponse;
import com.gsma.sgp.messages.rspdefinitions.ServerSigned1;
import com.gsma.sgp.messages.rspdefinitions.TransactionId;
import com.infineon.esim.lpa.core.es9plus.messages.response.base.ResponseMsgBody;
import com.infineon.esim.messages.Ber;
import com.infineon.esim.util.Bytes;

public class InitiateAuthenticationResp extends ResponseMsgBody {
    private String transactionId;
    private String serverSigned1;
    private String serverSignature1;
    private String euiccCiPKIdToBeUsed;
    private String serverCertificate;

    public InitiateAuthenticationResp() {
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getServerSigned1() {
        return serverSigned1;
    }

    public void setServerSigned1(String serverSigned1) {
        this.serverSigned1 = serverSigned1;
    }

    public String getServerSignature1() {
        return serverSignature1;
    }

    public void setServerSignature1(String serverSignature1) {
        this.serverSignature1 = serverSignature1;
    }

    public String getEuiccCiPKIdToBeUsed() {
        return euiccCiPKIdToBeUsed;
    }

    public void setEuiccCiPKIdToBeUsed(String euiccCiPKIdToBeUsed) {
        this.euiccCiPKIdToBeUsed = euiccCiPKIdToBeUsed;
    }

    public String getServerCertificate() {
        return serverCertificate;
    }

    public void setServerCertificate(String serverCertificate) {
        this.serverCertificate = serverCertificate;
    }

    private String getEncodedTransactionId(TransactionId transactionId) {
        return Ber.getEncodedValueAsHexString(transactionId);
    }

    private String getEncodedServerSigned1(ServerSigned1 serverSigned1) {
        return Ber.getEncodedAsBase64String(serverSigned1);
    }

    private String getEncodedEuiccCiPKIdToBeUsed(SubjectKeyIdentifier euiccCiPKIdToBeUsed) {
        return Ber.getEncodedAsBase64String(euiccCiPKIdToBeUsed);
    }

    private String getEncodedServerSignature1(BerOctetString serverSignature1) {
        // Remove BerOctetString tag and encode signature with tag 0x5F37
//        byte[] serverSignature1BerBytes = Ber.encodeBerElement(Asn1Util.getBytes(serverSignature1), Bytes.intAsTwoBytes(0x5F37));
        byte[] serverSignature1BerBytes = Ber.encodeElement(Ber.getEncodedValueAsByteArray(serverSignature1), Ber.BER_TAG_SIGNATURE);

        return Bytes.encodeBase64String(serverSignature1BerBytes);
    }

    private String getEncodedServerCertificate(Certificate serverCertificate) {
        return Ber.getEncodedAsBase64String(serverCertificate);
    }

    public InitiateAuthenticationResponse getResponse() {
        InitiateAuthenticationOkEs9 initiateAuthenticationOkEs9 = new InitiateAuthenticationOkEs9();
        initiateAuthenticationOkEs9.setTransactionId(this.getTransactionIdParsed());
        initiateAuthenticationOkEs9.setServerSigned1(this.getServerSigned1Parsed());
        initiateAuthenticationOkEs9.setEuiccCiPKIdToBeUsed(this.getEuiccCiPKIdToBeUsedParsed());
        initiateAuthenticationOkEs9.setServerSignature1(this.getServerSignature1Parsed());
        initiateAuthenticationOkEs9.setServerCertificate(this.getServerCertificateParsed());

        InitiateAuthenticationResponse initiateAuthenticationResponse = new InitiateAuthenticationResponse();
        initiateAuthenticationResponse.setInitiateAuthenticationOk(initiateAuthenticationOkEs9);

        return initiateAuthenticationResponse;
    }

    public void setResponse(InitiateAuthenticationResponse initiateAuthenticationResponse) {
        TransactionId transactionId = initiateAuthenticationResponse.getInitiateAuthenticationOk().getTransactionId();
        ServerSigned1 serverSigned1 = initiateAuthenticationResponse.getInitiateAuthenticationOk().getServerSigned1();
        BerOctetString serverSignature1 = initiateAuthenticationResponse.getInitiateAuthenticationOk().getServerSignature1();
        SubjectKeyIdentifier euiccCiPKIdToBeUsed = initiateAuthenticationResponse.getInitiateAuthenticationOk().getEuiccCiPKIdToBeUsed();
        Certificate serverCertificate = initiateAuthenticationResponse.getInitiateAuthenticationOk().getServerCertificate();

        this.transactionId = this.getEncodedTransactionId(transactionId);
        this.serverSigned1 = this.getEncodedServerSigned1(serverSigned1);
        this.euiccCiPKIdToBeUsed = this.getEncodedEuiccCiPKIdToBeUsed(euiccCiPKIdToBeUsed);
        this.serverSignature1 = this.getEncodedServerSignature1(serverSignature1);
        this.serverCertificate = this.getEncodedServerCertificate(serverCertificate);
    }

    private TransactionId getTransactionIdParsed() {
        return new TransactionId(Bytes.decodeHexString(this.transactionId));
    }

    private ServerSigned1 getServerSigned1Parsed() {
        return Ber.createFromEncodedBase64String(ServerSigned1.class, serverSigned1);
    }

    private BerOctetString getServerSignature1Parsed() {
        // Remove tag 0x5F37
        byte[] serverSignature1Bytes = Bytes.decodeBase64String(this.serverSignature1);
        serverSignature1Bytes = Ber.stripTagAndLength(serverSignature1Bytes);

        // Encode as BerOctetString
        return new BerOctetString(serverSignature1Bytes);
    }

    private SubjectKeyIdentifier getEuiccCiPKIdToBeUsedParsed() {
        return Ber.createFromEncodedBase64String(SubjectKeyIdentifier.class, euiccCiPKIdToBeUsed);
    }

    private Certificate getServerCertificateParsed() {
        return Ber.createFromEncodedBase64String(Certificate.class, serverCertificate);
    }

    @NonNull
    @Override
    public String toString() {
        return "InitiateAuthenticationResp{" +
                "header='" + super.getHeader() + '\'' +
                ", transactionId='" + transactionId + '\'' +
                ", serverSigned1='" + serverSigned1 + '\'' +
                ", serverSignature1='" + serverSignature1 + '\'' +
                ", euiccCiPKIdToBeUsed='" + euiccCiPKIdToBeUsed + '\'' +
                ", serverCertificate='" + serverCertificate + '\'' +
                '}';
    }
}
