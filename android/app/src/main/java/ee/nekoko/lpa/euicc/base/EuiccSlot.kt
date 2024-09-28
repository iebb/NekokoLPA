package ee.nekoko.lpa.euicc.base

import com.infineon.esim.util.Log
import com.gsma.sgp.messages.rspdefinitions.EUICCInfo2
import com.infineon.esim.lpa.core.dtos.profile.ProfileList
import com.infineon.esim.lpa.core.es10.Es10Interface
import com.infineon.esim.lpa.data.ActionStatus
import com.infineon.esim.lpa.data.Error
import com.infineon.esim.lpa.data.StatusAndEventHandler
import com.infineon.esim.lpa.lpa.LocalProfileAssistant
import ee.nekoko.lpa.euicc.EuiccManager
import io.sentry.Sentry

class EuiccSlot (
    val name: String,
    var message: String,
    @Transient var connection: EuiccConnection?,
): StatusAndEventHandler {
    var available: Boolean = false
    var eid: String? = null
    @Transient var euiccInfo2: EUICCInfo2? = null
    var installedApplications = 0
    var bytesFree = 0
    var volatileFree = 0
    var version = ""
    // var svn = ""
    var profiles: ProfileList? = null
    var status: String? = null
    @Transient var lpa: LocalProfileAssistant? = null
    @Transient var manager: EuiccManager? = null

    fun parse() {
        if (euiccInfo2 == null) return
        val _version = euiccInfo2?.globalplatformVersion.toString()

        version = "${_version[1]}.${_version[3]}.${_version[5]}"
        val ecr = euiccInfo2?.extCardResource?.value
        val data = ArrayList<Int>()
        var i = 0
        if (ecr != null) {
            while(i < ecr.size) {
                i++
                val dataLen = ecr[i++]
                var v = 0
                var j = 0
                while(j < dataLen) {
                    v = v shl 8
                    v += (ecr[i]).toUByte().toInt()
                    i++
                    j++
                }
                data.add(v)
            }
            installedApplications = data[0]
            bytesFree = data[1]
            volatileFree = data[2]
        }
    }

    fun refresh() {
        try {
            if (connection != null) {
                Log.error("EUICC_SLOT", "Refreshing")
                val es10Interface = Es10Interface(connection)
                eid = es10Interface.es10c_getEid().eidValue.toString()
                euiccInfo2 = es10Interface.es10b_getEuiccInfo2()
                available = true
                parse()
                if (lpa == null) {
                    lpa = LocalProfileAssistant(connection, this)
                }
                profiles = lpa!!.refreshProfileList()
                manager?.updateEuiccList()
            } else {
                Log.error("EUICC_SLOT", "No connection!")
            }
        } catch (e: Exception) {
            Sentry.captureException(e)
        }
    }

    init {
        refresh()
    }

    override fun onStatusChange(actionStatus: ActionStatus) {
        status = actionStatus.toString()
        Log.debug(name, "Changing action status to: $status")
    }

    override fun onError(error: Error) {
        message = error.header + ": " + error.body
    }

}
