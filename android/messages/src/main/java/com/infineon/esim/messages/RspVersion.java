package com.infineon.esim.messages;


import com.gsma.sgp.messages.rspdefinitions.EUICCInfo1;
import com.gsma.sgp.messages.rspdefinitions.EUICCInfo2;
import com.gsma.sgp.messages.rspdefinitions.VersionType;

@SuppressWarnings("unused")
public class RspVersion extends VersionType {
    public static final VersionType V2_2_0 = new VersionType(new byte[] {2, 2, 0});
    public static final VersionType V2_2_1 = new VersionType(new byte[] {2, 2, 1});
    public static final VersionType V2_2_2 = new VersionType(new byte[] {2, 2, 2});
    public static final VersionType V2_3_0 = new VersionType(new byte[] {2, 3, 0});
    public static final VersionType V2_4_0 = new VersionType(new byte[] {2, 4, 0});
    public static final VersionType V3_0_0 = new VersionType(new byte[] {3, 0, 0});

    public RspVersion(VersionType version) {
        this.value = version.value;
    }

    public RspVersion(EUICCInfo1 euiccInfo1) {
        if(euiccInfo1.getHighestSvn() != null) {
            this.value = euiccInfo1.getHighestSvn().value;
        } else {
            this.value = euiccInfo1.getLowestSvn().value; // Pre 3.x.x: getSvn()
        }
    }

    public RspVersion(EUICCInfo2 euiccInfo2) {
        if(euiccInfo2.getHighestSvn() != null) {
            this.value = euiccInfo2.getHighestSvn().value;
        } else {
            this.value = euiccInfo2.getLowestSvn().value; // Pre 3.x.x: getSvn()
        }
    }

    private boolean higherOrEqualThan(VersionType versionLevel) {
        byte major = this.value[0];
        byte minor = this.value[1];
        byte patch = this.value[2];

        byte levelMajor = versionLevel.value[0];
        byte levelMinor = versionLevel.value[1];
        byte levelPatch = versionLevel.value[2];

        if(major < levelMajor) {
            return false;
        }
        if(major == levelMajor) {
            if (minor < levelMinor) {
                return false;
            }
            if(minor == levelMinor) {
                return patch >= levelPatch;
            }
        }

        return true;
    }

    /**
     * Check if #SupportedOnlyBeforeV3.0.0# according to GSMA SGP.22 v3.0.0
     * @return isSupported
     */
    public boolean isBefore3_0_0() {
        return !this.higherOrEqualThan(V3_0_0);
    }

    /**
     * Check if #SupportedFromV2.2.2# according to GSMA SGP.22 v3.0.0
     * @return isSupported
     */
    public boolean isFrom2_2_2() {
        return this.higherOrEqualThan(V2_2_2);
    }

    /**
     * Check if #SupportedFromV2.4.0# according to GSMA SGP.22 v3.0.0
     * @return isSupported
     */
    public boolean isFrom2_4_0() {
        return this.higherOrEqualThan(V2_4_0);
    }

    /**
     * Check if #SupportedFromV3.0.0# according to GSMA SGP.22 v3.0.0
     * @return isSupported
     */
    public boolean isFrom3_0_0() {
        return this.higherOrEqualThan(V3_0_0);
    }
}
