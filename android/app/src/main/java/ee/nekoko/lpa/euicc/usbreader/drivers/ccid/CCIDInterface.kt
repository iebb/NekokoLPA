package ee.nekoko.lpa.euicc.usbreader.drivers.ccid

import android.content.Context
import com.infineon.esim.util.Log
import ee.nekoko.lpa.euicc.base.EuiccConnection
import ee.nekoko.lpa.euicc.base.EuiccInterface
import ee.nekoko.lpa.euicc.base.EuiccInterfaceStatusChangeHandler
import ee.nekoko.lpa.euicc.base.EuiccSlot
import ee.nekoko.lpa.euicc.usbreader.OnDisconnectCallback
import ee.nekoko.lpa.euicc.usbreader.USBReaderConnectionBroadcastReceiver
import ee.nekoko.nlpa.MainApplication.Companion.getAppContext

class CCIDInterface(context: Context, handler: EuiccInterfaceStatusChangeHandler) : EuiccInterface {
    private val ccidService: CCIDService
    private val euiccNames: MutableList<EuiccSlot>

    private var euiccConnection: EuiccConnection? = null

    private val onDisconnectCallback = OnDisconnectCallback {
        Log.debug(TAG, "USB reader has been disconnected.")
        handler.onEuiccRefresh(INTERFACE_TAG)
    }

    val receiver = USBReaderConnectionBroadcastReceiver(getAppContext(), onDisconnectCallback, this)

    init {
        Log.debug(TAG, "Constructor of CCIDReader.")

        this.ccidService = CCIDService(context, handler)
        this.euiccNames = ArrayList()
        receiver.registerReceiver()
    }

    override fun getTag(): String {
        return INTERFACE_TAG
    }

    override fun isAvailable(): Boolean {
        return receiver.isDeviceAttached()
    }

    fun checkDevice(device: String?): Boolean {
        return true
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
        const val INTERFACE_TAG: String = "USB"
    }
}