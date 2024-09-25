package ee.nekoko.lpa.euicc.usbreader;

import ee.nekoko.lpa.euicc.base.EuiccConnection;
import ee.nekoko.lpa.euicc.base.EuiccSlot;

import java.util.List;

public interface USBReaderInterface {
    boolean checkDevice(String name);
    boolean isInterfaceConnected();
    boolean connectInterface() throws Exception;
    boolean disconnectInterface() throws Exception;

    List<EuiccSlot> refreshSlots() throws Exception;
    List<EuiccSlot> getEuiccNames();

    EuiccConnection getEuiccConnection(String euiccName) throws Exception;
}
