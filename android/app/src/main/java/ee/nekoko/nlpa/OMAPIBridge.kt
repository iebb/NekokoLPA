package ee.nekoko.nlpa

import android.content.Context
import android.se.omapi.Channel
import android.se.omapi.SEService
import android.se.omapi.Session
import android.telephony.SubscriptionManager
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.gson.Gson
import java.io.IOException

fun ByteArray.toHex(): String = joinToString(separator = "") { eachByte -> "%02x".format(eachByte) }
fun hexStringToByteArray(hex: String): ByteArray {
    require(hex.length % 2 == 0) { "Hex string must have an even length" }

    return ByteArray(hex.length / 2) { i ->
        val index = i * 2
        hex.substring(index, index + 2).toInt(16).toByte()
    }
}

class OMAPIBridge @ReactMethod constructor(private val context: ReactContext?) : ReactContextBaseJavaModule() {
    override fun getName(): String {
        return "OMAPIBridge"
    }

    private lateinit var seService: SEService
    var channelMappings: MutableMap<String, Channel> = HashMap()


    init {
        seService = SEService(context as Context, { obj: Runnable -> obj.run() }, {
            emitData("readers", listReaders())
        })
    }


    fun listReaders(): List<Map<String, String>> {
        val result = mutableListOf<Map<String, String>>()
        Log.i(TAG,"SE List Readers:")
        if (seService.isConnected) {
            Log.i(TAG,"SE List ${seService.readers.size} Readers:")
            for (reader in seService.readers) {
                try {
                    var chan: Channel? = channelMappings[reader.name]
                    if (chan != null) {
                        try {
                            val response: ByteArray? = chan.getSelectResponse()
                        } catch (ex: Exception) {
                            channelMappings.remove(reader.name)
                            chan = null;
                        }
                    }

                    if (chan == null) {
                        var session: Session = reader.openSession()
                        Log.i(TAG, reader.name)
                        session.getATR()
                        chan = session.openLogicalChannel(
                            byteArrayOf(
                                0xA0.toByte(), 0x00, 0x00, 0x05, 0x59, 0x10, 0x10,
                                0xFF.toByte(), 0xFF.toByte(),
                                0xFF.toByte(), 0xFF.toByte(), 0x89.toByte(),
                                0x00, 0x00, 0x01, 0x00
                            )
                        )!!
                        Log.i(TAG, reader.name + " Opened Channel")
                        val response: ByteArray = chan.getSelectResponse()!!
                        Log.i(TAG,"Opened logical channel: ${response.toHex()}")
                        channelMappings[reader.name] = chan
                    }

                    val resp1 = chan.transmit(byteArrayOf(
                        0x81.toByte(), 0xE2.toByte(), 0x91.toByte(), 0x00.toByte(), 0x06.toByte(), 0xBF.toByte(), 0x3E.toByte(), 0x03.toByte(), 0x5C.toByte(), 0x01.toByte(), 0x5A.toByte()
                    ))
                    Log.i(TAG,"Transmit Response: ${resp1.toHex()}")
                    if (resp1[0] == 0xbf.toByte()) {
                        var eid = resp1.toHex().substring(10, 10 + 32)
                        Log.i(TAG,"EID: ${eid}")
                        result.add(hashMapOf("name" to reader.name, "eid" to eid, "available" to "true"))
                    } else {
                        result.add(hashMapOf("name" to reader.name, "available" to "false", "description" to "No EID Found"))
                    }
                } catch (e: SecurityException) {
                    Log.e(
                        TAG,
                        "Opening eUICC connection ${reader.name} failed. [java.lang.SecurityException]",
                        e
                    )
                    result.add(hashMapOf("name" to reader.name, "available" to "false", "description" to "ARA-M not supported"))
                    // throw e
                } catch (e: IOException) {
                    Log.e(
                        TAG,
                        "Opening eUICC connection ${reader.name} failed. [IO]",
                        e
                    )
                    result.add(hashMapOf("name" to reader.name, "available" to "false", "description" to "Card unavailable"))
                    // throw e
                } catch (e: NoSuchElementException) {
                    Log.e(
                        TAG,
                        "Opening eUICC connection ${reader.name} failed: NoSuchElementException [EX]",
                        e
                    )
                    // throw e
                } catch (e: Exception) {
                    Log.e(
                        TAG,
                        "Opening eUICC connection ${reader.name} failed. [EX]",
                        e
                    )
                    // throw e
                }



            }
            if (seService.readers.isEmpty()) {
                val subscriptionManager = SubscriptionManager.from(context);
                var simSlots = subscriptionManager.getActiveSubscriptionInfoCountMax();
                for (i in 1..simSlots) {
                    result.add(hashMapOf("name" to "SIM${i}", "available" to "false", "description" to "OMAPI not supported"))
                }
            }
        } else {
            result.add(hashMapOf("name" to "SIM", "available" to "false", "description" to "OMAPI not supported"))
        }
        return result;
    }

    fun emitData(key: String, value: Any?) {
        Log.d(TAG, "Emitting $key")
        while (context == null || !context.hasActiveReactInstance()) {
            Log.d(TAG, "Not ready!")
            Log.d(TAG, "Failed sending: $key")
            Thread.sleep(500)
        }
        val jsonData = Gson().toJson(value)
        val params = Arguments.createMap()
        params.putString(key, jsonData)
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("onDataUpdate", params)
    }


    @ReactMethod
    fun transmit(device: String, apdu: String): String {
        val chan = channelMappings[device] ?: return ""
//            result.error("READER_NOT_FOUND", "Reader not found", null)
//            return
        try {
            val resp = chan.transmit(hexStringToByteArray(apdu))
            return resp.toHex()
        } catch (e: Exception) {
            return ""
        }
    }


    companion object {
        private val TAG: String = OMAPIBridge::class.java.name
    }
}
