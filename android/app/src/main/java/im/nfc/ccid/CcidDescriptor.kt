package im.nfc.ccid

data class CcidDescriptor(
    val protocols: Byte,
    val levelOfExchange: LevelOfExchange,
    val maxIFSD: Int,
    val maxSlot: Int,
    val voltage: Int,
    val rawDescriptors: String,
) {
    fun supportsProtocol(protocol: Protocol): Boolean {
        return (protocols.toInt() and protocol.value) > 0
    }
}

enum class Protocol(val value: Int) {
    T0(0x01),
    T1(0x02),
}

enum class LevelOfExchange(val value: Int) {
    TPDU(0x01),
    ShortAPDU(0x02),
    ExtendedAPDU(0x04),
}