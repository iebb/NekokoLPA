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

import com.gsma.sgp.messages.rspdefinitions.Octet32;
import com.gsma.sgp.messages.rspdefinitions.TransactionId;
import com.infineon.esim.util.Bytes;
import com.infineon.esim.util.Log;
import com.infineon.esim.util.crypto.HashUtils;


public class ConfirmationCode {
    private static final String TAG = ConfirmationCode.class.getName();

    public static Octet32 getHashCC(String confirmationCode, TransactionId transactionId) {
        if(confirmationCode != null) {
            return new Octet32(Bytes.decodeHexString(getCcHash(transactionId, confirmationCode)));
        }

        return null;
    }

    private static String getCcHash(TransactionId transactionId, String confirmationCode) {
        // Calculate the confirmation code hash as follows: H(H(confirmationCode) | transactionId)
        byte[] transactionIdBytes = transactionId.value;
        byte[] confirmationCodeBytes = confirmationCode.getBytes();

        byte[] hash1Bytes = HashUtils.hashSha256(confirmationCodeBytes);

        byte[] hash2Input = new byte[hash1Bytes.length + transactionIdBytes.length];

        System.arraycopy(hash1Bytes, 0, hash2Input, 0, hash1Bytes.length);
        System.arraycopy(transactionIdBytes, 0, hash2Input, hash1Bytes.length, transactionIdBytes.length);


        byte[] hash2Bytes = HashUtils.hashSha256(hash2Input);

        Log.debug(TAG, " - Transaction ID: " + Bytes.encodeHexString(transactionIdBytes));
        Log.debug(TAG, " - Confirmation Code: " + Bytes.encodeHexString(confirmationCodeBytes));
        Log.debug(TAG, " - Hash CC input: " + Bytes.encodeHexString(hash2Input));
        Log.debug(TAG, " - Hash CC result: " + Bytes.encodeHexString(hash2Bytes));

        return Bytes.encodeHexString(hash2Bytes);
    }
}
