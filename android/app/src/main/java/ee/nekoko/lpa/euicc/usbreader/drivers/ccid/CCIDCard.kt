package ee.nekoko.lpa.euicc.usbreader.drivers.ccid

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.usb.UsbConstants
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbManager
import com.infineon.esim.util.Log
import ee.nekoko.lpa.euicc.base.EuiccInterfaceStatusChangeHandler
import ee.nekoko.lpa.euicc.base.EuiccSlot


class CCIDCard(private val context: Context, handler: EuiccInterfaceStatusChangeHandler) {
    private val usbManager = context.getSystemService(Context.USB_SERVICE) as UsbManager
    var slots = mutableMapOf<String, EuiccSlot>()
    var deviceIdentifiers = mutableMapOf<String, UsbDevice>()

    private val usbReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (intent.action == ACTION_USB_PERMISSION) {
                val _device: UsbDevice = deviceIdentifiers[intent.identifier]!!
                if (usbManager.hasPermission(_device)) {
                    android.util.Log.i(TAG, "CCID Permission Granted!")
                    handler.onEuiccRefresh("USB")
                } else {
                    android.util.Log.d(TAG, "permission denied for device $_device")
                }
            }
        }
    }

    private fun getDisplayName(device: UsbDevice): String {
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



    fun refreshSlots(): List<EuiccSlot> {
        val displayNameSet = mutableSetOf<String>()
        val euiccSlots: MutableList<EuiccSlot> = ArrayList()
        val euiccNames: MutableList<String> = ArrayList()

        usbManager.deviceList.values.forEach { device ->
            (0 until device.interfaceCount).forEach { i ->
                val usbInterface = device.getInterface(i)
                if (usbInterface.interfaceClass == UsbConstants.USB_CLASS_CSCID) {
                    if (usbManager.hasPermission(device)) {
                        try {
                            var displayName = getDisplayName(device)
                            if (displayNameSet.contains(displayName)) {
                                displayName += " [$i]"
                            }
                            val reader = CCIDReader(displayName, device.deviceName, i, null, usbManager, device, context)
                            val result = getEuiccSlot(reader)
                            euiccNames.add(result.name)
                            euiccSlots.add(result)
                        } finally {

                        }
                    } else {
                        context.registerReceiver(usbReceiver, IntentFilter(ACTION_USB_PERMISSION), Context.RECEIVER_NOT_EXPORTED)

                        val intent = Intent(ACTION_USB_PERMISSION)
                        intent.identifier = device.deviceName
                        deviceIdentifiers[device.deviceName] = device
                        val pendingIntent = PendingIntent.getBroadcast(context, 0, intent, 0)
                        usbManager.requestPermission(device, pendingIntent)
                    }
                }
            }
        }


        for (r in slots.keys) {
            if (!euiccNames.contains(r)) {
                slots.remove(r);
            }
        }

        return euiccSlots
    }

    @Throws(Exception::class)
    fun establishContext() {
    }

    @Throws(Exception::class)
    fun releaseContext() {
    }


    private fun getEuiccSlot(reader: CCIDReader): EuiccSlot {
        try {
            val currentSlot = slots[reader.name]
            val connection = if (currentSlot != null) {
                currentSlot.connection
            } else {
                CCIDEuiccConnection(reader)
            }

            Log.debug(TAG, "Reader name: " + reader.name)
            val slot = EuiccSlot(reader.name, "ok", connection)
            slots[reader.name] = slot
            reader.slot = slot
            return slot
        } catch (e: java.lang.Exception) {
            Log.debug(TAG, "[GET EUICC SLOT FAILED] $e")
            Log.debug(TAG, "[SESSION FAILED] " + reader.name)
        }
        val slot = EuiccSlot(reader.name, "", null)
        reader.slot = slot
        return slot
    }

    companion object {
        private val TAG: String = CCIDCard::class.java.name
        private const val ACTION_USB_PERMISSION = "ee.nekoko.lpa.ccid.USB_PERMISSION"
    }
}