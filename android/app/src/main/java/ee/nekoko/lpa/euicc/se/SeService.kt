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
package ee.nekoko.lpa.euicc.se

import android.content.Context
import android.se.omapi.Reader
import android.se.omapi.SEService
import com.infineon.esim.lpa.core.es10.Es10Interface
import com.infineon.esim.util.Log
import ee.nekoko.lpa.euicc.base.EuiccConnection
import ee.nekoko.lpa.euicc.base.EuiccInterfaceStatusChangeHandler
import ee.nekoko.lpa.euicc.base.EuiccService
import ee.nekoko.lpa.euicc.base.EuiccSlot
import io.sentry.Sentry
import java.util.Timer
import java.util.TimerTask
import java.util.concurrent.TimeoutException

class SeService(private val context: Context, private val handler: EuiccInterfaceStatusChangeHandler) : EuiccService {
    private val seServiceMutex = Any()

    private var seService: SEService? = null // OMAPI / Secure Element

    private val slots = HashMap<String, EuiccSlot>()

    override fun refreshSlots(): List<EuiccSlot> {
        Log.debug(TAG, "[RS] Refreshing SE eUICC names...")
        val euiccNames: MutableList<EuiccSlot> = ArrayList()
        for (reader in seService!!.readers) {
            try {
                Log.debug(TAG, "Checking Reader..." + reader.name)
                val result = getEuiccSlot(reader)
                if (result.available) {
                    euiccNames.add(result)
                }
            } finally {
            }
        }
        return euiccNames
    }

    val readers: Array<Reader>
        get() = seService!!.readers

    @Throws(TimeoutException::class)
    override fun connect() {
        Log.debug(TAG, "Opening connection to SE service...")

        // Initialize secure element if not available
        if (seService == null) {
            initializeConnection()
        }

        // Connect to secure element if connection is not already established
        if (seService!!.isConnected) {
            Log.debug(TAG, "SE connection is already open.")
        } else {
            // Connect to secure element
            waitForConnection()
        }
    }

    override fun disconnect() {
        Log.debug(TAG, "Closing connection to SE service...")

        if (seService != null && seService!!.isConnected) {
            Log.debug(TAG, "Shutting down SE service.")
            seService!!.shutdown()
            seService = null
        }
    }

    override fun isConnected(): Boolean {
        return if (seService == null) {
            false
        } else {
            seService!!.isConnected
        }
    }

    private fun initializeConnection() {
        Log.debug(TAG, "Initializing SE connection.")

        seService = SEService(context, { obj: Runnable -> obj.run() }, {
            Log.debug(TAG, "SE service is connected!")
            synchronized(seServiceMutex) {
                (seServiceMutex as Object).notify()
            }
        })
    }

    @Throws(TimeoutException::class)
    private fun waitForConnection() {
        Log.debug(TAG, "Waiting for SE connection...")

        val connectionTimer = Timer()
        connectionTimer.schedule(object : TimerTask() {
            override fun run() {
                synchronized(seServiceMutex) {
                    (seServiceMutex as Object).notifyAll()
                }
            }
        }, SERVICE_CONNECTION_TIME_OUT)

        synchronized(seServiceMutex) {
            if (!seService!!.isConnected) {
                try {
                    (seServiceMutex as Object).wait()
                } catch (e: InterruptedException) {
                    Sentry.captureException(e)
                    Log.error(TAG, "SE service could not be waited for.", e)
                }
            }
            if (!seService!!.isConnected) {
                throw TimeoutException(
                    "SE Service could not be connected after "
                            + SERVICE_CONNECTION_TIME_OUT + " ms."
                )
            }
            connectionTimer.cancel()
        }
    }

    @Throws(Exception::class)
    override fun openEuiccConnection(euiccName: String): EuiccConnection {
        if (!seService!!.isConnected) {
            throw Exception("Secure element is not connected.")
        }

        val readers = readers
        if (readers.size == 0) {
            Log.error(TAG, "Cannot open session: no reader found from SE service.")
            throw Exception("Cannot open session: no reader found from SE service.")
        }

        for (reader in readers) {
            if (reader.name == euiccName) {
                return getEuiccSlot(reader).connection!!
            }
        }

        throw Exception("No found reader matches with reader name \"$euiccName\"")
    }

    private fun getEuiccSlot(reader: Reader): EuiccSlot {
        try {
            val currentSlot = slots[reader.name]
            val connection = if (currentSlot != null) {
                currentSlot.connection
            } else {
                SeEuiccConnection(reader)
            }
            Log.debug(TAG, "Reader name: " + reader.name)
            val ret = EuiccSlot(reader.name, "ok", connection)
            slots[reader.name] = ret
            return ret
        } catch (e: SecurityException) {
            /* ARA-M not found */
            Log.debug(TAG, "[GET EUICC SLOT FAILED - SecurityException] $e")
            return EuiccSlot(reader.name, "no_ara_m", null)
        } catch (e: Exception) {
            Log.debug(TAG, "[GET EUICC SLOT FAILED] Cause: ${e.cause}")
            Log.debug(TAG, "[GET EUICC SLOT FAILED] Message: ${e.message}")
            Log.debug(TAG, "[SESSION FAILED] " + reader.name)
        }
        return EuiccSlot(reader.name, "", null)
    }

    companion object {
        private val TAG: String = SeService::class.java.name

        private const val UICC_READER_PREFIX = "SIM"
        private const val SERVICE_CONNECTION_TIME_OUT: Long = 4000
    }
}
