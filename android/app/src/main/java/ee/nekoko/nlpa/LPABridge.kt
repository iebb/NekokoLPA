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
package ee.nekoko.nlpa

import android.content.Context
import android.os.Handler
import android.os.Looper
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.Observer
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.gson.Gson
import com.infineon.esim.lpa.core.dtos.ActivationCode
import com.infineon.esim.lpa.core.dtos.profile.ProfileMetadata
import com.infineon.esim.lpa.data.ActionStatus
import com.infineon.esim.lpa.data.AsyncActionStatus
import com.infineon.esim.lpa.data.Error
import com.infineon.esim.lpa.data.StatusAndEventHandler
import com.infineon.esim.lpa.util.android.OneTimeEvent
import com.infineon.esim.util.Log
import ee.nekoko.lpa.euicc.EuiccManager
import ee.nekoko.lpa.euicc.base.EuiccSlot
import io.sentry.Sentry
import java.util.Date
import java.util.concurrent.TimeUnit
import kotlin.concurrent.thread

class LPABridge @ReactMethod constructor(private val context: ReactContext?) : ReactContextBaseJavaModule(), StatusAndEventHandler {
    override fun getName(): String {
        return "LPABridge"
    }


    private val euiccManager = EuiccManager(context as Context, this)

    private val actionStatusLiveData = MutableLiveData<AsyncActionStatus>()
    private val errorEventLiveData = MutableLiveData<OneTimeEvent<Error>>()

    // private String _targetICCID = "";
    private val _suppressErrorsUntil: Long = 0
    private var _suppressErrorsCount: Long = 0


    override fun initialize() {
        emitData("euiccList", euiccManager.euiccListLiveData.value, true)
    }

    fun emitData(key: String, value: Any?, global: Boolean) {
        Log.debug(TAG, "Emitting $key")
        while (context == null || !context.hasActiveReactInstance()) {
            Log.debug(TAG, "Not ready!")
            Log.debug(TAG, "Failed sending: $key")
            Thread.sleep(500)
        }
        val jsonData = Gson().toJson(value)
        val params = Arguments.createMap()
        params.putString(key, jsonData)
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("onDataUpdate", params)
    }


    // observing action status
    val errorObserver: Observer<OneTimeEvent<Error>> = Observer { err: OneTimeEvent<Error> ->
        val e = err.contentIfNotHandled
        if (e != null) {
            val exc = e.exception
            if (exc != null) {
                Log.debug(TAG, "SentryId2: " + Sentry.captureException(exc))
            }
            val errHeader = e.header

            Log.debug(TAG, "Observed error: $errHeader")
            Log.debug(TAG, "Body: " + e.body)
            if (this._suppressErrorsUntil <= Date().time || this._suppressErrorsCount <= 0) {
                emitData("error", e, true)
                this._suppressErrorsCount = 0
            } else {
                this._suppressErrorsCount -= 1
                try {
                    TimeUnit.SECONDS.sleep(5)
                } catch (ignored: InterruptedException) {
                }
                if (errHeader != null && errHeader.contains("Exception during initializing eUICC")) {
                    refreshProfileList()
                }
            }
        }
    }


    init {
        thread(start = true) {
            euiccManager.refreshEuiccList()
            Handler(Looper.getMainLooper()).post {
                errorEventLiveData.observeForever(errorObserver)
                euiccManager.euiccListLiveData.observeForever { data: List<EuiccSlot?>? ->
                    emitData("euiccList", data, true)
                }
                emitData("euiccList", euiccManager.euiccListLiveData.value, true)
            }
        }
        instance = this
    }

    @get:ReactMethod(isBlockingSynchronousMethod = true)
    val euiccListJSON: String
        get() = Gson().toJson(euiccManager.euiccListLiveData!!.value)

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun getProfileListJSON(device: String?): String {
        val lpa = euiccManager.getLPA(device)
        return Gson().toJson(lpa!!.profileListLiveData.value)
    }

    @get:ReactMethod
    val asyncActionStatusLiveData: LiveData<AsyncActionStatus>
        get() = actionStatusLiveData

    @ReactMethod
    fun getErrorEventLiveData(): LiveData<OneTimeEvent<Error>> {
        return errorEventLiveData
    }

    // endregion
    // region eUICC interface methods
    @ReactMethod
    fun refreshEuiccs() {
        Log.debug(TAG, "Refreshing eUICC list...")
        euiccManager.refreshEuiccList()
    }

    // endregion
    // region LPA methods
    @ReactMethod
    fun refreshProfileList() {
        // lpa.refreshProfileList();
        euiccManager.refreshEuiccList()
    }

