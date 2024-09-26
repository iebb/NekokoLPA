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
package ee.nekoko.lpa.euicc

import android.content.Context
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.infineon.esim.lpa.data.ActionStatus
import com.infineon.esim.lpa.data.Error
import com.infineon.esim.lpa.data.Preferences
import com.infineon.esim.lpa.data.StatusAndEventHandler
import com.infineon.esim.lpa.lpa.LocalProfileAssistant
import com.infineon.esim.util.Log
import ee.nekoko.lpa.euicc.base.EuiccConnection
import ee.nekoko.lpa.euicc.base.EuiccConnectionConsumer
import ee.nekoko.lpa.euicc.base.EuiccInterface
import ee.nekoko.lpa.euicc.base.EuiccInterfaceStatusChangeHandler
import ee.nekoko.lpa.euicc.base.EuiccSlot
import ee.nekoko.lpa.euicc.se.SeEuiccInterface

class EuiccManager(context: Context?, private val statusAndEventHandler: StatusAndEventHandler): EuiccInterfaceStatusChangeHandler {
    // eUICC interfaces
    private val euiccInterfaces: MutableList<EuiccInterface> = ArrayList()

    // eUICC connection
    private var currentEuiccConnection: EuiccConnection? = null

    // eUICCs

    private val currentEuicc = MutableLiveData<String>()
    private val euiccList: MutableLiveData<List<EuiccSlot>>? = MutableLiveData()
    private val euiccSlotMap = HashMap<String, EuiccSlot>()


    private var euiccConnectionConsumer: EuiccConnectionConsumer? = null

    private var switchEuiccInterface: String? = null
    private var enableFallbackEuicc = false

    init {
        euiccInterfaces.add(SeEuiccInterface(context, this))
        refreshEuiccList()
        // euiccInterfaces.add(new USBReaderEuiccInterface(context, this));
    }

    val currentEuiccLiveData: LiveData<String>
        get() = currentEuicc

    val euiccListLiveData: LiveData<List<EuiccSlot>>?
        get() = euiccList

    fun setEuiccConnectionConsumer(euiccConnectionConsumer: EuiccConnectionConsumer?) {
        this.euiccConnectionConsumer = euiccConnectionConsumer
    }

    private fun updateEuiccConnectionOnConsumer(euiccConnection: EuiccConnection) {
        Log.debug(TAG, "Updating eUICC connection on consumer.")
        if (euiccConnectionConsumer != null) {
            euiccConnectionConsumer!!.onEuiccConnectionUpdate(euiccConnection)
        }
    }

    fun getSlot(name: String?): EuiccSlot? {
        Log.debug(TAG, "Switch eUICC to: $name")
        var target: EuiccSlot? = null
        if (name == null) {
            val euiccListV = euiccList!!.value
            if (!euiccListV.isNullOrEmpty()) {
                target = euiccListV[0]
            }
        } else {
            val cand = euiccSlotMap[name]
            if (cand != null && cand.available) {
                target = cand
            }
        }
        return target
    }

    fun getLPA(name: String?): LocalProfileAssistant? {
        return getSlot(name)?.lpa
    }

//
//    override fun onEuiccConnected(euiccName: String, euiccConnection: EuiccConnection) {
//        Log.debug(TAG, "Euicc initialized: $euiccName")
//
//        enableFallbackEuicc = false
//        Preferences.setEuiccName(euiccName)
//        currentEuicc.postValue(euiccName)
//
//        updateEuiccConnectionOnConsumer(euiccConnection)
//    }


    /* sync calls */
    fun refreshEuiccList() {
        // refreshing eUICCs
        statusAndEventHandler.onStatusChange(ActionStatus.REFRESHING_EUICC_LIST_STARTED)
        Log.debug(TAG, "Refreshing eUICC list.")
        euiccSlotMap.clear()
        try {
            val euiccList: MutableList<EuiccSlot> = ArrayList()
            for (euiccInterface in euiccInterfaces) {
                for (slot in euiccInterface.refreshSlots()) {
                    slot.refresh()
                    Log.debug(TAG, euiccInterface.tag + ": " + slot.name)
                    euiccSlotMap[slot.name] = slot
                    euiccList.add(slot)
                }
            }
            this.euiccList!!.postValue(euiccList)
        } catch (e: Exception) {
            statusAndEventHandler.onError(Error("Exception during refreshing eUICC list.", e.message, e))
        } finally {
            statusAndEventHandler.onStatusChange(ActionStatus.REFRESHING_EUICC_LIST_FINISHED)
        }
    }

    fun refreshSingleEuicc(slotName: String) {
        val slot = euiccSlotMap[slotName]
        if (slot == null) {
            refreshEuiccList()
            return
        }
        // refreshing eUICCs
        statusAndEventHandler.onStatusChange(ActionStatus.REFRESHING_EUICC_LIST_STARTED)
        Log.debug(TAG, "Refreshing eUICC list.")
        slot.refresh()
        this.euiccList!!.postValue(euiccList.value!!)
    }

    companion object {
        private val TAG: String = EuiccManager::class.java.name
    }
}
