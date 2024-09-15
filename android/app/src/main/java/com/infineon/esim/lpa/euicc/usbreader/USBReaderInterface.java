package com.infineon.esim.lpa.euicc.usbreader;

import com.infineon.esim.lpa.euicc.base.EuiccConnection;

import java.util.List;

public interface USBReaderInterface {
    boolean checkDevice(String name);
    boolean isInterfaceConnected();
    boolean connectInterface() throws Exception;
    boolean disconnectInterface() throws Exception;

    List<String> refreshEuiccNames() throws Exception;
    List<String> getEuiccNames();

    EuiccConnection getEuiccConnection(String euiccName) throws Exception;
}
