package ee.nekoko.lpa.euicc.base

import com.gsma.sgp.messages.rspdefinitions.EUICCInfo2

class EuiccSlot (
    val name: String,
    val available: Boolean,
    val message: String,
    val eid: String?,
    val euiccInfo2: EUICCInfo2?,
    val connection: EuiccConnection?,
) {
}
