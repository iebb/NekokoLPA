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

import android.content.Context;
import android.se.omapi.Reader;
import android.se.omapi.SEService;

import com.infineon.esim.util.Log;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.TimeoutException;

import ee.nekoko.lpa.euicc.base.EuiccConnection;
import ee.nekoko.lpa.euicc.base.EuiccInterfaceStatusChangeHandler;
import ee.nekoko.lpa.euicc.base.EuiccService;
import ee.nekoko.lpa.euicc.base.EuiccSlot;
import io.sentry.Sentry;

public class SeService implements EuiccService {
    private static final String TAG = SeService.class.getName();

    private final static String UICC_READER_PREFIX = "SIM";
    private static final long SERVICE_CONNECTION_TIME_OUT = 4000;

    private final Context context;
    private final Object seServiceMutex;

    private final EuiccInterfaceStatusChangeHandler handler;

    private SEService seService; // OMAPI / Secure Element

    private final HashMap<String, EuiccSlot> slots = new HashMap<>();

    public SeService(Context context, EuiccInterfaceStatusChangeHandler handler) {
        this.context = context;
        this.handler = handler;
        this.seServiceMutex = new Object();
    }

    public List<EuiccSlot> refreshSlots() {
        Log.debug(TAG, "[RS] Refreshing SE eUICC names...");
        List<EuiccSlot> euiccNames = new ArrayList<>();
        for(Reader reader : seService.getReaders()) {
            Log.debug(TAG, "Checking Reader..." + reader.getName());
            var result = getEuiccSlot(reader);
            if (result.getAvailable()) {
                euiccNames.add(result);
            }
        }
        return euiccNames;
    }

    public Reader[] getReaders() {
        return seService.getReaders();
    }

    public void connect() throws TimeoutException {
        Log.debug(TAG, "Opening connection to SE service...");

        // Initialize secure element if not available
        if (seService == null) {
            initializeConnection();
        }

        // Connect to secure element if connection is not already established
        if (seService.isConnected()) {
            Log.debug(TAG, "SE connection is already open.");
        } else {
            // Connect to secure element
            waitForConnection();
        }
    }

    public void disconnect() {
        Log.debug(TAG, "Closing connection to SE service...");

        if (seService != null && seService.isConnected()) {
            Log.debug(TAG, "Shutting down SE service.");
            seService.shutdown();
            seService = null;
        }
    }

    public boolean isConnected() {
        if(seService == null) {
            return false;
        } else {
            return seService.isConnected();
        }
    }

    private void initializeConnection() {
        Log.debug(TAG, "Initializing SE connection.");

        seService = new SEService(context, Runnable::run, () -> {
            Log.debug(TAG, "SE service is connected!");
            synchronized (seServiceMutex) {
                seServiceMutex.notify();
            }
        });
    }

    private void waitForConnection() throws TimeoutException {
        Log.debug(TAG, "Waiting for SE connection...");

        Timer connectionTimer = new Timer();
        connectionTimer.schedule(new TimerTask() {
            @Override
            public void run() {
                synchronized (seServiceMutex) {
                    seServiceMutex.notifyAll();
                }
            }
        }, SERVICE_CONNECTION_TIME_OUT);

        synchronized (seServiceMutex) {
            if (!seService.isConnected()) {
                try {
                    seServiceMutex.wait();
                } catch (InterruptedException e) {
                    Sentry.captureException(e);
                    Log.error(TAG, "SE service could not be waited for.", e);
                }
            }
            if (!seService.isConnected()) {
                throw new TimeoutException(
                        "SE Service could not be connected after "
                                + SERVICE_CONNECTION_TIME_OUT + " ms.");
            }
            connectionTimer.cancel();
        }
    }

    public EuiccConnection openEuiccConnection(String euiccName) throws Exception {
        if(!seService.isConnected()) {
            throw new Exception("Secure element is not connected.");
        }

        Reader[] readers = getReaders();
        if (readers.length == 0) {
            Log.error(TAG, "Cannot open session: no reader found from SE service.");
            throw new Exception("Cannot open session: no reader found from SE service.");
        }

        for (Reader reader : readers) {
            if (reader.getName().equals(euiccName)) {
                return getEuiccSlot(reader).getConnection();
            }
        }

        throw new Exception("No found reader matches with reader name \"" + euiccName + "\"");
    }

    private EuiccSlot getEuiccSlot(Reader reader) {
        try {
            var currentSlot = slots.get(reader.getName());
            EuiccConnection connection;
            if (currentSlot != null) {
                connection = currentSlot.getConnection();
            } else {
                connection = new SeEuiccConnection(reader);
            }

            Log.debug(TAG,"Reader name: " + reader.getName());
            var ret = new EuiccSlot(reader.getName(), true, "ok", connection);
            slots.put(reader.getName(), ret);
            return ret;
        } catch (java.lang.SecurityException e) {
            /* ARA-M not found */
            Log.debug(TAG,"[GET EUICC SLOT FAILED - SecurityException] " + e.toString());
            return new EuiccSlot(reader.getName(), false, "no_ara_m", null);
        } catch (Exception e) {
            Log.debug(TAG,"[GET EUICC SLOT FAILED] " + e.toString());
            Log.debug(TAG,"[SESSION FAILED] " + reader.getName());
        }
        return new EuiccSlot(reader.getName(), false, "", null);
    }
}
