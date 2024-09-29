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
import com.infineon.esim.lpa.data.StatusAndEventHandler
import com.infineon.esim.lpa.lpa.LocalProfileAssistant
import com.infineon.esim.util.Log
import ee.nekoko.lpa.euicc.base.EuiccInterface
import ee.nekoko.lpa.euicc.base.EuiccInterfaceStatusChangeHandler
import ee.nekoko.lpa.euicc.base.EuiccSlot
import ee.nekoko.lpa.euicc.se.SeEuiccInterface
import ee.nekoko.lpa.euicc.usbreader.drivers.ccid.CCIDInterface
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.runBlocking

class EuiccManager(context: Context, private val statusAndEventHandler: StatusAndEventHandler): EuiccInterfaceStatusChangeHandler {
    // eUICC interfaces
    private val euiccInterfaces: MutableList<EuiccInterface> = ArrayList()

    private val euiccList: MutableLiveData<List<EuiccSlot>> = MutableLiveData()
    private val euiccSlotMap = HashMap<String, EuiccSlot>()

    init {
        euiccInterfaces.add(SeEuiccInterface(context, this))
        euiccInterfaces.add(CCIDInterface(context, this))
    }

    val euiccListLiveData: LiveData<List<EuiccSlot>>
        get() = euiccList

    fun getSlot(name: String?): EuiccSlot? {
        Log.debug(TAG, "Switch eUICC to: $name")
        var target: EuiccSlot? = null
        if (name == null) {
            val euiccListV = euiccList.value
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

    /* sync calls */
    fun refreshEuiccList() {
        statusAndEventHandler.onStatusChange(ActionStatus.REFRESHING_EUICC_LIST_STARTED)
        Log.debug(TAG, "Refreshing eUICC list from refreshEuiccList")
        euiccSlotMap.clear()
        try {
            val euiccList: MutableList<EuiccSlot> = ArrayList()

            val man = this
            runBlocking {
                val outerDeferredList = euiccInterfaces.map { euiccInterface ->
                    async(Dispatchers.IO) { // Concurrent execution for each euiccInterface
                        Log.debug(TAG, "Refreshing eUICC ${euiccInterface.tag}")

                        val innerDeferredList = euiccInterface.refreshSlots().map { slot ->
                            async(Dispatchers.IO) { // Concurrent execution for each slot
                                slot.refresh()
                                slot.manager = man
                                Log.debug(TAG, euiccInterface.tag + ": " + slot.name)
                                synchronized(euiccList) { // Synchronizing access to shared resources
                                    euiccSlotMap[slot.name] = slot
                                    euiccList.add(slot)
                                }
                            }
                        }
                        innerDeferredList.awaitAll() // Wait for all slots to complete
                    }
                }
                outerDeferredList.awaitAll() // Wait for all interfaces to complete
            }
            euiccList.sortBy { k -> k.name }
            this.euiccList.postValue(euiccList)
        } catch (e: Exception) {
            statusAndEventHandler.onError(Error("Exception during refreshing eUICC list.", e.message, e))
        } finally {
            statusAndEventHandler.onStatusChange(ActionStatus.REFRESHING_EUICC_LIST_FINISHED)
        }
    }

    fun updateEuiccList() {
        this.euiccList.postValue(this.euiccList.value)
    }

    fun refreshSingleEuicc(slotName: String) {
        refreshSingleEuicc(slotName, 5)
    }


    fun refreshSingleEuicc(slotName: String, _retry: Int) {
        var retry = _retry
        val slot = euiccSlotMap[slotName]
        if (slot == null) {
            refreshEuiccList()
            return
        }
        // refreshing eUICCs
        statusAndEventHandler.onStatusChange(ActionStatus.REFRESHING_EUICC_LIST_STARTED)
        Log.debug(TAG, "Refreshing eUICC list.")

        while (retry > 0) {
            try {
                slot.refresh()
                break
            } catch (e: Exception) {
                Log.error(TAG, "Refreshing eUICC list failed. Retries: $retry")
                retry -= 1
                Thread.sleep(600)
            }
        }
        this.euiccList.postValue(euiccList.value!!)
    }

    companion object {
        private val TAG: String = EuiccManager::class.java.name
    }

    override fun onEuiccRefresh(interfaceTag: String?) {
        refreshEuiccList()
    }
}
