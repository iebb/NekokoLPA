package com.infineon.esim.lpa.core.dtos;

import com.gsma.sgp.messages.rspdefinitions.DeviceInfo;
import com.gsma.sgp.messages.rspdefinitions.EUICCInfo1;
import com.gsma.sgp.messages.rspdefinitions.EuiccRspCapability;
import com.infineon.esim.messages.RspVersion;
import com.infineon.esim.util.Log;

import org.junit.jupiter.api.Test;

class DeviceInformationTest {

    private static final String TAG = DeviceInformationTest.class.getName();

    @Test
    void testEncoding() {

        EuiccRspCapability euiccRspCapability = new EuiccRspCapability(new boolean[] {
                true,  // additionalProfile(0), -- at least one more Profile can be installed
                false, // loadCrlSupport(1), -- #SupportedOnlyBeforeV3.0.0# Support for ES10b.LoadCRL
                false, // rpmSupport(2), -- Remote Profile Management
                true,  // testProfileSupport (3), -- support for test profile
                true,  // deviceInfoExtensibilitySupport (4), -- #SupportedFromV2.2.2# support for ASN.1 extensibility in the Device Info
                false, // serviceSpecificDataSupport (5), -- #SupportedFromV2.4.0# support for Service Specific Data in the Profile Metadata
                false, // hriServerAddressSupport (6), -- #SupportedFromV3.0.0# support for storing HRI server address
                false, // serviceProviderMessageSupport (7), -- #SupportedFromV3.0.0# Service Provider message is allowed within Profile metadata
                false, // lpaProxySupport (8), -- #SupportedForLpaProxyV3.0.0# support for LPA Proxy
                false, // enterpriseProfilesSupport (9), -- #SupportedForEnterpriseV3.0.0# support for enterprise profiles
                false, // serviceDescriptionSupport (10), -- #SupportedFromV3.0.0# support for storing Service Description
                false, // deviceChangeSupport (11), -- #SupportedFromV3.0.0# support for Device change
                false, // encryptedDeviceChangeDataSupport (12), -- #SupportedFromV3.0.0# support for encrypted Device Change data in Device Change response
                false, // estimatedProfileSizeIndicationSupport (13), -- #SupportedFromV3.0.0# support for including estimated profile size
                false, // profileSizeInProfilesInfoSupport (14), -- #SupportedFromV3.0.0# support for profile size in GetProfilesInfo
                false, // crlStaplingV3Support (15), -- #SupportedFromV3.0.0# support for CRL stapling
                false, // certChainV3VerificationSupport (16), -- #SupportedFromV3.0.0# support for certificate chain verification Variant A, B and C
                false, // signedSmdsResponseV3Support (17), -- #SupportedFromV3.0.0# support for SM-DS signed response
                false, // euiccRspCapInInfo1 (18), -- #SupportedFromV3.0.0# EUICCInfo1 includes euiccRspCapability
                false, // osUpdateSupport (19), -- #SupportedFromV3.0.0# support for eUICC OS Update
                false, // cancelForEmptySpnPnSupport (20), -- #SupportedFromV3.0.0# support for cancel session reasons empty SPN and empty Profile Name
                false, // updateNotifConfigInfoSupport (21), -- #SupportedFromV3.0.0# support for updating NotificationConfigurationInfo as defined in section 5.4.1
                false, // updateMetadataV3Support (22) -- #SupportedFromV3.0.0# support for the modified update metadata mechanism defined in section 5.4.1
        });

        EUICCInfo1 euiccInfo1 = new EUICCInfo1();
        euiccInfo1.setLowestSvn(RspVersion.V3_0_0);
        euiccInfo1.setEuiccRspCapability(euiccRspCapability);

        DeviceInfo deviceInfo = DeviceInformation.getDeviceInfo(euiccInfo1);

        Log.debug(TAG, "DeviceInformation: " + deviceInfo);
    }
}