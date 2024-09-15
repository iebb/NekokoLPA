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

package com.infineon.esim.lpa.euicc.usbreader.acs;

import android.content.Context;

import com.infineon.esim.lpa.euicc.base.EuiccConnection;
import com.infineon.esim.lpa.euicc.usbreader.USBReaderInterface;
import com.infineon.esim.util.Log;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

final public class ACSUSBReaderInterface implements USBReaderInterface {
    private static final String TAG = ACSUSBReaderInterface.class.getName();

    public static final List<String> READER_NAMES = new ArrayList<>(Arrays.asList(
            "CCID USB Reader"
    ));

    private final ACSService acsService;
    private final List<String> euiccNames;

    private EuiccConnection euiccConnection;

    public ACSUSBReaderInterface(Context context) {
        Log.debug(TAG, "Constructor of ACSReader.");

        this.acsService = new ACSService(context);
        this.euiccNames = new ArrayList<>();
    }

    public boolean checkDevice(String name)
    {
        return true;
        /*
        for(String validReaderName : READER_NAMES) {
            if (name.equals(validReaderName)) {
                return true;
            }
        }

        return false;

         */
    }

    @Override
    public boolean isInterfaceConnected() {
        boolean isConnected = false;

        isConnected = acsService.isConnected();
        Log.debug(TAG, "Is ACS interface connected: " + isConnected);

        return isConnected;
    }

    @Override
    public boolean connectInterface() throws Exception {
        Log.debug(TAG, "Connecting ACS interface.");
        acsService.connect();

        return acsService.isConnected();
    }

    @Override
    public boolean disconnectInterface() throws Exception {
        Log.debug(TAG, "Disconnecting ACS interface.");

        if(euiccConnection != null) {
            euiccConnection.close();
            euiccConnection = null;
        }

        acsService.disconnect();

        euiccNames.clear();

        return !acsService.isConnected();
    }

    @Override
    public List<String> refreshEuiccNames() {
        euiccNames.clear();

        if(isInterfaceConnected()) {
            euiccNames.addAll(acsService.refreshEuiccNames());
        }

        return euiccNames;
    }

    @Override
    public synchronized List<String> getEuiccNames() {
        return euiccNames;
    }

    @Override
    public EuiccConnection getEuiccConnection(String euiccName) throws Exception {

        if(isNotYetOpen(euiccName)) {
            // Close the old eUICC connection if it is with another eUICC
            if(euiccConnection != null) {
                euiccConnection.close();
            }

            // Open new eUICC connection
            euiccConnection = acsService.openEuiccConnection(euiccName);
        }

        return euiccConnection;
    }

    private boolean isNotYetOpen(String euiccName) {
        if(euiccConnection == null) {
            return true;
        } else {
            return !euiccConnection.getEuiccName().equals(euiccName);
        }
    }
}
