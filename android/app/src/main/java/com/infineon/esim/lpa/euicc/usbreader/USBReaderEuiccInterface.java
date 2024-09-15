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

package com.infineon.esim.lpa.euicc.usbreader;

import android.content.Context;

import com.infineon.esim.lpa.euicc.base.EuiccConnection;
import com.infineon.esim.lpa.euicc.base.EuiccInterface;
import com.infineon.esim.lpa.euicc.base.EuiccInterfaceStatusChangeHandler;
import com.infineon.esim.lpa.euicc.usbreader.acs.ACSUSBReaderInterface;
import com.infineon.esim.lpa.euicc.usbreader.identive.IdentiveUSBReaderInterface;
import com.infineon.esim.util.Log;

import java.util.ArrayList;
import java.util.List;

import ee.nekoko.nlpa.MainApplication;

final public class USBReaderEuiccInterface implements EuiccInterface {
    public static final String INTERFACE_TAG = "USB";
    private static final String TAG = USBReaderEuiccInterface.class.getName();
    private final EuiccInterfaceStatusChangeHandler euiccInterfaceStatusChangeHandler;
    private static ArrayList<USBReaderInterface> usbReaderInterfaces = new ArrayList<USBReaderInterface>();
    private static USBReaderInterface currentDriver;

    public USBReaderEuiccInterface(Context context, EuiccInterfaceStatusChangeHandler euiccInterfaceStatusChangeHandler) {
        Log.debug(TAG, "Constructor of USBReader.");

        currentDriver = null;

        this.euiccInterfaceStatusChangeHandler = euiccInterfaceStatusChangeHandler;

        // usbReaderInterfaces.add(new IdentiveUSBReaderInterface(context));
        usbReaderInterfaces.add(new ACSUSBReaderInterface(context));

        // Create BroadcastReceiver for USB attached/detached events
        USBReaderConnectionBroadcastReceiver USBReaderConnectionBroadcastReceiver = new USBReaderConnectionBroadcastReceiver(MainApplication.getAppContext(), onDisconnectCallback, this);
        USBReaderConnectionBroadcastReceiver.registerReceiver();
    }

    public static boolean checkDevice(String readerName) {
        for(USBReaderInterface eif : usbReaderInterfaces){
            if(eif.checkDevice(readerName)){
                currentDriver = eif;
                return true;
            }
        }
        return false;
    }

    @Override
    public String getTag() {
        return INTERFACE_TAG;
    }

    @Override
    public boolean isAvailable() {
        boolean isAvailable = USBReaderConnectionBroadcastReceiver.isDeviceAttached();

        Log.debug(TAG, "Checking if USB eUICC interface is available: " + isAvailable);

        return isAvailable;
    }

    @Override
    public boolean isInterfaceConnected() {
        boolean isConnected = false;
        if (isAvailable()) {
            if(currentDriver != null){
                isConnected = currentDriver.isInterfaceConnected();
            }
        }
        Log.debug(TAG, "Is USB interface connected: " + isConnected);
        return isConnected;
    }

    @Override
    public boolean connectInterface() throws Exception {
        boolean ret;

        Log.debug(TAG, "Connecting USB interface.");

        if(currentDriver == null){
            return false;
        }

        ret = currentDriver.connectInterface();
        if (ret) {
            euiccInterfaceStatusChangeHandler.onEuiccInterfaceConnected(INTERFACE_TAG);
        }

        return ret;
    }

    @Override
    public boolean disconnectInterface() throws Exception {
        Log.debug(TAG, "Disconnecting USB interface.");

        if(currentDriver == null){
            return false;
        }

        return currentDriver.disconnectInterface();
    }

    @Override
    public List<String> refreshEuiccNames() throws Exception {
        if(currentDriver == null){
            return new ArrayList<>();
        }
        return currentDriver.refreshEuiccNames();
    }

    @Override
    public synchronized List<String> getEuiccNames() {
        return currentDriver.getEuiccNames();
    }

    @Override
    public EuiccConnection getEuiccConnection(String euiccName) throws Exception {
        return currentDriver.getEuiccConnection(euiccName);
    }

    @SuppressWarnings("FieldCanBeLocal")
    private final USBReaderConnectionBroadcastReceiver.OnDisconnectCallback onDisconnectCallback = new USBReaderConnectionBroadcastReceiver.OnDisconnectCallback() {
        @Override
        public void onDisconnect() {
            Log.debug(TAG, "USB reader has been disconnected.");

            try {
                currentDriver.disconnectInterface();
            } catch (Exception e) {
                Log.error(TAG, "Catched exception during disconnecting interface.", e);
            }

            euiccInterfaceStatusChangeHandler.onEuiccInterfaceDisconnected(INTERFACE_TAG);
        }
    };
}
