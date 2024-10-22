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

import com.infineon.esim.lpa.core.es9plus.messages.HttpResponse;
import com.infineon.esim.util.Log;

import java.net.HttpURLConnection;
import java.util.List;
import java.util.Map;

public class TlsUtil {
    private static final String TAG = TlsUtil.class.getName();

    public static void logHttpReq(HttpURLConnection httpURLConnection, final String body) {
        Log.info(TAG, " - HTTP Request Header: ");

        Map<String, List<String>> requestProperties = httpURLConnection.getRequestProperties();

        int i = 0;
        for (Map.Entry<String, List<String>> property : requestProperties.entrySet()) {
            String propertyName = property.getKey();
            List<String> propertyValueList = property.getValue();

            for (String propertyValue : propertyValueList) {
                Log.info(TAG, "   " + i + " " + propertyName + " = " + propertyValue);
                i++;
            }
        }

        Log.info(TAG, " - HTTP Request Body:\n" + body);
    }

    public static void logHttpRes(HttpURLConnection httpURLConnection, HttpResponse response) {
        Log.info(TAG, " - HTTP Response Code: " + response.getStatusCode());
        Log.info(TAG, " - HTTP Response Header: ");

        int i = 0;
        while (true) {
            String fieldKey = httpURLConnection.getHeaderFieldKey(i);
            String fieldValue = httpURLConnection.getHeaderField(i);
            if ((fieldKey != null) && (fieldValue != null)) {
                Log.info(TAG, "   " + i + " " + fieldKey + " = " + fieldValue);
            } else {
                break;
            }
            i++;
        }

        Log.info(TAG, " - HTTP Response Body:\n" + response.getContent());
    }
}