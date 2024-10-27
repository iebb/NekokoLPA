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

import com.beanit.jasn1.ber.types.BerNull;
import com.beanit.jasn1.ber.types.string.BerUTF8String;
import com.gsma.sgp.messages.rspdefinitions.DeviceCapabilities;
import com.gsma.sgp.messages.rspdefinitions.DeviceInfo;
import com.gsma.sgp.messages.rspdefinitions.EUICCInfo1;
import com.gsma.sgp.messages.rspdefinitions.EUICCInfo2;
import com.gsma.sgp.messages.rspdefinitions.EuiccFormFactorType;
import com.gsma.sgp.messages.rspdefinitions.EuiccRspCapability;
import com.gsma.sgp.messages.rspdefinitions.Octet4;
import com.gsma.sgp.messages.rspdefinitions.VersionType;
import com.infineon.esim.messages.Ber;
import com.infineon.esim.messages.RspVersion;
import com.infineon.esim.util.Bytes;

import java.util.ArrayList;
import java.util.List;

public class DeviceInformation {

    public static DeviceInfo getDeviceInfo(EUICCInfo1 euiccInfo1) {
        RspVersion euiccRspVersion = new RspVersion(euiccInfo1);
        boolean deviceInfoExtensibilitySupported = false;

        // deviceInfoExtensibilitySupported exists since v3.0.0 in EuiccInfo1
        if(euiccRspVersion.isFrom3_0_0()) {
            EuiccRspCapability euiccRspCapability = euiccInfo1.getEuiccRspCapability();
            boolean[] euiccRspCapabilityArray = euiccRspCapability.getValueAsBooleans();
            deviceInfoExtensibilitySupported = euiccRspCapabilityArray[4];
        }

        return getDeviceInfo(euiccRspVersion, deviceInfoExtensibilitySupported);
    }

    public static DeviceInfo getDeviceInfo(EUICCInfo2 euiccInfo2) {
        RspVersion euiccRspVersion = new RspVersion(euiccInfo2);
        boolean deviceInfoExtensibilitySupported = false;

        // deviceInfoExtensibilitySupported exists since v2.2.2 in EuiccInfo1
        if(euiccRspVersion.isFrom2_2_2()) {
            EuiccRspCapability euiccRspCapability = euiccInfo2.getEuiccRspCapability();
            if(euiccRspCapability != null) {
                boolean[] euiccRspCapabilityArray = euiccRspCapability.getValueAsBooleans();
                deviceInfoExtensibilitySupported = euiccRspCapabilityArray[4];
            }
        }

        return getDeviceInfo(euiccRspVersion, deviceInfoExtensibilitySupported);
    }

    public static DeviceInfo getDeviceInfo(RspVersion euiccRspVersion, boolean deviceInfoExtensibilitySupported) {
        DeviceInfo deviceInfo = new DeviceInfo();

        // TODO: Add your device specific details here!

        deviceInfo.setTac(new Octet4(Bytes.decodeHexString("35550607")));

        DeviceCapabilities deviceCapabilities = new DeviceCapabilities();

//        deviceCapabilities.setGsmSupportedRelease();
//        deviceCapabilities.setUtranSupportedRelease();
//        deviceCapabilities.setCdma2000onexSupportedRelease();
//        deviceCapabilities.setCdma2000hrpdSupportedRelease();
//        deviceCapabilities.setCdma2000ehrpdSupportedRelease();
//        deviceCapabilities.setEutranEpcSupportedRelease();
//        deviceCapabilities.setContactlessSupportedRelease();
//        deviceCapabilities.setNrEpcSupportedRelease();
//        deviceCapabilities.setNr5gcSupportedRelease();
//        deviceCapabilities.setEutran5gcSupportedRelease();

        // #SupportedOnlyBeforeV3.0.0#
        if(deviceInfoExtensibilitySupported && euiccRspVersion.isBefore3_0_0()) {
//            deviceCapabilities.setRspCrlSupportedVersion();
        }

        // #DeviceInfoExtensibilitySupported#
        if(deviceInfoExtensibilitySupported && euiccRspVersion.isFrom3_0_0()) {
            VersionType lpaSvnVersion = new VersionType(new byte[] {3, 0, 0});
            deviceCapabilities.setLpaSvn(lpaSvnVersion);

            EuiccFormFactorType euiccFormFactorType = new EuiccFormFactorType(
                 // 0 // removableEuicc (0),   -- eUICC can be removed
                    1 // nonRemovableEuicc (1) -- eUICC cannot be removed
            );
            deviceCapabilities.setEuiccFormFactorType(euiccFormFactorType);
        }

        deviceInfo.setDeviceCapabilities(deviceCapabilities);

        // #DeviceInfoExtensibilitySupported# from GSMA SGP.22 v3.0.0
        if(deviceInfoExtensibilitySupported && euiccRspVersion.isFrom3_0_0()) {

            // language tag as defined by RFC 5646 message UTF8String
            // Typically ISO 639-2 language string
            // OPTIONAL: region identifier according to ISO 3166-1 (ALPHA 2 / 3 digit)
            List<byte[]> prefLangBerUTF8Strings = new ArrayList<>();
            prefLangBerUTF8Strings.add(Ber.getEncodedAsByteArray(new BerUTF8String("en-US")));
            prefLangBerUTF8Strings.add(Ber.getEncodedAsByteArray(new BerUTF8String("en-GB")));
            prefLangBerUTF8Strings.add(Ber.getEncodedAsByteArray(new BerUTF8String("de-DE")));
            prefLangBerUTF8Strings.add(Ber.getEncodedAsByteArray(new BerUTF8String("de-AT")));
            prefLangBerUTF8Strings.add(Ber.getEncodedAsByteArray(new BerUTF8String("de-CH")));

            DeviceInfo.PreferredLanguages preferredLanguages = Ber.createFromEncodedByteArray(
                    DeviceInfo.PreferredLanguages.class,
                    Ber.encodeSequence(prefLangBerUTF8Strings));
            deviceInfo.setPreferredLanguages(preferredLanguages);

            // deviceInfo.setDeviceTestMode(new BerNull());
            deviceInfo.setLpaRspCapability(LpaInformation.getLpaRspCapability());
        }

        return deviceInfo;
    }
}
