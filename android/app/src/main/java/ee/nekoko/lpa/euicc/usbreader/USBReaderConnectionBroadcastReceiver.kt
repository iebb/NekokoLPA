/*
 * THE SOURCE CODE AND ITS RELATED DOCUMENTATION IS PROVIDED "AS IS". INFINEON
 * TECHNOLOGIES MAKES NO OTHER WARRANTY OF ANY KIND,WHETHER EXPRESS,IMPLIED OR,
 * STATUTORY AND DISCLAIMS ANY AND ALL IMPLIED WARRANTIES OF MERCHANTABILITY,
 * SATISFACTORY QUALITY, NON INFRINGEMENT AND FITNESS FOR A PARTICULAR PURPOSE.
 *
 * THE SOURCE CODE AND DOCUMENTATION MAY INCLUDE ERRORS. INFINEON TECHNOLOGIES
 * RESERVES THE RIGHT TO INCORPORATE MODIFICATIONS TO THE SOURCE CODE IN LATER
 * REVISIONS OF IT, AND TO MAKE IMPROVEMENTS OR CHANGES IN THE DOCUMENTATION OR
 * THE PRODUCTS OR TECHNOLOGIES DESCRIBED THEREIN AT ANY TIME.
 *
 * INFINEON TECHNOLOGIES SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT OR
 * CONSEQUENTIAL DAMAGE OR LIABILITY ARISING FROM YOUR USE OF THE SOURCE CODE OR
 * ANY DOCUMENTATION, INCLUDING BUT NOT LIMITED TO, LOST REVENUES, DATA OR
 * PROFITS, DAMAGES OF ANY SPECIAL, INCIDENTAL OR CONSEQUENTIAL NATURE, PUNITIVE
 * DAMAGES, LOSS OF PROPERTY OR LOSS OF PROFITS ARISING OUT OF OR IN CONNECTION
 * WITH THIS AGREEMENT, OR BEING UNUSABLE, EVEN IF ADVISED OF THE POSSIBILITY OR
 * PROBABILITY OF SUCH DAMAGES AND WHETHER A CLAIM FOR SUCH DAMAGE IS BASED UPON
 * WARRANTY, CONTRACT, TORT, NEGLIGENCE OR OTHERWISE.
 *
 * (C)Copyright INFINEON TECHNOLOGIES All rights reserved
 */
package ee.nekoko.lpa.euicc.usbreader

import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbManager
import android.os.Build
import com.infineon.esim.util.Log
import ee.nekoko.lpa.euicc.usbreader.drivers.ccid.CCIDEuiccConnection
import ee.nekoko.lpa.euicc.usbreader.drivers.ccid.CCIDInterface
import ee.nekoko.lpa.euicc.usbreader.drivers.ccid.CCIDReader
import ee.nekoko.nlpa.MainApplication.Companion.getUsbManager


fun interface OnDisconnectCallback {
    fun onDisconnect()
}

class USBReaderConnectionBroadcastReceiver(
    private val context: Context,
    private val onDisconnectCallback: OnDisconnectCallback,
    private var usbif: CCIDInterface
) : BroadcastReceiver() {


    private var hasBeenFreshlyAttached = false
    private var lastReaderName: String? = null

    @Suppress("deprecation")
    override fun onReceive(context: Context, intent: Intent) {
        Log.debug(TAG, "Received a broadcast.")
        Log.debug(TAG, "Action: " + intent.action)

        when (intent.action) {
            UsbManager.ACTION_USB_DEVICE_ATTACHED -> {
                val usbDevice = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    intent.getParcelableExtra(UsbManager.EXTRA_DEVICE, UsbDevice::class.java)
                } else {
                    intent.getParcelableExtra(UsbManager.EXTRA_DEVICE)
                }

                lastReaderName = usbDevice!!.productName
                hasBeenFreshlyAttached = true
                onDisconnectCallback.onDisconnect()
            }

            UsbManager.ACTION_USB_DEVICE_DETACHED -> {
                onDisconnectCallback.onDisconnect()
            }

            UsbManager.EXTRA_PERMISSION_GRANTED -> {
                onDisconnectCallback.onDisconnect()
            }
            else -> Log.error(TAG, "Unknown action: " + intent.action)
        }
    }

    fun registerReceiver() {
        val filter = IntentFilter()
        filter.addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED)
        filter.addAction(UsbManager.ACTION_USB_DEVICE_DETACHED)
        filter.addAction(UsbManager.EXTRA_PERMISSION_GRANTED)
        context.registerReceiver(this, filter, Context.RECEIVER_NOT_EXPORTED)
    }
    @Throws(Exception::class)
    fun hasBeenFreshlyAttached(): Boolean {
        return if (hasBeenFreshlyAttached) {
            hasBeenFreshlyAttached = false
            if (usbif.checkDevice(lastReaderName)) {
                true
            } else {
                throw Exception("Reader \"" + lastReaderName + "\" not supported.")
            }
        } else {
            false
        }
    }

    fun isDeviceAttached(): Boolean {
        val usbManager = getUsbManager()

        val deviceList = usbManager.deviceList
        for (device in deviceList.values) {
            Log.debug(TAG, "USB device attached: " + device.productName)

            return usbif.checkDevice(device.productName)
        }

        return false
    }
    companion object {
        private val TAG: String = USBReaderConnectionBroadcastReceiver::class.java.name
    }
}
