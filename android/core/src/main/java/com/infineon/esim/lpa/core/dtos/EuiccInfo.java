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

package com.infineon.esim.lpa.core.dtos;

import com.gsma.sgp.messages.pkix1implicit88.SubjectKeyIdentifier;
import com.gsma.sgp.messages.rspdefinitions.EUICCInfo2;
import com.gsma.sgp.messages.rspdefinitions.VersionType;

import java.util.ArrayList;
import java.util.List;

public class EuiccInfo {
    private static final String TAG = EuiccInfo.class.getName();

    private String eid;
    private final String profileVersion;
    private final String svn;
    private final String euiccFirmwareVer;
    private final String globalplatformVersion;
    private final String sasAcreditationNumber;
    private final List<String> pkiIds;

    public EuiccInfo(EUICCInfo2 euiccInfo2) {
        this(null, euiccInfo2);
    }

    public EuiccInfo(String eid, EUICCInfo2 euiccInfo2) {
        this.eid = eid;
        this.profileVersion = versionTypeToString(euiccInfo2.getBaseProfilePackageVersion());
        this.svn = versionTypeToString(euiccInfo2.getLowestSvn());
        this.euiccFirmwareVer = versionTypeToString(euiccInfo2.getEuiccFirmwareVersion());
        this.globalplatformVersion = versionTypeToString(euiccInfo2.getGlobalplatformVersion());

        this.sasAcreditationNumber = euiccInfo2.getSasAcreditationNumber().toString();

        this.pkiIds = euiccPkiIdList(euiccInfo2.getEuiccCiPKIdListForSigning());
    }

    public void setEid(String eid) {
        this.eid = eid;
    }

    public String getEid() {
        return eid;
    }

    public String getProfileVersion() {
        return profileVersion;
    }

    public String getSvn() {
        return svn;
    }

    public String getEuiccFirmwareVer() {
        return euiccFirmwareVer;
    }


    public String getGlobalplatformVersion() {
        return globalplatformVersion;
    }

    public String getSasAcreditationNumber() {
        return sasAcreditationNumber;
    }

    public List<String> getPkiIds() {
        return pkiIds;
    }

    public String getPkiIdsAsString(){
        StringBuilder sb = new StringBuilder();

        if(pkiIds.isEmpty()) {
            return "";
        }

        for(String pkiId : pkiIds) {
            sb.append(pkiId);
            sb.append("\n");
        }

        return sb.subSequence(0, sb.length() - 1).toString();
    }

    private static String versionTypeToString(VersionType versionType) {
        if(versionType != null) {
            return versionType.toString();
        }

        return "N/A";
    }

    private static List<String> euiccPkiIdList(EUICCInfo2.EuiccCiPKIdListForSigning pkiIdListIn) {
        List<String> pkiIdList = new ArrayList<>();

        for(SubjectKeyIdentifier ski : pkiIdListIn.getSubjectKeyIdentifier()) {
            pkiIdList.add(ski.toString());
        }

        return pkiIdList;
    }


}
