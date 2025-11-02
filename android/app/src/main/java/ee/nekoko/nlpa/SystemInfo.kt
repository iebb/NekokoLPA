package ee.nekoko.nlpa

import android.content.Context
import android.content.pm.PackageManager
import java.security.MessageDigest

fun bytesToHex(bytes: ByteArray): String {
    val hexArray = charArrayOf('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F')
    val hexChars = CharArray(bytes.size * 2)
    var v: Int
    for (j in bytes.indices) {
        v = bytes[j].toInt() and 0xFF
        hexChars[j * 2] = hexArray[v.ushr(4)]
        hexChars[j * 2 + 1] = hexArray[v and 0x0F]
    }
    return String(hexChars)
}

class SystemInfo(val context: Context) {

    fun signatureList(): List<String> {
        val sig = context.packageManager.getPackageInfo(context.packageName, PackageManager.GET_SIGNING_CERTIFICATES).signingInfo
        return if (sig!!.hasMultipleSigners()) {
            // Send all with apkContentsSigners
            sig.apkContentsSigners.map {
                val digest = MessageDigest.getInstance("SHA")
                digest.update(it.toByteArray())
                bytesToHex(digest.digest())
            }
        } else {
            // Send one with signingCertificateHistory
            sig.signingCertificateHistory.map {
                val digest = MessageDigest.getInstance("SHA")
                digest.update(it.toByteArray())
                bytesToHex(digest.digest())
            }
        }
    }
}
