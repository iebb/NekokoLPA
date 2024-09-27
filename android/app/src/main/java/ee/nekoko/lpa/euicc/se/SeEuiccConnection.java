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

import ee.nekoko.lpa.euicc.base.EuiccConnection;
import ee.nekoko.lpa.euicc.base.generic.Definitions;
import io.sentry.Sentry;
import io.sentry.SentryEvent;
import io.sentry.SentryLevel;
import io.sentry.protocol.Message;

import com.infineon.esim.lpa.lpa.task.DownloadTask;
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

    public SeEuiccConnection(Reader reader) {
        this.reader = reader;
    }

    @Override
    public String getEuiccName() {
        return reader.getName();
    }

    @Override
    public boolean resetEuicc() throws Exception {
        Log.debug(TAG, "Resetting the eUICC.");
        close();
        return open();
    }

    public boolean _open() throws Exception {
        Log.debug(TAG, "Opening connection for eUICC " + reader.getName());

        try {
            if (session == null || session.isClosed()) {
                Log.debug(TAG, "Opening a new session...");
            }
            session = reader.openSession();
            session.getATR(); // weird

            if (channel == null || !channel.isOpen()) {
                Log.debug(TAG, "Opening a new logical channel...");
                channel = session.openLogicalChannel(Bytes.decodeHexString(Definitions.ISDR_AID));
                Log.debug(TAG, "Session: " + session.toString());
                Log.debug(TAG, "Channel: " + channel.toString());
                if (channel != null) {
                    byte[] response = channel.getSelectResponse();
                    Log.debug(TAG, "Opened logical channel: " + Bytes.encodeHexString(response));
                } else {
                    Log.debug(TAG, "Open logical channel failed");
                    return false;
                }
            }

        } catch (IOException e) {
            Log.error(TAG, "Opening eUICC connection failed. [IO]", e);
            Thread.sleep(500);
            return open();
        } catch (java.lang.SecurityException e) {
            Log.error(TAG, "Opening eUICC connection failed. [java.lang.SecurityException]", e);
            Log.error(TAG, "NO ARA-M", e);
            throw e;
        } catch (Exception e) {
            Log.error(TAG, "Opening eUICC connection failed. [EX]", e);
            throw e;
        }


        if (channel == null || !channel.isOpen()) {
            return false;
        }
        return true;
    }

    @Override
    public boolean open() throws Exception {
        for (var i = 0; i < 2; i++) {
            try {
                var result = _open();
                if (result) {
                    return true;
                }
            } catch (IOException e) {
                Sentry.captureException(e);
                // Log.error(Log.getFileLineNumber() + " " + e.getMessage());
            } catch (java.security.AccessControlException e) {
                Sentry.captureException(e);
                Log.error(Log.getFileLineNumber() + " " + e.getMessage());
                break;
            } catch (Exception e) {
                Sentry.captureException(e);
                Log.error(Log.getFileLineNumber() + " " + e.getMessage());
            }
            Thread.sleep(500);
        }
        return false;
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
