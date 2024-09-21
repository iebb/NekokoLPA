package ee.nekoko.lpa.ccid

import com.infineon.esim.lpa.euicc.EuiccConnectionSettings
import com.infineon.esim.lpa.euicc.base.EuiccConnection
import com.infineon.esim.lpa.euicc.base.generic.ISO7816Channel
import com.infineon.esim.lpa.euicc.base.generic.ISO7816Channel.ApduTransmitter
import com.infineon.esim.util.Log


class CCIDEuiccConnection(private val CCIDCard: CCIDCard, private val euiccName: String) : EuiccConnection, ApduTransmitter {
    private val iso7816Channel = ISO7816Channel(this)

    private var euiccConnectionSettings: EuiccConnectionSettings? = null

    override fun updateEuiccConnectionSettings(euiccConnectionSettings: EuiccConnectionSettings) {
        this.euiccConnectionSettings = euiccConnectionSettings
    }

    override fun getEuiccName(): String {
        return euiccName
    }


    @Throws(Exception::class)
    override fun open(): Boolean {
        Log.debug(TAG, "Opening Identive interface...")

        // Open connection to card
        CCIDCard.connectCard(euiccName)

        // Open (logical) channel to ISD-R
        iso7816Channel.openChannel(euiccConnectionSettings)

        Log.debug(
            TAG,
            "Opening Identive interface result: $isOpen"
        )
        return isOpen
    }

    @Throws(Exception::class)
    override fun close() {
        Log.debug(TAG, "Closing Identive eUICC connection...")
        if (isOpen) {
            // Close (logical) channel
            iso7816Channel.closeChannel(euiccConnectionSettings)

            // Disconnect card
            CCIDCard.disconnectCard()
        }
    }

    override fun isOpen(): Boolean {
        return CCIDCard.isConnected
    }

    @Throws(Exception::class)
    override fun resetEuicc(): Boolean {
        Log.debug(TAG, "Resetting card.")

        // Close (logical) channel
        iso7816Channel.closeChannel(euiccConnectionSettings)

        // Reset card
        CCIDCard.resetCard()

        // Open (logical) channel
        iso7816Channel.openChannel(euiccConnectionSettings)

        return isOpen
    }

    @Throws(Exception::class)
    override fun transmitAPDUS(apdus: List<String>): List<String> {
        if (!isOpen) {
            open()
        }

        Log.debug(TAG, "transmitAPDUS: $apdus")
        return iso7816Channel.transmitAPDUS(apdus)
    }

    @Throws(Exception::class)
    override fun transmit(command: ByteArray): ByteArray {
        return CCIDCard.transmitToCard(command)
    }

    @Throws(Throwable::class)
    protected fun finalize() {
        close()
    }

    companion object {
        private val TAG: String = CCIDEuiccConnection::class.java.name
    }
}