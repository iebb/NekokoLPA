package ee.nekoko.nlpa

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.se.omapi.Channel
import android.se.omapi.Reader
import android.se.omapi.SEService
import android.se.omapi.Session
import android.telephony.SubscriptionManager
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.gson.Gson
import ee.nekoko.nlpa_utils.hexStringToByteArray
import ee.nekoko.nlpa_utils.toHex
import java.io.IOException
import java.io.PrintWriter
import java.io.StringWriter

val commonStkNames: Array<String> = arrayOf(
    "com.android.stk/.StkMain",
    "com.android.stk/.StkMainHide",
    "com.android.stk/.StkListActivity",
    "com.android.stk/.StkLauncherListActivity",
)

val commonSlotStkName: Map<String, Array<String>> = mapOf(
    Pair("SIM1", arrayOf(
        "com.android.stk/.StkMain1",
        "com.android.stk/.PrimaryStkMain",
        "com.android.stk/.StkLauncherActivity",
        "com.android.stk/.StkLauncherActivity_Chn",
        "com.android.stk/.StkLauncherActivityI",
        "com.android.stk/.OppoStkLauncherActivity1",
        "com.android.stk/.OplusStkLauncherActivity1",
        "com.android.stk/.mtk.StkLauncherActivityI",
    )),
    Pair("SIM2", arrayOf(
        "com.android.stk/.StkMain2",
        "com.android.stk/.SecondaryStkMain",
        "com.android.stk/.StkLauncherActivity2",
        "com.android.stk/.StkLauncherActivityII",
        "com.android.stk/.OppoStkLauncherActivity2",
        "com.android.stk/.OplusStkLauncherActivity2",
        "com.android.stk/.mtk.StkLauncherActivityII",
        "com.android.stk1/.StkLauncherActivity",
        "com.android.stk2/.StkLauncherActivity",
        "com.android.stk2/.StkLauncherActivity_Chn",
        "com.android.stk2/.StkLauncherActivity2",
    )),
)

class OMAPIBridge @ReactMethod constructor(private val context: ReactContext) : ReactContextBaseJavaModule(), LifecycleEventListener  {
    override fun getName(): String {
        return "OMAPIBridge"
    }

    var aidListDefault = "A06573746B6D65FFFFFFFF4953442D52,A0000005591010FFFFFFFF8900000100,A0000005591010FFFFFFFF8900050500,A0000005591010000000008900000300,A0000005591010FFFFFFFF8900000177";

    init {
        context.addLifecycleEventListener(this);
    }

    private var seService: SEService = SEService(context as Context, { obj: Runnable -> obj.run() }, {
        // emitData("readers", )
    })
    var channelMappings: MutableMap<String, Channel> = HashMap()
    var sessionMappings: MutableMap<String, Session> = HashMap()

    protected fun addActivityEventListener(listener: ActivityEventListener?) {
        Log.i(TAG, "addActivityEventListener called")
    }

    protected fun removeActivityEventListener(listener: ActivityEventListener?) {
        Log.i(TAG, "removeActivityEventListener called")
    }


    override fun onHostPause() {
        for(chan in channelMappings.values) {
            chan.close()
        }
        for(sess in sessionMappings.values) {
            sess.closeChannels()
        }
        for (reader in seService.readers) {
            reader.closeSessions()
        }
        Log.e(TAG, "Terminating all connections")
        Log.e(TAG, "Host paused")
    }

    override fun onHostResume() {
        Log.e(TAG, "$channelMappings length: ${channelMappings.size}")
        Log.e(TAG, "Host resumed")
    }
    override fun onHostDestroy() {
        Log.e(TAG, "Host destroyed")
    }

    fun openLogicalChannel(reader: Reader, aids: List<String>): Channel? {
        try {
            sessionMappings[reader.name]?.closeChannels()
            sessionMappings[reader.name]?.close()
            reader.closeSessions()
            val session = reader.openSession()
            sessionMappings[reader.name] = session
            Log.i(TAG, "${reader.name} ATR: ${session.getATR()} Session: $session")

            for (aid in aids) {
                try {
                    Log.i(TAG, "Opening eUICC connection ${reader.name} with AID $aid")
                    return session.openLogicalChannel(hexStringToByteArray(aid))?.also {
                        Log.i(TAG, "${reader.name} Opened Channel: $it")
                        channelMappings[reader.name] = it
                    }
                } catch (e: NoSuchElementException) {
                    Log.e(TAG, "Opening eUICC connection ${reader.name} with AID $aid failed. Trying next AID")
                    Thread.sleep(300)
                }
            }
        } catch (e: IOException) {
            throw e
        } catch (e: Exception) {
            Log.e(TAG, "Opening eUICC connection ${reader.name} failed.", e)
            throw e
        }
        return null
    }

