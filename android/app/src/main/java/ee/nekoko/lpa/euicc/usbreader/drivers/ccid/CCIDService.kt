package ee.nekoko.lpa.euicc.usbreader.drivers.ccid

import android.content.Context
import ee.nekoko.lpa.euicc.base.EuiccConnection
import ee.nekoko.lpa.euicc.base.EuiccService
import com.infineon.esim.util.Log


class CCIDService(context: Context) : EuiccService {
    private val CCIDCard = CCIDCard(context)

    private var ccidEuiccConnection: CCIDEuiccConnection? = null
    private var isConnected: Boolean

    init {
        this.isConnected = false
    }

    override fun refreshEuiccNames(): List<String> {
        Log.debug(TAG, "Refreshing CCID eUICC names...")
        return CCIDCard.readerNames
    }

    @Throws(Exception::class)
    override fun connect() {
        Log.debug(TAG, "Opening connection to CCID service...")
        CCIDCard.establishContext()

        isConnected = true
    }

    @Throws(Exception::class)
    override fun disconnect() {
        Log.debug(TAG, "Closing connection to CCID service...")
        CCIDCard.releaseContext()

        isConnected = false
    }

    override fun isConnected(): Boolean {
        return isConnected
    }

    override fun openEuiccConnection(euiccName: String): EuiccConnection {
        if (ccidEuiccConnection != null && euiccName == ccidEuiccConnection!!.euiccName) {
            Log.debug(TAG, "eUICC is already connected. Return existing eUICC connection.")
            return ccidEuiccConnection as CCIDEuiccConnection
        }

        ccidEuiccConnection = CCIDEuiccConnection(CCIDCard.readers.get(euiccName)!!)

        return ccidEuiccConnection!!
    }

    companion object {
        private val TAG: String = CCIDService::class.java.name
    }
}