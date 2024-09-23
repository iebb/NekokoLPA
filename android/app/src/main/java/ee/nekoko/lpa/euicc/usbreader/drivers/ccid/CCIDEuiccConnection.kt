package ee.nekoko.lpa.euicc.usbreader.drivers.ccid

import ee.nekoko.lpa.euicc.EuiccConnectionSettings
import ee.nekoko.lpa.euicc.base.EuiccConnection
import ee.nekoko.lpa.euicc.base.generic.ISO7816Channel
import ee.nekoko.lpa.euicc.base.generic.ISO7816Channel.ApduTransmitter
import com.infineon.esim.util.Log


class CCIDEuiccConnection(private val reader: CCIDReader) : EuiccConnection, ApduTransmitter {
    private val iso7816Channel = ISO7816Channel(this)

    private var euiccConnectionSettings: EuiccConnectionSettings? = null

    override fun updateEuiccConnectionSettings(euiccConnectionSettings: EuiccConnectionSettings) {
        this.euiccConnectionSettings = euiccConnectionSettings
    }

    override fun getEuiccName(): String {
        return reader.name
    }


    @Throws(Exception::class)
    override fun open(): Boolean {
        // Open connection to card
        reader.connectCard()

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
            reader.disconnectCard()
        }
    }

    override fun isOpen(): Boolean {
        return reader.isConnected
    }

    @Throws(Exception::class)
    override fun resetEuicc(): Boolean {
        Log.debug(TAG, "Resetting card.")

        // Close (logical) channel
        iso7816Channel.closeChannel(euiccConnectionSettings)

        // Reset card
        reader.resetCard()

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
        return reader.transmitToCard(command)
    }

    @Throws(Throwable::class)
    protected fun finalize() {
        close()
    }

    companion object {
        private val TAG: String = CCIDEuiccConnection::class.java.name
    }
}