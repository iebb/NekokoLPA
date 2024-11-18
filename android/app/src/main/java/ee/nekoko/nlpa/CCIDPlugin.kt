package ee.nekoko.nlpa

import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.usb.UsbConstants
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbEndpoint
import android.hardware.usb.UsbInterface
import android.hardware.usb.UsbManager
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableNativeArray
import com.google.gson.Gson
import im.nfc.ccid.Ccid
import im.nfc.ccid.Protocol
import kotlin.collections.get


@OptIn(ExperimentalStdlibApi::class)
class CCIDPlugin @ReactMethod constructor(private val context: ReactContext?) : ReactContextBaseJavaModule() {
    override fun getName(): String {
        return "CCIDPlugin"
    }

    private var readers = mutableMapOf<String, Reader>()

    private val usbReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (intent.action == ACTION_USB_PERMISSION) {
                val device: UsbDevice? = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE)
                if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
                    device?.apply {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                            val reader = readers[intent.identifier]
                            if (reader == null) {
                                Log.e(TAG, "Reader not found")
                                return
                            }
                            val _ccid = connectToInterface(device, reader.interfaceIdx)
                            if (_ccid != null) {
                                readers[reader.name] =
                                    reader.copy(ccid = _ccid.first, result = null)
                                reader.result!!.resolve(_ccid.second)
                            } else {
                                reader.result!!.reject(
                                    "CCID_READER_CONNECT_ERROR",
                                    "Failed to connect [r]",
                                    null
                                )
                            }
                        }
                    }
                } else {
                    Log.d(TAG, "permission denied for device $device")
                }
            }
        }
    }
    private var usbManager = (context as Context).getSystemService(Context.USB_SERVICE) as UsbManager

    protected fun addActivityEventListener(listener: ActivityEventListener?) {
    }

    protected fun removeActivityEventListener(listener: ActivityEventListener?) {
        Log.i(TAG, "Shutdown, clearing connections")
    }


    @ReactMethod
    fun _listReaders(): ReadableArray {

        val readerTree = mutableMapOf<String, MutableList<Reader>>()
        val newReaders = mutableMapOf<String, Reader>()

        usbManager.deviceList.values.forEach { device ->
            (0 until device.interfaceCount).forEach { i ->
                val usbInterface = device.getInterface(i)
                if (usbInterface.interfaceClass == UsbConstants.USB_CLASS_CSCID) {
                    val displayName = getDisplayName(device, usbInterface)
                    val reader = Reader(displayName, device.deviceName, i, null, null)
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

        readers = newReaders
        val writableArray = WritableNativeArray()
        for (item in readers.keys) {
            writableArray.pushString(item)
        }
        return writableArray
    }

    @ReactMethod
    fun listReaders(promise: Promise) {
        Thread {
            try {
                promise.resolve(_listReaders())
            } catch (e: Exception) {
                Log.e(TAG, "Exception: $e", e)
                promise.reject("LIST_ERROR", "Error message", e)
            }
        }.start()
    }

    @ReactMethod
    fun disconnect(name: String, promise: Promise) {
        val reader = readers[name]
        if (reader == null) {
            promise.reject("CCID_READER_NOT_FOUND", "Reader not found", null)
            return
        }
        readers[name] = reader.copy(ccid = null)
    }

    
    
    @ReactMethod
    fun transceive(name: String, capdu: String, promise: Promise) {
        Thread {
            val reader = readers[name]
            if (reader == null) {
                promise.reject("CCID_READER_NOT_FOUND", "Reader not found", null)
                return@Thread
            }
            val ccid = reader.ccid
            if (ccid == null) {
                promise.reject("CCID_READER_NOT_CONNECTED", "Reader not connected", null)
                return@Thread
            }
            val resp = ccid.xfrBlock(capdu.hexToByteArray())
            promise.resolve(resp.toHexString())
        }.start()
    }

    @SuppressLint("UnspecifiedRegisterReceiverFlag")
    @ReactMethod
    private fun connect(name: String, result: Promise) {
        val reader = readers[name]
        if (reader == null) {
            result.reject("CCID_READER_NOT_FOUND", "Reader not found", null)
            return
        }
        val device =
            usbManager.deviceList.filter { it.key == reader.deviceName }.values.firstOrNull()
        if (device == null) {
            result.reject("CCID_READER_NOT_FOUND", "Reader not found", null)
            return
        }

        if (reader.ccid != null) {
            result.reject("CCID_READER_ALREADY_CONNECTED", "Reader already connected", null)
            return
        }

        if (!usbManager.hasPermission(device)) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                (context as Context).registerReceiver(usbReceiver, IntentFilter(ACTION_USB_PERMISSION), Context.RECEIVER_EXPORTED)
            } else {
                (context as Context).registerReceiver(usbReceiver, IntentFilter(ACTION_USB_PERMISSION))
            }

            // Request permission
            readers[name] = reader.copy(result = result)
            val intent = Intent(ACTION_USB_PERMISSION)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                intent.identifier = name
            }
            val pendingIntent = PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_IMMUTABLE)
            usbManager.requestPermission(device, pendingIntent)

            return
        } else {
            Log.e(TAG, "Permission OK. Connecting")
            val _ccid = connectToInterface(device, reader.interfaceIdx)
            if (_ccid != null) {
                readers[name] = reader.copy(ccid = _ccid.first)
                result.resolve(_ccid.second)
            } else {
                result.reject("CCID_READER_CONNECT_ERROR", "Failed to connect [c]", null)
            }
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
        Log.d(TAG, "ATR: ${atr.toHexString()}")
        return Pair(ccid, atr.toHexString())
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

    companion object {
        private val TAG = CCIDPlugin::class.java.name
        private const val ACTION_USB_PERMISSION = "im.nfc.ccid.USB_PERMISSION"
        private const val TIMEOUT = 1000
    }

    private data class Reader(
        val name: String,
        val deviceName: String,
        val interfaceIdx: Int,
        val ccid: Ccid?,
        val result: Promise?
    )
}
