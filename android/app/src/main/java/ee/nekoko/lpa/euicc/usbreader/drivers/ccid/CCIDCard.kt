package ee.nekoko.lpa.euicc.usbreader.drivers.ccid

import android.content.Context
import android.hardware.usb.UsbConstants
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbManager
import ee.nekoko.lpa.euicc.base.EuiccSlot
import im.nfc.ccid.Ccid


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



    val readerNames: List<String>
        get() {
            val readerTree = mutableMapOf<String, MutableList<CCIDReader>>()
            val newReaders = mutableMapOf<String, CCIDReader>()

            usbManager.deviceList.values.forEach { device ->
                (0 until device.interfaceCount).forEach { i ->
                    val usbInterface = device.getInterface(i)
                    if (usbInterface.interfaceClass == UsbConstants.USB_CLASS_CSCID) {
                        val displayName = getDisplayName(device)
                        var ccid: Ccid? = null
                        for (reader in readers.values) {
                            if (reader.interfaceIdx == i && reader.deviceName == device.deviceName) {
                                ccid = reader.ccid;
                            }
                        }
                        val reader = CCIDReader(displayName, device.deviceName, i, ccid, usbManager, device, context)
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

    @Throws(Exception::class)
    fun establishContext() {
    }

    @Throws(Exception::class)
    fun releaseContext() {
    }

/*
    private fun getEuiccSlot(readerName: String): EuiccSlot {
        try {
            val currentSlot: EuiccSlot? = slots[readerName]
            val connection = if (currentSlot != null) {
                currentSlot.connection
            } else {
                CCIDEuiccConnection(this, readerName)
            }
            val es10Interface = Es10Interface(connection)
            val eid = es10Interface.es10c_getEid().eidValue.toString()
            val euiccInfo2 = es10Interface.es10b_getEuiccInfo2()
            com.infineon.esim.util.Log.debug(TAG, "Reader name: " + readerName)
            com.infineon.esim.util.Log.debug(TAG, "EID is $eid")
            val ret = EuiccSlot(readerName, true, "ok", eid, euiccInfo2, connection)
            slots.put(readerName, ret)
            return ret
        } catch (e: java.lang.Exception) {
            com.infineon.esim.util.Log.debug(TAG, "[GET EUICC SLOT FAILED] $e")
            com.infineon.esim.util.Log.debug(TAG, "[SESSION FAILED] " + readerName)
        }
        return EuiccSlot(readerName, false, "", null, null, null)
    }


 */
    companion object {
        private val TAG: String = CCIDCard::class.java.name
        private const val ACTION_USB_PERMISSION = "ee.nekoko.lpa.ccid.USB_PERMISSION"
    }
}