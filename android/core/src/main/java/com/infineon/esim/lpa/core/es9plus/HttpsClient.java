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
import com.infineon.esim.util.IO;
import com.infineon.esim.util.Log;
import com.infineon.esim.util.Strings;

import java.io.BufferedWriter;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.ConnectException;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import javax.net.ssl.HttpsURLConnection;

public class HttpsClient {
    private static final String TAG = HttpsClient.class.getName();

    private final String gsmaVersion;    // e.g. 2.2.0
    private final int connectionTimeout; // e.g. 600000
    private final int readTimeout;       // e.g. 600000

    public HttpsClient() {
        this.gsmaVersion = "2.2.0";
        this.connectionTimeout = 600000;
        this.readTimeout = 600000;
    }

    public HttpResponse sendRequest(
                        final String body,
                        final String domain,
                        final String path,
                        final boolean propagateException) throws ConnectException {

        HttpResponse httpResponse = new HttpResponse();

        Log.debug(TAG,"Server domain: " + domain);
        Log.debug(TAG,"Server path:   " + path);

        StringBuilder endpoint = new StringBuilder(domain);
        endpoint.append(path);

        HttpsTrustManager.disableSSLCertificateChecking();
        try {
            Log.debug(TAG,"Invoking endpoint: " + endpoint);
            URL urlResource = new URL("https://" + endpoint);
            Log.debug(TAG,"Invoking URL: " + urlResource);

            HttpsURLConnection httpsURLConnection;
            BufferedWriter bufferedWriter;
            OutputStream outputStream;

            httpsURLConnection = (HttpsURLConnection) urlResource.openConnection();
            httpsURLConnection.setDoInput(true);
            httpsURLConnection.setDoOutput(true);
            httpsURLConnection.setRequestMethod("POST");
            httpsURLConnection.setConnectTimeout(connectionTimeout);
            httpsURLConnection.setReadTimeout(readTimeout);
            setHeaders(httpsURLConnection);

            TlsUtil.logHttpReq(httpsURLConnection, body);

            // Explicitly call connect to be able to log the TLS features
            httpsURLConnection.connect();

            outputStream = httpsURLConnection.getOutputStream();
            bufferedWriter = new BufferedWriter(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8));
            bufferedWriter.write(body);
            bufferedWriter.flush();

            int responseCode = httpsURLConnection.getResponseCode();

            httpResponse.setStatusCode(responseCode);
            Log.debug("HTTP", "RESPONSE CODE: " + httpsURLConnection.getResponseCode());

            // Check the response code first

            InputStream inputStream;
            if (responseCode >= HttpsURLConnection.HTTP_BAD_REQUEST) {
                // Use getErrorStream() for 4xx/5xx errors
                inputStream = httpsURLConnection.getErrorStream();
                System.out.println("Error response code: " + responseCode);
            } else {
                // Use getInputStream() for successful responses (2xx)
                inputStream = httpsURLConnection.getInputStream();
                System.out.println("OK response code: " + responseCode);
            }

            String content = IO.readStringFormInputStream(inputStream, StandardCharsets.UTF_8);
            httpResponse.setContent(content);

            TlsUtil.logHttpRes(httpsURLConnection, httpResponse);

            outputStream.close();
            bufferedWriter.close();
            httpsURLConnection.disconnect();

        } catch (ConnectException ce) {
            Log.warn(TAG,"Error while connecting to SM-DP+: " + endpoint, ce);
            throw ce;
        } catch(Exception e) {
            Log.error(TAG,"Error while sending request to SM-DP+: " + endpoint, e);
            e.printStackTrace();
            if(propagateException) {
                throw new RuntimeException("Error while sending request to SM-DP+: " + endpoint);
            }
        }

        return httpResponse;
    }

    private void setHeaders(HttpsURLConnection httpURLConnection) {
        httpURLConnection.setRequestProperty("Content-Type", "application/json");
        httpURLConnection.setRequestProperty("Accept", "application/json");
        httpURLConnection.setRequestProperty("User-Agent", "gsma-rsp-lpad");
        httpURLConnection.setRequestProperty("X-Admin-Protocol", "gsma/rsp/v" + gsmaVersion);
    }
}
