package ee.nekoko.lpa.euicc.usbreader.drivers.ccid

import android.content.Context
import ee.nekoko.lpa.euicc.base.EuiccConnection
import ee.nekoko.lpa.euicc.usbreader.USBReaderInterface
import com.infineon.esim.util.Log
import ee.nekoko.lpa.euicc.base.EuiccSlot

class CCIDInterface(context: Context) : USBReaderInterface {
    private val ccidService: CCIDService
    private val euiccNames: MutableList<EuiccSlot>

    private var euiccConnection: EuiccConnection? = null

    init {
        Log.debug(TAG, "Constructor of CCIDReader.")

        this.ccidService = CCIDService(context)
        this.euiccNames = ArrayList()
    }

    override fun checkDevice(name: String): Boolean {
        return true
    }

    override fun isInterfaceConnected(): Boolean {
        var isConnected = false

        isConnected = ccidService.isConnected
        Log.debug(
            TAG,
            "Is CCID interface connected: $isConnected"
        )

        return isConnected
    }

    @Throws(Exception::class)
    override fun connectInterface(): Boolean {
        Log.debug(TAG, "Connecting CCID interface.")
        ccidService.connect()

        return ccidService.isConnected
    }

    @Throws(Exception::class)
    override fun disconnectInterface(): Boolean {
        Log.debug(TAG, "Disconnecting CCID interface.")

        if (euiccConnection != null) {
            euiccConnection!!.close()
            euiccConnection = null
        }

        ccidService.disconnect()
        euiccNames.clear()

        return !ccidService.isConnected
    }

    override fun refreshSlots(): List<EuiccSlot> {
        euiccNames.clear()
        euiccNames.addAll(ccidService.refreshSlots())
        return euiccNames
    }

    @Synchronized
    override fun getEuiccNames(): List<EuiccSlot> {
        return euiccNames
    }

    @Throws(Exception::class)
    override fun getEuiccConnection(euiccName: String): EuiccConnection {
        if (isNotYetOpen(euiccName)) {
            // Close the old eUICC connection if it is with another eUICC
            if (euiccConnection != null) {
                euiccConnection!!.close()
            }

            // Open new eUICC connection
            euiccConnection = ccidService.openEuiccConnection(euiccName)
        }

        return euiccConnection!!
    }

    private fun isNotYetOpen(euiccName: String): Boolean {
        return if (euiccConnection == null) {
            true
        } else {
            euiccConnection!!.euiccName != euiccName
        }
    }

    companion object {
        private val TAG: String = CCIDInterface::class.java.name
    }
}