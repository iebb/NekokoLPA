package ee.nekoko.lpa.euicc.usbreader.drivers.ccid

import android.content.Context
import android.hardware.usb.UsbConstants
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbManager
import com.infineon.esim.util.Log
import ee.nekoko.lpa.euicc.base.EuiccSlot


class CCIDCard(private val context: Context) {
    private val usbManager = context.getSystemService(Context.USB_SERVICE) as UsbManager
    var readers = mutableMapOf<String, CCIDReader>()
    var slots = mutableMapOf<String, EuiccSlot>()


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
                    try {
                        var displayName = getDisplayName(device)
                        if (displayNameSet.contains(displayName)) {
                            displayName += " [$i]"
                        }
                        val reader = CCIDReader(displayName, device.deviceName, i, null, usbManager, device, context)
                        val result = getEuiccSlot(reader)
                        if (result.available) {
                            euiccNames.add(result.name)
                            euiccSlots.add(result)
                        }
                    } finally {

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
            val ret = EuiccSlot(reader.name, "ok", connection)
            slots[reader.name] = ret
            return ret
        } catch (e: java.lang.Exception) {
            Log.debug(TAG, "[GET EUICC SLOT FAILED] $e")
            Log.debug(TAG, "[SESSION FAILED] " + reader.name)
        }
        return EuiccSlot(reader.name, "", null)
    }

    companion object {
        private val TAG: String = CCIDCard::class.java.name
    }
}