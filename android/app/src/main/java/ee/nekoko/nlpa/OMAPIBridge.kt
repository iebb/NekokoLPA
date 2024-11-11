package ee.nekoko.nlpa

import android.content.Context
import android.se.omapi.Channel
import android.se.omapi.SEService
import android.se.omapi.Session
import android.telephony.SubscriptionManager
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.gson.Gson
import java.io.IOException


class OMAPIBridge @ReactMethod constructor(private val context: ReactContext?) : ReactContextBaseJavaModule() {
    override fun getName(): String {
        return "OMAPIBridge"
    }

    private lateinit var seService: SEService
    var channelMappings: MutableMap<String, Channel> = HashMap()
    var sessionMappings: MutableMap<String, Session> = HashMap()


    init {
        seService = SEService(context as Context, { obj: Runnable -> obj.run() }, {
            // emitData("readers", )
        })
    }

    protected fun addActivityEventListener(listener: ActivityEventListener?) {
        // eventListeners.add(listener)
    }

    protected fun removeActivityEventListener(listener: ActivityEventListener?) {
        Log.i(TAG, "Shutdown, clearing connections")
        for (reader in seService.readers) {
            sessionMappings[reader.name]?.closeChannels()
            channelMappings[reader.name]?.close()
            sessionMappings[reader.name]?.close()
        }
        channelMappings.clear()
        sessionMappings.clear()
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
                            Log.e(TAG, "Select Failed, removing channel", ex)
                            channelMappings.remove(reader.name)
                            chan = null;
                        }
                    }

                    if (chan == null) {
                        if (sessionMappings[reader.name] != null) {
                            sessionMappings[reader.name]?.closeChannels()
                            sessionMappings[reader.name]?.close()
                        }
                        val session: Session = reader.openSession()
                        session.closeChannels()
                        sessionMappings[reader.name] = session
                        val atr = session.getATR()
                        Log.i(TAG, reader.name)
                        Log.i(TAG, reader.name + " ATR: " + atr + " Session: " + session)
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
                } catch (e: NullPointerException) {
                    Log.e(
                        TAG,
                        "Opening eUICC connection ${reader.name} failed. [NP] Message: ${e.message}",
                        e
                    )
                    result.add(hashMapOf("name" to reader.name, "available" to "false", "description" to "Unable to open a connection"))
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

    fun restartChannel(rr: String): Boolean {
        if (seService.isConnected) {
            for (reader in seService.readers) {
                if (reader.name != rr) continue
                sessionMappings[reader.name]?.closeChannels()
                channelMappings[reader.name]?.close()
                sessionMappings[reader.name]?.close()


                try {

                    val session: Session = reader.openSession()
                    session.closeChannels()
                    sessionMappings[reader.name] = session
                    val atr = session.getATR()
                    Log.i(TAG, reader.name)
                    Log.i(TAG, reader.name + " ATR: " + atr + " Session: " + session)
                    val chan = session.openLogicalChannel(
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

                    val resp1 = chan.transmit(byteArrayOf(
                        0x81.toByte(), 0xE2.toByte(), 0x91.toByte(), 0x00.toByte(), 0x06.toByte(), 0xBF.toByte(), 0x3E.toByte(), 0x03.toByte(), 0x5C.toByte(), 0x01.toByte(), 0x5A.toByte()
                    ))
                    Log.i(TAG,"Transmit Response: ${resp1.toHex()}")
                    if (resp1[0] == 0xbf.toByte()) {
                        var eid = resp1.toHex().substring(10, 10 + 32)
                        Log.i(TAG,"EID: ${eid}")
                        return true
                    }
                } catch (e: SecurityException) {
                    Log.e(
                        TAG,
                        "Opening eUICC connection ${reader.name} failed. [java.lang.SecurityException]",
                        e
                    )
                    // throw e
                } catch (e: IOException) {
                    Log.e(
                        TAG,
                        "Opening eUICC connection ${reader.name} failed. [IO]",
                        e
                    )
                    // throw e
                } catch (e: NullPointerException) {
                    Log.e(
                        TAG,
                        "Opening eUICC connection ${reader.name} failed. [NP] Message: ${e.message}",
                        e
                    )
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

        }
        return false
    }

    fun emitData(key: String, value: Any?) { // reserved for native errors
        Log.d(TAG, "Emitting $key = $value")
        if (context == null || !context.hasActiveReactInstance()) {
            Log.d(TAG, "Not ready!")
            Log.d(TAG, "Failed sending: $key")
            return
        }
        val jsonData = Gson().toJson(value)
        val params = Arguments.createMap()
        params.putString(key, jsonData)
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("onDataUpdate", params)
    }


    @ReactMethod
    fun listDevices(promise: Promise) {
        Thread {
            try {
                promise.resolve(Gson().toJson(listReaders()))
            } catch (e: Exception) {
                Log.e(TAG, "Exception: $e", e)
                promise.reject("LIST_ERROR", "Error message", e)
            }
        }.start()
    }

    @ReactMethod
    fun transceive(device: String, apdu: String, promise: Promise) {
        Thread {
            var chan = channelMappings[device]
            if (chan == null) {
                promise.reject("NO_SUCH_CHANNEL", "No such channel")
            } else {
                try {
                    val resp = chan.transmit(hexStringToByteArray(apdu))
                    promise.resolve(resp.toHex())
                } catch (e: Exception) {
                    when(e) {
                        is IllegalStateException, is IOException -> {
                            for (i in 1..10) {
                                Log.e(TAG, "Restarting Channel, count $i")
                                val result = restartChannel(device)
                                if (result) {
                                    try {
                                        chan = channelMappings[device]
                                        val resp = chan!!.transmit(hexStringToByteArray(apdu))
                                        promise.resolve(resp.toHex())
                                        return@Thread
                                    } catch (e: IllegalStateException) {
                                        Thread.sleep((500 * i).toLong())
                                    } catch (e: IOException) {
                                        Thread.sleep((500 * i).toLong())
                                    }
                                } else {

                                    Thread.sleep((500 * i).toLong())
                                }
                            }
                            Log.e(TAG, "Exception: $e", e)
                            promise.reject("TRANSMIT_ERROR", "Error message", e)
                        }
                        else ->  {
                            Log.e(TAG, "Exception: $e", e)
                            promise.reject("TRANSMIT_ERROR", "Error message", e)
                        }
                    }
                }
            }
        }.start()
    }


    companion object {
        private val TAG: String = OMAPIBridge::class.java.name
    }
}
