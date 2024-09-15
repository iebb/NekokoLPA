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

package com.infineon.esim.lpa.core.dtos.apdu;

import java.util.List;

public class Apdu {
    private static final String TAG = Apdu.class.getName();

    // Common status words
    private static final String SW_SUCCESS_STATUS_WORD =            "9000";
    private static final String SW_SUCCESS_PROACTIVE_CMD_WAITING =  "91";

    public static boolean isSuccessResponse(String response) {
        if((response == null) || (response.length() < 4)) {
            return false;
        }

        String statusWord = response.substring(response.length()-4);

        return statusWord.equals(SW_SUCCESS_STATUS_WORD)
                || statusWord.startsWith(SW_SUCCESS_PROACTIVE_CMD_WAITING);

    }

    public static String getStatusWord(String response) {
        if(response.length() >= 4) {
            return response.substring(response.length() - 4);
        } else {
            return null;
        }
    }

    public static boolean isLastResponseSuccess(List<String> responses) {
        if(responses.size() == 0) {
            return false;
        }

        String lastResponse = responses.get(responses.size() - 1);
        return isSuccessResponse(lastResponse);
    }

    public static boolean doesResponseContainData(String response) {
        return response.length() > 4;
    }
}
