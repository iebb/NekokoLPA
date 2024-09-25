package ee.nekoko.lpa.euicc.usbreader.drivers.ccid

import android.content.Context
import android.hardware.usb.UsbConstants
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbManager
import com.infineon.esim.lpa.core.es10.Es10Interface
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



    fun readerSlots(): List<EuiccSlot> {
        val displayNameSet = mutableSetOf<String>()

        slots.clear();
        usbManager.deviceList.values.forEach { device ->
            (0 until device.interfaceCount).forEach { i ->
                val usbInterface = device.getInterface(i)
                if (usbInterface.interfaceClass == UsbConstants.USB_CLASS_CSCID) {
                    var displayName = getDisplayName(device)
                    if (displayNameSet.contains(displayName)) {
                        displayName += " [$i]"
                    }
                    for (reader in readers.values) {
                        reader.disconnectCard()
                    }
                    val reader = CCIDReader(displayName, device.deviceName, i, null, usbManager, device, context)
                    getEuiccSlot(reader) // slots added here
                }
            }
        }
        return slots.values.toList()
    }

    @Throws(Exception::class)
    fun establishContext() {
    }

    @Throws(Exception::class)
    fun releaseContext() {
    }

    private fun getEuiccSlot(reader: CCIDReader): EuiccSlot {
        try {
            val currentSlot: EuiccSlot? = slots[reader.name]
            val connection = if (currentSlot != null) {
                currentSlot.connection
            } else {
                CCIDEuiccConnection(reader)
            }
            com.infineon.esim.util.Log.debug(TAG, "Reader name: " + reader.name)
            val ret = EuiccSlot(reader.name, true, "ok", connection)
            slots.put(reader.name, ret)
            return ret
        } catch (e: java.lang.Exception) {
            com.infineon.esim.util.Log.debug(TAG, "[GET EUICC SLOT FAILED] $e")
            com.infineon.esim.util.Log.debug(TAG, "[SESSION FAILED] " + reader.name)
        }
        return EuiccSlot(reader.name, false, "", null)
    }

    companion object {
        private val TAG: String = CCIDCard::class.java.name
    }
}