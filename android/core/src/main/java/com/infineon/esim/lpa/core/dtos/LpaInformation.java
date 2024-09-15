package com.infineon.esim.lpa.core.dtos;

import com.gsma.sgp.messages.rspdefinitions.LpaRspCapability;

public class LpaInformation {

    public static LpaRspCapability getLpaRspCapability() {

        // Minimal values for indicating GSMA SGP.22 v3.0.0 conformance according to Annex M
        return new LpaRspCapability(new boolean[] {
                true,  // crlStaplingV3Support
                true,  // certChainV3Support
                false, // apduApiSupport
                false, // enterpriseCapableDevice
                false, // lpaProxySupport
                true,  // signedSmdsResponseV3Support
                false, // euiccCiUpdateSupport
                false, // eventCheckingSupport
                false, // pushServiceSupport
                false  // pendingOperationAlertingSupport
        });
    }
}
