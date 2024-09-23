package ee.nekoko.lpa.euicc.usbreader.drivers.ccid

import im.nfc.ccid.Ccid

data class CCIDReader (
    var name: String,
    var deviceName: String,
    var interfaceIdx: Int,
    var ccid: Ccid?,
) {

    @Throws(Exception::class)
    fun transmitToCard(command: ByteArray): ByteArray {
        if (ccid == null) {
            throw Exception("CCID_READER_NOT_CONNECTED")
        }
        val resp = ccid!!.xfrBlock(command)
        return resp
    }

    fun disconnectCard() {
        ccid = null
    }

}