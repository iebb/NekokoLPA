package ee.nekoko.nlpa

import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.hardware.usb.UsbConstants
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbEndpoint
import android.hardware.usb.UsbInterface
import android.hardware.usb.UsbManager
import android.os.Build
import android.se.omapi.Channel
import android.se.omapi.Reader as OMAPIReader
import android.se.omapi.SEService
import android.se.omapi.Session
import android.telephony.SubscriptionManager
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableArray
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.turbomodule.core.interfaces.TurboModule
import com.google.gson.Gson
import ee.nekoko.nlpa_utils.hexStringToByteArray
import ee.nekoko.nlpa_utils.toHex
import im.nfc.ccid.Ccid
import im.nfc.ccid.CcidCardNotFoundException
import im.nfc.ccid.Protocol
import kotlin.collections.get
import okhttp3.Call
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import java.io.IOException
import java.io.PrintWriter
import java.io.StringWriter
import java.security.SecureRandom
import java.security.cert.X509Certificate
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager

// OMAPIBridge constants
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

// CCIDPlugin constants
private const val ACTION_USB_PERMISSION = "im.nfc.ccid.USB_PERMISSION"

@OptIn(ExperimentalStdlibApi::class)
@ReactModule(name = "NekokoLPA")
class NekokoLPA(reactContext: ReactApplicationContext) : NativeNekokoLPASpec(reactContext), LifecycleEventListener {

    private val reactApplicationContext: ReactApplicationContext = reactContext

    // OMAPIBridge state
    var aidListDefault = "A06573746B6D65FFFFFFFF4953442D52,A0000005591010FFFFFFFF8900000100,A0000005591010FFFFFFFF8900050500,A0000005591010000000008900000300,A0000005591010FFFFFFFF8900000177"
    private var seService: SEService = SEService(reactContext as Context, { obj: Runnable -> obj.run() }, {})
    var channelMappings: MutableMap<String, Channel> = HashMap()
    var sessionMappings: MutableMap<String, Session> = HashMap()

    // CCIDPlugin state
    private var ccidReaders = mutableMapOf<String, CCIDReader>()
    private val usbReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (intent.action == ACTION_USB_PERMISSION) {
                val device: UsbDevice? = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE)
                val permissionGranted = intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    val identifier = intent.identifier
                    val reader = ccidReaders[identifier]
                    
                    if (reader == null) {
                        Log.e(TAG, "Reader not found for identifier: $identifier")
                        return
                    }
                    
                    val promise = reader.result
                    if (promise == null) {
                        Log.e(TAG, "Promise not found for reader: ${reader.name}")
                        return
                    }
                    