    @ReactMethod
    fun refreshProfileListWithDevice(device: String?) {
        Log.debug(TAG, "Refreshing eUICC list for " + device)
        val lpa = euiccManager.getLPA(device) ?: return
        lpa.refreshProfileList();
    }

    fun enableProfile(device: String?, profile: ProfileMetadata?) {
        val lpa = euiccManager.getLPA(device) ?: return
        lpa.enableProfile(profile)
        euiccManager.refreshSingleEuicc(device!!)
    }

    @ReactMethod
    fun enableProfileByIccId(device: String?, iccid: String?) {
        val lpa = euiccManager.getLPA(device) ?: return
        val profile = lpa.profileListLiveData?.value?.findMatchingProfile(iccid)
        if (profile != null) {
            enableProfile(device, profile)
        }
    }

    fun disableProfile(device: String?, profile: ProfileMetadata?) {
        val lpa = euiccManager.getLPA(device) ?: return
        lpa.disableProfile(profile)
        euiccManager.refreshSingleEuicc(device!!)
    }

    @ReactMethod
    fun disableProfileByIccId(device: String?, iccid: String?) {
        val lpa = euiccManager.getLPA(device) ?: return
        val profile = lpa.profileListLiveData?.value?.findMatchingProfile(iccid)
        if (profile != null) {
            disableProfile(device, profile)
        }
    }

    fun deleteProfile(device: String?, profile: ProfileMetadata?) {
        val lpa = euiccManager.getLPA(device) ?: return
        lpa.deleteProfile(profile)
        euiccManager.refreshSingleEuicc(device!!)
    }

    @ReactMethod
    fun deleteProfileByIccId(device: String?, iccid: String?) {
        val lpa = euiccManager.getLPA(device) ?: return
        val profile = lpa.profileListLiveData?.value?.findMatchingProfile(iccid)
        if (profile != null) {
            deleteProfile(device, profile)
        }
    }

    fun setNickname(device: String?, profile: ProfileMetadata?) {
        val lpa = euiccManager.getLPA(device) ?: return
        lpa.setNickname(profile)
        euiccManager.refreshSingleEuicc(device!!)
    }

    @ReactMethod
    fun setNicknameByIccId(device: String?, iccid: String?, nickname: String) {
        Log.debug(TAG, "Set Nickname $nickname")
        val lpa = euiccManager.getLPA(device) ?: return
        val profile = lpa.profileListLiveData?.value?.findMatchingProfile(iccid)
        if (profile != null) {
            profile.nickname = nickname
            setNickname(device, profile)
        }
    }

    //    public void handleAndClearAllNotifications() {
    //        var lpa = euiccManager.getLPA(device);
    //        lpa.handleAndClearAllNotifications();
    //    }
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun authenticateWithCode(device: String?, activationCode: String?): String {
        val ac = ActivationCode(activationCode)
        val lpa = euiccManager.getLPA(device) ?: return "null"
        val result = lpa.authenticateWith(ac)
        return Gson().toJson(result)
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun downloadProfile(device: String?, confirmationCode: String?): String {
        val lpa = euiccManager.getLPA(device) ?: return "null"
        val result = lpa.download(confirmationCode)
        return Gson().toJson(result)
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun cancelSession(device: String?, cancelSessionReason: Double): String {
        val lpa = euiccManager.getLPA(device) ?: return "null"
        val result = lpa.cancelSession(cancelSessionReason.toLong())
        return Gson().toJson(result)
    }


    @ReactMethod(isBlockingSynchronousMethod = true)
    fun getLogs(): String {
        val logs = Log.getLogs()
        return logs
    }

    override fun onStatusChange(actionStatus: ActionStatus) {
        Log.debug(TAG, "Changing action status to: $actionStatus")
        // actionStatusLiveData.postValue(AsyncActionStatus(actionStatus))
    }

    override fun onError(error: Error) {
        Log.error(TAG, error.header + ": " + error.body)
        // triggerErrorEvent(error)
    }

    private fun triggerErrorEvent(error: Error) {
        Log.debug(TAG, "Setting new error event.")
        Log.debug(TAG, error.toString())
        val newErrorEvent = OneTimeEvent(error)
        errorEventLiveData.postValue(newErrorEvent)
    } // endregion


    companion object {
        private val TAG: String = LPABridge::class.java.name

        private lateinit var instance: LPABridge

        fun initializeInstance(context: ReactContext?) {
            instance = LPABridge(context)
        }
    }
}
