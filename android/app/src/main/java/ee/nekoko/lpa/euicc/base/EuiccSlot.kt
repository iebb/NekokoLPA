package ee.nekoko.lpa.euicc.base

import com.gsma.sgp.messages.rspdefinitions.EUICCInfo2
import com.infineon.esim.lpa.core.dtos.profile.ProfileList
import com.infineon.esim.lpa.core.dtos.profile.ProfileMetadata
import com.infineon.esim.lpa.core.es10.Es10Interface

class EuiccSlot (
    val name: String,
    val available: Boolean,
    val message: String,
    val connection: EuiccConnection?,
) {
    var eid: String? = null
    var euiccInfo2: EUICCInfo2? = null
    var profiles: ProfileList? = null

    fun refresh() {
        if (connection != null) {
            val es10Interface = Es10Interface(connection)
            eid = es10Interface.es10c_getEid().eidValue.toString()
            euiccInfo2 = es10Interface.es10b_getEuiccInfo2()

            val profileInfoListResponse = es10Interface.es10c_getProfilesInfoAll()
            val profileMetadataList: MutableList<ProfileMetadata> = ArrayList()
            for (profileInfo in profileInfoListResponse.profileInfoListOk.profileInfo) {
                if (profileInfo.iccid != null) {
                    profileMetadataList.add(ProfileMetadata(profileInfo))
                }
            }
            profiles = ProfileList(profileMetadataList)

        }
    }
}