                    if (permissionGranted && device != null) {
                        Thread {
                            try {
                                val _ccid = connectToInterface(device, reader.interfaceIdx)
                                if (_ccid != null) {
                                    ccidReaders[reader.name] = reader.copy(ccid = _ccid.first, result = null)
                                    promise.resolve(_ccid.second)
                                } else {
                                    promise.reject("CCID_READER_CONNECT_ERROR", "Failed to connect [r]", null)
                                }
                            } catch (e: Exception) {
                                Log.e(TAG, "Error connecting in receiver: $e", e)
                                promise.reject("CCID_READER_CONNECT_ERROR", "Connection error: ${e.message}", e)
                            }
                        }.start()
                    } else {
                        Log.d(TAG, "Permission denied for device $device")
                        promise.reject("CCID_PERMISSION_DENIED", "USB permission denied", null)
                    }
                } else {
                    // For older Android versions, handle differently if needed
                    Log.w(TAG, "Android Q+ required for CCID permission handling")
                }
            }
        }
    }
    private var usbManager = reactApplicationContext.getSystemService(Context.USB_SERVICE) as UsbManager

    init {
        reactContext.addLifecycleEventListener(this)
    }

    // LifecycleEventListener
    override fun onHostPause() {
        for (chan in channelMappings.values) {
            chan.close()
        }
        for (sess in sessionMappings.values) {
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

    // ==================== OMAPIBridge Methods ====================

    private fun openLogicalChannel(reader: OMAPIReader, aids: List<String>): Channel? {
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

    private fun listOMAPIReaders(aidList: String): List<Map<String, String>> {
        aidListDefault = aidList
        var aids = aidListDefault.split(",")
        val result = mutableListOf<Map<String, String>>()
        val signatureList = SystemInfo(reactApplicationContext as Context).signatureList().joinToString(",")
        Log.e(TAG, "SE List Readers: $channelMappings length: ${channelMappings.size}")
        if (seService.isConnected) {
            Log.i(TAG, "SE List ${seService.readers.size} Readers:")
            for (reader in seService.readers) {
                Log.i(TAG, "SE Reader: " + reader.name)
                if (!reader.name.startsWith("SIM")) continue
                try {
                    var chan = channelMappings[reader.name] ?: openLogicalChannel(reader, aids)
                    if (chan == null) {
                        result.add(mapOf("name" to reader.name, "available" to "false", "description" to "Open Channel Failed"))
                        continue
                    }

                    var resp1: ByteArray
                    try {
                        resp1 = chan.transmit(hexStringToByteArray("81E2910006BF3E035C015A"))
                    } catch (e: IllegalStateException) {
                        Log.e(TAG, "Channel is closed. Reopen it now.", e)
                        chan = openLogicalChannel(reader, aids)
                        if (chan == null) {
                            result.add(mapOf("name" to reader.name, "available" to "false", "description" to "Open Channel Failed"))
                            continue
                        }
                        resp1 = chan.transmit(hexStringToByteArray("81E2910006BF3E035C015A"))
                    }

                    Log.i(TAG, "Transmit Response: ${resp1.toHex()}")
                    if (resp1[0] == 0xbf.toByte()) {
                        val eid = resp1.toHex().substring(10, 10 + 32)
                        Log.i(TAG, "EID: ${eid}")
                        result.add(hashMapOf("name" to reader.name, "eid" to eid, "slotAvailable" to "true", "available" to "true"))
                    } else {
                        result.add(hashMapOf("name" to reader.name, "available" to "false", "slotAvailable" to "true", "description" to "No EID Found", "signatures" to signatureList))
                    }
                } catch (e: SecurityException) {
                    Log.e(TAG, "Opening eUICC connection ${reader.name} failed. [java.lang.SecurityException]", e)
                    result.add(hashMapOf("name" to reader.name, "available" to "false", "slotAvailable" to "true", "description" to "ARA-M not supported", "signatures" to signatureList))
                } catch (e: IOException) {
                    Log.e(TAG, "Opening eUICC connection ${reader.name} failed. [IO]", e)
                    result.add(hashMapOf("name" to reader.name, "available" to "false", "description" to "Card unavailable", "signatures" to signatureList))
                } catch (e: NullPointerException) {
                    Log.e(TAG, "Opening eUICC connection ${reader.name} failed. [NP] Message: ${e.message}", e)
                    var sw = StringWriter()
                    e.printStackTrace(PrintWriter(sw))
                    result.add(hashMapOf("name" to reader.name, "available" to "false", "description" to "Unable to open a connection", "stack" to sw.toString(), "signatures" to signatureList))
                } catch (e: NoSuchElementException) {
                    Log.e(TAG, "Opening eUICC connection ${reader.name} failed: NoSuchElementException [EX]", e)
                    result.add(hashMapOf("name" to reader.name, "available" to "false", "description" to "Secure Element not found", "signatures" to signatureList))
                } catch (e: Exception) {
                    Log.e(TAG, "Opening eUICC connection ${reader.name} failed. [EX]", e)
                    result.add(hashMapOf("name" to reader.name, "available" to "false", "description" to e.message.toString(), "signatures" to signatureList))
                }
            }
            if (seService.readers.filter { it.name.startsWith("SIM") }.isEmpty()) {
                val subscriptionManager = SubscriptionManager.from(reactApplicationContext)
                var simSlots = subscriptionManager.getActiveSubscriptionInfoCountMax()
                for (i in 1..simSlots) {
                    result.add(hashMapOf("name" to "SIM${i}", "available" to "false", "description" to "OMAPI not supported"))
                }
            }
        } else {
            result.add(hashMapOf("name" to "SIM", "available" to "false", "description" to "OMAPI not supported"))
        }
        return result
    }

    private fun connectChannel(readerName: String): Boolean {
        val aids = aidListDefault.split(",")
        try {
            return seService.readers.find { it.name == readerName }?.let { reader ->
                openLogicalChannel(reader, aids) != null
            } ?: false
        } catch (e: Exception) {
            return false
        }
    }

    override fun openSTK(device: String) {
        if (commonSlotStkName.containsKey(device)) {
            val intentArray = commonSlotStkName[device]!!.plus(commonStkNames)
            for (componentName in intentArray) {
                try {
                    val intent = Intent().apply {
                        component = ComponentName.unflattenFromString(componentName)
                    }

                    val packageManager: PackageManager = reactApplicationContext.packageManager
                    val activities = packageManager.queryIntentActivities(intent, 0)

                    if (activities.isNotEmpty()) {
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        reactApplicationContext.startActivity(intent)
                        Log.d("IntentLauncher", "Launched: $componentName")
                        return
                    }
                } catch (e: Exception) {
                    Log.e("IntentLauncher", "Error launching intent: $componentName", e)
                }
            }
        }
    }

    override fun listDevices(aidList: String, promise: Promise) {
        Thread {
            try {
                promise.resolve(Gson().toJson(listOMAPIReaders(aidList)))
            } catch (e: Exception) {
                Log.e(TAG, "Exception: $e", e)
                promise.reject("LIST_ERROR", "Error message", e)
            }
        }.start()
    }

    override fun transceiveOMAPI(device: String, apdu: String, promise: Promise) {
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
                    when (e) {
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
                        else -> {
                            Log.e(TAG, "Exception: $e", e)
                            promise.reject("TRANSMIT_ERROR", "Error message", e)
                        }
                    }
                }
            }
        }.start()
    }

    // ==================== CCIDPlugin Methods ====================

    private fun _listCCIDReaders(): List<String> {
        val readerTree = mutableMapOf<String, MutableList<CCIDReader>>()
        val newReaders = mutableMapOf<String, CCIDReader>()

        usbManager.deviceList.values.forEach { device ->
            (0 until device.interfaceCount).forEach { i ->
                val usbInterface = device.getInterface(i)
                if (usbInterface.interfaceClass == UsbConstants.USB_CLASS_CSCID) {
                    val displayName = getDisplayName(device, usbInterface)
                    val reader = CCIDReader(displayName, device.deviceName, i, null, null)
                    readerTree.getOrPut(displayName) { mutableListOf() }.add(reader)
                }
            }
        }

        readerTree.forEach { (name, list) ->
            if (list.size > 1) {
                list.forEachIndexed { index, reader ->
                    newReaders["$name (${index + 1})"] = reader
                }
            } else {
                newReaders[name] = list[0]
            }
        }

        ccidReaders = newReaders
        return ccidReaders.keys.toList()
    }

    override fun listReaders(promise: Promise) {
        Thread {
            try {
                val readersList = _listCCIDReaders()
                val writableArray: WritableArray = Arguments.createArray()
                for (readerName in readersList) {
                    writableArray.pushString(readerName)
                }
                promise.resolve(writableArray)
            } catch (e: Exception) {
                Log.e(TAG, "Exception: $e", e)
                promise.reject("LIST_ERROR", "Error message", e)
            }
        }.start()
    }

    override fun disconnectCCID(name: String, promise: Promise) {
        Thread {
            try {
                val reader = ccidReaders[name]
                if (reader == null) {
                    promise.reject("CCID_READER_NOT_FOUND", "Reader not found", null)
                    return@Thread
                }
                // Try to send disconnect command if CCID is connected
                if (reader.ccid != null) {
                    try {
                        // Try to send close channel command before disconnecting
                        reader.ccid?.iccPowerOff()
                    } catch (e: Exception) {
                        // Ignore errors during cleanup
                        Log.d(TAG, "Error during CCID cleanup: ${e.message}")
                    }
                }
                ccidReaders[name] = reader.copy(ccid = null)
                promise.resolve(Unit)
            } catch (e: Exception) {
                Log.e(TAG, "Exception in disconnectCCID: $e", e)
                promise.reject("DISCONNECT_ERROR", "Error disconnecting reader", e)
            }
        }.start()
    }

    override fun transceiveCCID(name: String, capdu: String, promise: Promise) {
        Thread {
            val reader = ccidReaders[name]
            if (reader == null) {
                promise.reject("CCID_READER_NOT_FOUND", "Reader not found", null)
                return@Thread
            }
            val ccid = reader.ccid
            if (ccid == null) {
                promise.reject("CCID_READER_NOT_CONNECTED", "Reader not connected", null)
                return@Thread
            }
            val resp = ccid.xfrBlock(hexStringToByteArray(capdu))
            promise.resolve(resp.toHex())
        }.start()
    }

    @SuppressLint("UnspecifiedRegisterReceiverFlag")
    override fun connectCCID(name: String, promise: Promise) {
        val reader = ccidReaders[name]
        if (reader == null) {
            promise.reject("CCID_READER_NOT_FOUND", "Reader not found", null)
            return
        }
        val device = usbManager.deviceList.filter { it.key == reader.deviceName }.values.firstOrNull()
        if (device == null) {
            promise.reject("CCID_READER_NOT_FOUND", "Reader not found", null)
            return
        }

        if (reader.ccid != null) {
            promise.reject("CCID_READER_ALREADY_CONNECTED", "Reader already connected", null)
            return
        }

        if (!usbManager.hasPermission(device)) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    reactApplicationContext.registerReceiver(usbReceiver, IntentFilter(ACTION_USB_PERMISSION), Context.RECEIVER_EXPORTED)
                } else {
                    reactApplicationContext.registerReceiver(usbReceiver, IntentFilter(ACTION_USB_PERMISSION))
                }

                ccidReaders[name] = reader.copy(result = promise)
                val intent = Intent(ACTION_USB_PERMISSION)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    intent.identifier = name
                }
                val pendingIntent = PendingIntent.getBroadcast(reactApplicationContext, 0, intent, PendingIntent.FLAG_IMMUTABLE)
                usbManager.requestPermission(device, pendingIntent)
            } catch (e: Exception) {
                Log.e(TAG, "Error requesting USB permission: $e", e)
                promise.reject("CCID_PERMISSION_ERROR", "Failed to request permission", e)
            }
            return
        } else {
            Log.e(TAG, "Permission OK. Connecting")
            Thread {
                try {
                    val _ccid = connectToInterface(device, reader.interfaceIdx)
                    if (_ccid != null) {
                        ccidReaders[name] = reader.copy(ccid = _ccid.first)
                        promise.resolve(_ccid.second)
                    } else {
                        promise.reject("CCID_READER_CONNECT_ERROR", "Failed to connect [c]", null)
                    }
                } catch (c: CcidCardNotFoundException) {
                    promise.reject("CCID_READER_CONNECT_ERROR", "No card in reader", null)
                } catch (e: Exception) {
                    Log.e(TAG, "Error connecting CCID: $e", e)
                    promise.reject("CCID_READER_CONNECT_ERROR", "Connection error: ${e.message}", e)
                }
            }.start()
        }
    }

    @OptIn(ExperimentalStdlibApi::class)
    private fun connectToInterface(device: UsbDevice, interfaceIdx: Int): Pair<Ccid, String>? {
        val usbInterface = device.getInterface(interfaceIdx)
        val usbConnection = usbManager.openDevice(device)
        if (usbConnection == null) {
            Log.e(TAG, "Failed to open device")
            return null
        }
        val endpoints = getEndpoints(usbInterface)
        val ccid = Ccid(usbConnection, endpoints.first, endpoints.second)
        val descriptor = ccid.getDescriptor(interfaceIdx)
        if (descriptor?.supportsProtocol(Protocol.T0) != true) {
            Log.d(TAG, "Unsupported protocol")
            return null
        }
        if (!usbConnection.claimInterface(usbInterface, true)) {
            Log.e(TAG, "Failed to claim interface")
            return null
        }
        val atr = ccid.iccPowerOn()
        Log.d(TAG, "ATR: ${atr.toHex()}")
        return Pair(ccid, atr.toHex())
    }

    private fun getEndpoints(usbInterface: UsbInterface): Pair<UsbEndpoint, UsbEndpoint> {
        var bulkIn: UsbEndpoint? = null
        var bulkOut: UsbEndpoint? = null
        for (i in 0 until usbInterface.endpointCount) {
            val endpoint = usbInterface.getEndpoint(i)
            if (endpoint.type == UsbConstants.USB_ENDPOINT_XFER_BULK) {
                if (endpoint.direction == UsbConstants.USB_DIR_IN) {
                    bulkIn = endpoint
                } else {
                    bulkOut = endpoint
                }
            }
        }
        if (bulkIn == null || bulkOut == null) {
            throw Exception("Bulk endpoints not found")
        }
        return Pair(bulkIn, bulkOut)
    }

    private fun getDisplayName(device: UsbDevice, usbInterface: UsbInterface): String {
        val nameParts = mutableListOf<String>()
        if (device.productName != null) {
            nameParts.add(device.productName!!)
        } else {
            nameParts.add("Unknown")
        }

        if (usbInterface.name != null) {
            nameParts.add(usbInterface.name!!)
        } else {
            nameParts.add("CCID")
        }

        return nameParts.joinToString(" ")
    }

    // ==================== CustomHttp Methods ====================

    override fun sendHttpRequest(url: String, body: String, promise: Promise) {
        Log.d(TAG, "Use Custom HTTP: Server URL: $url")
        val trustAllCertificates = arrayOf<TrustManager>(
            object : X509TrustManager {
                override fun checkClientTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
                override fun checkServerTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
                override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
            }
        )

        val sslContext = SSLContext.getInstance("SSL")
        sslContext.init(null, trustAllCertificates, SecureRandom())

        val client = OkHttpClient.Builder()
            .sslSocketFactory(sslContext.socketFactory, trustAllCertificates[0] as X509TrustManager)
            .hostnameVerifier { _, _ -> true }
            .build()

        val mediaType = "application/json; charset=utf-8".toMediaTypeOrNull()

        val request = Request.Builder()
            .url(url)
            .post(body.toRequestBody(mediaType))
            .addHeader("Content-Type", "application/json")
            .addHeader("Accept", "application/json")
            .addHeader("User-Agent", "gsma-rsp-lpad")
            .addHeader("X-Admin-Protocol", "gsma/rsp/v2.2.0")
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                e.printStackTrace()
                promise.reject("0", e.toString())
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    if (!response.isSuccessful) {
                        promise.reject(response.code.toString(), response.toString())
                    } else {
                        promise.resolve(response.body?.string())
                    }
                }
            }
        })
    }

    companion object {
        private val TAG: String = NekokoLPA::class.java.name
    }

    private data class CCIDReader(
        val name: String,
        val deviceName: String,
        val interfaceIdx: Int,
        val ccid: Ccid?,
        val result: Promise?
    )
}

