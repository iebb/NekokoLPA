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

import android.annotation.SuppressLint;

import com.infineon.esim.lpa.core.es9plus.messages.HttpResponse;
import com.infineon.esim.util.Log;

import java.net.HttpURLConnection;
import java.security.KeyStore;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLPeerUnverifiedException;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

public class TlsUtil {
    private static final String TAG = TlsUtil.class.getName();

    private static List<Certificate> liveCertificates;
    private static List<Certificate> testCertificates;

    private static boolean trustTestCertificates;

    public static void initializeCertificates(List<Certificate> liveCertificates, List<Certificate> testCertificates) {
        TlsUtil.liveCertificates = liveCertificates;
        TlsUtil.testCertificates = testCertificates;
    }

    public static void setTrustLevel(boolean trustTestCertificates) {
        Log.debug(TAG, "Setting trust level to trust test certificates: " + trustTestCertificates);
        TlsUtil.trustTestCertificates = trustTestCertificates;
    }

    // Reference: https://developer.android.com/training/articles/security-ssl
    public static void trustRootCas() {
        try {

            // Get Root CA certificates from resource
            List<Certificate> rootCaCertificates = new ArrayList<>(liveCertificates);
            if(trustTestCertificates) {
                rootCaCertificates.addAll(testCertificates);
            }

            // Create a KeyStore containing our trusted CAs
            KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
            keyStore.load(null, null);

            // Add root CA certificates to keyStore object
            for(int i = 0; i < rootCaCertificates.size(); i++) {
                Certificate rootCaCertificate = rootCaCertificates.get(i);
                Log.info(TAG, " - Root CA certificate #" + i + ": " + ((X509Certificate) rootCaCertificate).getSubjectDN());
                keyStore.setCertificateEntry("ca" + i, rootCaCertificate);
            }

            // Create a TrustManager that trusts the CAs in our KeyStore
            TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            trustManagerFactory.init(keyStore);

            // Create an SSLContext that uses our TrustManager
            SSLContext sslContext = SSLContext.getInstance("TLS");
            // Use TrustManager and default SecureRandom implementation
            sslContext.init(null, trustManagerFactory.getTrustManagers(), null);

            // Set it as the default SSL socket factory
            HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory());
        } catch (Exception e) {
            Log.error(TAG,"Error: Loading Root CAs as TLS trust anchor failed.", e);
        }
    }

    // This is very dangerous, use only for internal testing:
    // Reference: https://stackoverflow.com/questions/2642777/trusting-all-certificates-using-httpclient-over-https/6378872#6378872
    @SuppressLint("CustomX509TrustManager")
    public static void trustEveryone() {
        try {
            HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null,
                    new X509TrustManager[]{
                            new X509TrustManager(){
                        @SuppressLint("TrustAllX509TrustManager")
                        public void checkClientTrusted(X509Certificate[] chain,
                                                       String authType) {}
                        @SuppressLint("TrustAllX509TrustManager")
                        public void checkServerTrusted(X509Certificate[] chain,
                                                       String authType) {}
                        public X509Certificate[] getAcceptedIssuers() {
                            return new X509Certificate[0];
                        }}},
                    null);
            HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory());
        } catch (Exception e) {
            Log.error(TAG,"Error: Loading Root CAs as TLS trust anchor failed.", e);
        }
    }

    public static void logTlsFeatures(HttpURLConnection httpURLConnection) {
        HttpsURLConnection httpsURLConnection;

        // Check if HTTP connection is a HTTPS connection
        if(httpURLConnection instanceof HttpsURLConnection) {
            httpsURLConnection = (HttpsURLConnection) httpURLConnection;
        } else {
            return;
        }

        Log.verbose(TAG, " - TLS Session Details: ");
        Log.verbose(TAG, "     Cipher Suite: " + httpsURLConnection.getCipherSuite());

        try {
            Certificate[] localCertificates = httpsURLConnection.getLocalCertificates();
            for (Certificate clientCertificate : localCertificates) {
                Log.verbose(TAG, "     Client Certificate: " + clientCertificate.toString());
            }
        } catch (Exception e) {
            Log.verbose(TAG, "     No Client Certificate used.");
        }

        try {
            Certificate[] serverCertificates = httpsURLConnection.getServerCertificates();

            for (Certificate certificate : serverCertificates) {
                Log.verbose(TAG, "     Server Certificate: " + certificate.toString());
            }
        } catch (SSLPeerUnverifiedException e) {
            Log.error(TAG, "Error: SSLPeerUnverifiedException during HTTPS request.", e);
        }
    }

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