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

package ee.nekoko.lpa.euicc.se;

import android.se.omapi.Channel;
import android.se.omapi.Reader;
import android.se.omapi.Session;

import ee.nekoko.lpa.euicc.EuiccConnectionSettings;
import ee.nekoko.lpa.euicc.base.EuiccConnection;
import ee.nekoko.lpa.euicc.base.generic.Definitions;
import com.infineon.esim.util.Bytes;
import com.infineon.esim.util.Log;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class SeEuiccConnection implements EuiccConnection {
    private static final String TAG = SeEuiccConnection.class.getName();

    private final Reader reader;

    private Session session;
    private Channel channel;

    private EuiccConnectionSettings euiccConnectionSettings;

    public SeEuiccConnection(Reader reader) {
        this.reader = reader;
    }

    @Override
    public void updateEuiccConnectionSettings(EuiccConnectionSettings euiccConnectionSettings) {
        this.euiccConnectionSettings = euiccConnectionSettings;
    }

    @Override
    public String getEuiccName() {
        return reader.getName();
    }

    @Override
    public boolean resetEuicc() throws Exception {
        Log.debug(TAG, "Resetting the eUICC.");

        // Close the connection first
        close();

        // Wait for the phone to detect the profile change
        try {
            Thread.sleep(euiccConnectionSettings.getProfileInitializationTime());
        } catch (Exception e) {
            Log.error(Log.getFileLineNumber() + " " + e.getMessage());
        }

        // Open the connection again
        return open();
    }

    @Override
    public boolean open() throws Exception {
        Log.debug(TAG, "Opening connection for eUICC " + reader.getName());
        try {
            if (session == null || session.isClosed()) {
                Log.debug(TAG, "Opening a new session...");
                session = reader.openSession();
            }
            session.getATR(); // weird

            if (channel == null || !channel.isOpen()) {
                Log.debug(TAG, "Opening a new logical channel...");
                channel = session.openLogicalChannel(Bytes.decodeHexString(Definitions.ISDR_AID));
                if (channel != null) {
                    byte[] response = channel.getSelectResponse();
                    Log.debug(TAG, "Opened logical channel: " + Bytes.encodeHexString(response));
                } else {
                    Log.debug(TAG, "Open logical channel failed");
                    return false;
                }
            }
        } catch (IOException e) {
            Log.error(TAG, "Opening eUICC connection failed.", e);
            throw new Exception("Opening eUICC connection failed.", e);
        }

        if(channel != null) {
            return channel.isOpen();
        } else {
            return false;
        }
    }

    @Override
    public void close() {
        Log.debug(TAG, "Closing connection for eUICC " + reader.getName());

        if(isOpen()) {
            if (channel != null) {
                channel.close();
            }
            if (session != null) {
                session.close();
            }
        }
    }

    @Override
    public boolean isOpen() {
        if(channel == null) {
            return false;
        }

        return channel.isOpen();
    }


    @Override
    public List<String> transmitAPDUS(List<String> apdus) throws Exception {

        if(!isOpen()) {
            open();
        }
        List<String> responses = new ArrayList<>();

        for(String apdu : apdus) {
            byte[] command = Bytes.decodeHexString(apdu);

            byte[] response = channel.transmit(command);
            responses.add(Bytes.encodeHexString(response));
        }

        return responses;
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        close();
    }
}
