package ee.nekoko.nlpa


fun ByteArray.toHex(): String = joinToString(separator = "") { eachByte -> "%02x".format(eachByte) }
fun hexStringToByteArray(hex: String): ByteArray {
    require(hex.length % 2 == 0) { "Hex string must have an even length" }

    return ByteArray(hex.length / 2) { i ->
        val index = i * 2
        hex.substring(index, index + 2).toInt(16).toByte()
    }
}
