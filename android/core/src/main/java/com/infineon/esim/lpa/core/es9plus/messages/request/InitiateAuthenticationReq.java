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

import com.beanit.jasn1.ber.types.string.BerUTF8String;
import com.gsma.sgp.messages.rspdefinitions.EUICCInfo1;
import com.gsma.sgp.messages.rspdefinitions.InitiateAuthenticationRequest;
import com.gsma.sgp.messages.rspdefinitions.Octet16;
import com.infineon.esim.lpa.core.es9plus.messages.request.base.RequestMsgBody;
import com.infineon.esim.messages.Ber;
import com.infineon.esim.util.Bytes;


public class InitiateAuthenticationReq extends RequestMsgBody {
    private String euiccChallenge;
    private String euiccInfo1;
    private String smdpAddress;

    public String getEuiccChallenge() {
        return euiccChallenge;
    }

    public void setEuiccChallenge(String euiccChallenge) {
        this.euiccChallenge = euiccChallenge;
    }

    public String getEuiccInfo1() {
        return euiccInfo1;
    }

    public void setEuiccInfo1(String euiccInfo1) {
        this.euiccInfo1 = euiccInfo1;
    }

    public String getSmdpAddress() {
        return smdpAddress;
    }

    public void setSmdpAddress(String smdpAddress) {
        this.smdpAddress = smdpAddress;
    }

    public InitiateAuthenticationRequest getRequest() {
        InitiateAuthenticationRequest initiateAuthenticationRequest = new InitiateAuthenticationRequest();

        initiateAuthenticationRequest.setSmdpAddress(this.getSmdpAddressParsed());
        initiateAuthenticationRequest.setEuiccInfo1(this.getEuiccInfo1Parsed());
        initiateAuthenticationRequest.setEuiccChallenge(this.getEuiccChallengeParsed());

        return initiateAuthenticationRequest;
    }

    public void setRequest(InitiateAuthenticationRequest initiateAuthenticationRequest) {
        setEuiccChallengeParsed(initiateAuthenticationRequest.getEuiccChallenge());
        setEuiccInfo1Parsed(initiateAuthenticationRequest.getEuiccInfo1());
        setSmdpAddressParsed(initiateAuthenticationRequest.getSmdpAddress());
    }

    private Octet16 getEuiccChallengeParsed() {
        return new Octet16(Bytes.decodeBase64String(this.euiccChallenge));
    }

    private void setEuiccChallengeParsed(Octet16 euiccChallengeParsed) {
        euiccChallenge = Ber.getEncodedValueAsBase64String(euiccChallengeParsed);
    }

    private EUICCInfo1 getEuiccInfo1Parsed() {
        return Ber.createFromEncodedBase64String(EUICCInfo1.class, euiccInfo1);
    }

    private void setEuiccInfo1Parsed(EUICCInfo1 euiccInfo1Parsed) {
        euiccInfo1 = Ber.getEncodedAsBase64String(euiccInfo1Parsed);
    }

    private BerUTF8String getSmdpAddressParsed() {
        return new BerUTF8String(this.smdpAddress.getBytes());
    }

    private void setSmdpAddressParsed(BerUTF8String smdpAddressParsed) {
        smdpAddress = smdpAddressParsed.toString();
    }

    @NonNull
    @Override
    public String toString() {
        return "InitiateAuthenticationReq{" +
                "euiccChallenge='" + euiccChallenge + '\'' +
                ", euiccInfo1='" + euiccInfo1 + '\'' +
                ", smdpAddress='" + smdpAddress + '\'' +
                '}';
    }
}
