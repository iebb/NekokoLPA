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

import android.os.Parcel;
import android.os.Parcelable;

import androidx.annotation.NonNull;

public class ActivationCode implements Parcelable {
    private String activationCode;

    private final Boolean isValid;
    private String acFormat;
    private String smdpServer;
    private String matchingId;
    private String smdpOid;
    private String confirmationCodeRequiredFlag;

    public ActivationCode(String barcode) {
        this.isValid = parseActivationCode(barcode);
    }

    protected ActivationCode(Parcel in) {
        activationCode = in.readString();
        this.isValid = parseActivationCode(activationCode);
    }

    public Boolean isValid() {
        return isValid;
    }

    public String getAcFormat() {
        return acFormat;
    }

    public String getSmdpServer() {
        return smdpServer;
    }

    public String getMatchingId() {
        return matchingId;
    }

    public String getSmdpOid() {
        return smdpOid;
    }

    public String getConfirmationCodeRequiredFlag() {
        return confirmationCodeRequiredFlag;
    }

    // Example
    // Input activation code:
    //       LPA:1$trl.prod.ondemandconnectivity.com$KJ912512WD7N5NMZ
    //
    // Output
    //       prefix:        LPA:1
    //       matchingId:    KJ912512WD7N5NMZ
    //       smdpServer:    trl.prod.ondemandconnectivity.com
    //       rspServerUrl:  https://trl.prod.ondemandconnectivity.com
    private Boolean parseActivationCode(String barcode) {
        boolean validity = false;

        // Remove trailing "LPA:" if present
        this.activationCode = barcode.replace("LPA:", "");

        String[] parts = activationCode.split("\\$");
        if((parts.length >= 3) && (parts.length <= 5)) {
            acFormat = parts[0];
            smdpServer = parts[1];
            matchingId = parts[2];

            // AC_Format must be "1"
            validity = (acFormat.compareTo("1") == 0);

            // All first three parts must be non-empty
            validity &= !acFormat.isEmpty() && !smdpServer.isEmpty() && !matchingId.isEmpty();

            if(parts.length >= 4) {
                smdpOid = parts[3];
            }

            // If AC has 4 $s the SMDP OID must be non-empty
            if(parts.length == 4) {
                validity &= !smdpOid.isEmpty();
            }

            // If AC has 5 $s the CC required flag must be non-empty
            if(parts.length == 5) {
                confirmationCodeRequiredFlag = parts[4];
                validity &= !confirmationCodeRequiredFlag.isEmpty();
            }

            // Last character shall not be a $
            String lastCharacter = activationCode.substring(activationCode.length() - 1);
            validity &= (lastCharacter.compareTo("$") != 0);
        }

        return validity;
    }

    @Override
    @NonNull
    public String toString() {
        if(activationCode != null) {
            return activationCode;
        } else {
            return "N/A";
        }
    }

    @Override
    public int describeContents() {
        return 0;
    }

    public static final Creator<ActivationCode> CREATOR = new Creator<ActivationCode>() {
        @Override
        public ActivationCode createFromParcel(Parcel in) {
            return new ActivationCode(in);
        }

        @Override
        public ActivationCode[] newArray(int size) {
            return new ActivationCode[size];
        }
    };

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(activationCode);
    }
}
