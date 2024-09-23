package ee.nekoko.lpa.ccid

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
import im.nfc.ccid.Ccid
import im.nfc.ccid.Protocol


class CCIDCard(private val context: Context) {
    private val usbManager = context.getSystemService(Context.USB_SERVICE) as UsbManager
    private var currentCardName: String? = null
    private var readers = mutableMapOf<String, Reader>()

    private data class Reader(
        val name: String,
        val deviceName: String,
        val interfaceIdx: Int,
        val ccid: Ccid?,
    )


    private val usbReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (intent.action == ACTION_USB_PERMISSION) {
                val device: UsbDevice? = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE)
                if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        device?.apply {
                            val reader = readers[intent.identifier]
                            if (reader == null) {
                                Log.e(TAG, "Reader not found")
                                return
                            }
                            val ccid = connectToInterface(device, reader.interfaceIdx)
                            if (ccid != null) {
                                readers[reader.name] = reader.copy(ccid = ccid)
                            }
                        }
                    } // otherwise there's no identifier
                } else {
                    Log.d(TAG, "permission denied for device $device")
                }
            }
        }
    }

    @OptIn(ExperimentalStdlibApi::class)
    private fun connectToInterface(device: UsbDevice, interfaceIdx: Int): Ccid? {
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
        for(i in 0 until 5) {
            // AUTO, 5V, 3V, 1.8V
            if ((descriptor.voltage and (1 shl i)) > 0) {
                try {
                    Log.d(TAG, "Trying Supported Voltage #$i")
                    val atr = ccid.iccPowerOn(i.toByte())
                    Log.d(TAG, "ATR: ${atr.toHexString()}")
                    return ccid
                } catch (ex: Exception) {
                    Log.d(TAG, "Voltage #$i Failed")
                }
            }
        }
        return ccid
        // throw Exception("Power On failed")
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

        if (device.manufacturerName != null && device.manufacturerName != "Generic") {
            nameParts.add(device.manufacturerName!!)
        }

        if (device.productName != null) {
            nameParts.add(device.productName!!)
        } else {
            nameParts.add("Reader")
        }

        return nameParts.joinToString(" ")
    }

    val readerNames: List<String>
        get() {
            val readerTree = mutableMapOf<String, MutableList<Reader>>()
            val newReaders = mutableMapOf<String, Reader>()

            usbManager.deviceList.values.forEach { device ->
                (0 until device.interfaceCount).forEach { i ->
                    val usbInterface = device.getInterface(i)
                    if (usbInterface.interfaceClass == UsbConstants.USB_CLASS_CSCID) {
                        val displayName = getDisplayName(device, usbInterface)
                        var ccid: Ccid? = null
                        for (reader in readers.values) {
                            if (reader.interfaceIdx == i && reader.deviceName == device.deviceName) {
                                ccid = reader.ccid;
                            }
                        }
                        val reader = Reader(displayName, device.deviceName, i, ccid)
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
            return readers.keys.toList()
        }

    val isConnected: Boolean
        get() = (currentCardName != null)

    @Throws(Exception::class)
    fun establishContext() {
    }

    @Throws(Exception::class)
    fun releaseContext() {
    }

    @Throws(Exception::class)
    fun connectCard(name: String) {
        val reader = readers[name]
        if (reader == null) {
            throw Exception("CCID_READER_NOT_FOUND")
        }
        val device =
            usbManager.deviceList.filter { it.key == reader.deviceName }.values.firstOrNull()
        if (device == null) {
            throw Exception("CCID_READER_NOT_FOUND")
        }

        if (reader.ccid != null) {
            return;
            // throw Exception("CCID_READER_ALREADY_CONNECTED")
        }

        if (!usbManager.hasPermission(device)) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                context.registerReceiver(usbReceiver, IntentFilter(ACTION_USB_PERMISSION), Context.RECEIVER_NOT_EXPORTED)
            } else @SuppressLint("UnspecifiedRegisterReceiverFlag") {
                context.registerReceiver(usbReceiver, IntentFilter(ACTION_USB_PERMISSION))
            }

            // Request permission
            readers[name] = reader.copy()
            val intent = Intent(ACTION_USB_PERMISSION)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                intent.identifier = name
            }
            val pendingIntent = PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_IMMUTABLE)
            usbManager.requestPermission(device, pendingIntent)
            throw Exception("CCID_READER_NO_PERMISSION")
        } else {
            val ccid = connectToInterface(device, reader.interfaceIdx)
            if (ccid != null) {
                Log.i(TAG, "Connecting Reader: $name")
                readers[name] = reader.copy(ccid = ccid)
            } else {
                throw Exception("CCID_READER_CONNECT_ERROR")
            }
        }

        currentCardName = name
    }

    @Throws(Exception::class)
    fun disconnectCard() {
        Log.i(TAG, "Disconnecting Reader: $currentCardName")
        if (currentCardName != null && readers[currentCardName!!]?.ccid != null) {
            readers[currentCardName!!] = readers[currentCardName]!!.copy(ccid = null)
            currentCardName = null
        }
    }

    @Throws(Exception::class)
    fun resetCard() {
        if (currentCardName == null) {
            return
        }

//        disconnectCard()
//        connectCard(currentCardName!!)
    }

    @Throws(Exception::class)
    fun transmitToCard(command: ByteArray): ByteArray {
        val reader = readers[currentCardName]
        Log.i(TAG, "Reader: $currentCardName")
        if (reader == null) {
            throw Exception("CCID_READER_NOT_FOUND")
        }
        Log.i(TAG, "Reader CCID: ${reader.ccid}")
        val ccid = reader.ccid
        if (ccid == null) {
            throw Exception("CCID_READER_NOT_CONNECTED")
        }
        val resp = ccid.xfrBlock(command)
        return resp
    }

    companion object {
        private val TAG: String = CCIDCard::class.java.name
        private const val ACTION_USB_PERMISSION = "ee.nekoko.lpa.ccid.USB_PERMISSION"
    }
}