    fun listReaders(aidList: String): List<Map<String, String>> {
        aidListDefault = aidList
        var aids = aidListDefault.split(",")
        val result = mutableListOf<Map<String, String>>()
        val signatureList = SystemInfo(context as Context).signatureList().joinToString(",")
        Log.e(TAG, "SE List Readers: $channelMappings length: ${channelMappings.size}")
        if (seService.isConnected) {
            Log.i(TAG,"SE List ${seService.readers.size} Readers:")
            for (reader in seService.readers) {
                Log.i(TAG, "SE Reader: " + reader.name)
                if (!reader.name.startsWith("SIM")) continue
                try {
                    var chan = channelMappings[reader.name] ?: openLogicalChannel(reader, aids)
                    if (chan == null) {
                        result.add(mapOf("name" to reader.name, "available" to "false", "description" to "Open Channel Failed"))
                        continue
                    }

                    var resp1 : ByteArray
                    try {
                        resp1 = chan.transmit(hexStringToByteArray("81E2910006BF3E035C015A"))
                    } catch (e: IllegalStateException) {
                        Log.e(
                            TAG,
                            "Channel is closed. Reopen it now.",
                            e
                        )
                        chan = openLogicalChannel(reader, aids)
                        if (chan == null) {
                            result.add(mapOf("name" to reader.name, "available" to "false", "description" to "Open Channel Failed"))
                            continue
                        }
                        resp1 = chan.transmit(hexStringToByteArray("81E2910006BF3E035C015A"))
                    }


                    Log.i(TAG,"Transmit Response: ${resp1.toHex()}")
                    if (resp1[0] == 0xbf.toByte()) {
                        val eid = resp1.toHex().substring(10, 10 + 32)
                        Log.i(TAG, "EID: ${eid}")
                        result.add(hashMapOf("name" to reader.name, "eid" to eid, "slotAvailable" to "true", "available" to "true"))
                    } else {
                        result.add(hashMapOf("name" to reader.name, "available" to "false", "slotAvailable" to "true", "description" to "No EID Found", "signatures" to signatureList))
                    }
                } catch (e: SecurityException) {
                    Log.e(
                        TAG,
                        "Opening eUICC connection ${reader.name} failed. [java.lang.SecurityException]",
                        e
                    )
                    result.add(hashMapOf("name" to reader.name, "available" to "false", "slotAvailable" to "true", "description" to "ARA-M not supported", "signatures" to signatureList))
                    // throw e
                } catch (e: IOException) {
                    Log.e(
                        TAG,
                        "Opening eUICC connection ${reader.name} failed. [IO]",
                        e
                    )
                    result.add(hashMapOf("name" to reader.name, "available" to "false", "description" to "Card unavailable", "signatures" to signatureList))
                    // throw e
                } catch (e: NullPointerException) {
                    Log.e(
                        TAG,
                        "Opening eUICC connection ${reader.name} failed. [NP] Message: ${e.message}",
                        e
                    )
                    var sw = StringWriter()
                    e.printStackTrace(PrintWriter(sw));
                    result.add(hashMapOf("name" to reader.name, "available" to "false", "description" to "Unable to open a connection", "stack" to sw.toString(), "signatures" to signatureList))
                    // throw e
                } catch (e: NoSuchElementException) {
                    Log.e(
                        TAG,
                        "Opening eUICC connection ${reader.name} failed: NoSuchElementException [EX]",
                        e
                    )
                    result.add(hashMapOf("name" to reader.name, "available" to "false", "description" to "Secure Element not found", "signatures" to signatureList))
                    // throw e
                } catch (e: Exception) {
                    Log.e(
                        TAG,
                        "Opening eUICC connection ${reader.name} failed. [EX]",
                        e
                    )
                    result.add(hashMapOf("name" to reader.name, "available" to "false", "description" to e.message.toString(), "signatures" to signatureList))
                    // throw e
                }
            }
            if (seService.readers.filter { it.name.startsWith("SIM") }.isEmpty()) {
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


    fun connectChannel(readerName: String): Boolean {
        val aids = aidListDefault.split(",")
        try {
            return seService.readers.find { it.name == readerName }?.let { reader ->
                openLogicalChannel(reader, aids) != null
            } ?: false
        }  catch (e: Exception) {
            return false
        }
    }


    @ReactMethod
    fun openSTK(device: String) {
        if (commonSlotStkName.containsKey(device)) {
            val intentArray = commonSlotStkName[device]!!.plus(commonStkNames)
            for (componentName in intentArray) {
                try {
                    val intent = Intent().apply {
                        component = ComponentName.unflattenFromString(componentName)
                    }

                    // Check if the intent resolves to a valid activity
                    val packageManager: PackageManager = (context as Context).packageManager
                    val activities = packageManager.queryIntentActivities(intent, 0)

                    if (activities.isNotEmpty()) {
                        // If the activity is available, start the intent
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        (context as Context).startActivity(intent)
                        Log.d("IntentLauncher", "Launched: $componentName")
                        return // Exit after launching the first available intent
                    }
                } catch (e: Exception) {
                    Log.e("IntentLauncher", "Error launching intent: $componentName", e)
                }
            }
        }
    }

    @ReactMethod
    fun listDevices(aidList: String, promise: Promise) {
        Thread {
            try {
                promise.resolve(Gson().toJson(listReaders(aidList)))
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
                Log.e(TAG, "Restarting channel $device")
                if (connectChannel(device)) {
                    chan = channelMappings[device]
                }
            }
            if (chan == null) {
                promise.reject("NO_SUCH_CHANNEL", "No such channel")
            } else {
                try {
                    val resp = chan.transmit(hexStringToByteArray(apdu))
                    if (resp.toHex() == "6881") {
                        Log.e(TAG, "Channel is actually closed.")
                        throw IOException()
                    }
                    promise.resolve(resp.toHex())
                } catch (e: Exception) {
                    when(e) {
                        is IllegalStateException, is IOException -> {
                            for (i in 1..5) {
                                Log.e(TAG, "Restarting Channel, count $i")
                                val result = connectChannel(device)
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
