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

package com.infineon.esim.lpa.util.android;

import android.net.ConnectivityManager;
import android.net.Network;

import androidx.annotation.NonNull;

import com.infineon.esim.util.Log;

import ee.nekoko.nlpa.MainApplication;

public class NetworkStatus {
    private static final String TAG = NetworkStatus.class.getName();

    private static boolean isNetworkAvailable;

    public static void registerNetworkCallback() {
        ConnectivityManager connectivityManager = MainApplication.getConnectivityManager();
        connectivityManager.registerDefaultNetworkCallback(new ConnectivityManager.NetworkCallback(){
            @Override
            public void onAvailable(@NonNull Network network) {
                Log.debug(TAG, "Network now available.");
                isNetworkAvailable = true;
                super.onAvailable(network);
            }

            @Override
            public void onLosing(@NonNull Network network, int maxMsToLive) {
                Log.debug(TAG, "Network now losing.");
                isNetworkAvailable = false;
                super.onLosing(network, maxMsToLive);
            }

            @Override
            public void onLost(@NonNull Network network) {
                Log.debug(TAG, "Network now lost.");
                isNetworkAvailable = false;
                super.onLost(network);
            }

            @Override
            public void onUnavailable() {
                Log.debug(TAG, "Network now unavailable.");
                isNetworkAvailable = false;
                super.onUnavailable();
            }
        });
    }

    public static boolean isNetworkAvailable() {
        return isNetworkAvailable;
    }
}
