package ee.nekoko.lpa.euicc.usbreader.drivers.ccid

import android.content.Context
import ee.nekoko.lpa.euicc.base.EuiccConnection
import ee.nekoko.lpa.euicc.base.EuiccService
import com.infineon.esim.util.Log
import ee.nekoko.lpa.euicc.base.EuiccInterfaceStatusChangeHandler
import ee.nekoko.lpa.euicc.base.EuiccSlot


class CCIDService(context: Context, handler: EuiccInterfaceStatusChangeHandler) : EuiccService {
    private val cardReader = CCIDCard(context, handler)
    private var isConnected: Boolean

    init {
        this.isConnected = false
    }

    override fun refreshSlots(): List<EuiccSlot> {
        Log.debug(TAG, "Refreshing CCID eUICC names...")
        return cardReader.refreshSlots()
    }

    @Throws(Exception::class)
    override fun connect() {
        Log.debug(TAG, "Opening connection to CCID service...")
        cardReader.establishContext()
        isConnected = true
    }

    @Throws(Exception::class)
    override fun disconnect() {
        Log.debug(TAG, "Closing connection to CCID service...")
        cardReader.releaseContext()
        isConnected = false
    }

    override fun isConnected(): Boolean {
        return isConnected
    }

    override fun openEuiccConnection(euiccName: String): EuiccConnection {
        return cardReader.slots[euiccName]!!.connection!!
    }

    companion object {
        private val TAG: String = CCIDService::class.java.name
    }
}