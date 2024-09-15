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

package com.infineon.esim.lpa.euicc.base.generic;

import com.infineon.esim.lpa.core.dtos.apdu.Apdu;
import com.infineon.esim.lpa.euicc.EuiccConnectionSettings;
import com.infineon.esim.util.Bytes;
import com.infineon.esim.util.Log;

import java.util.ArrayList;
import java.util.List;

public class ISO7816Channel {
    private static final String TAG = ISO7816Channel.class.getName();

    private static final byte BASIC_CHANNEL = (byte) 0;

    private final ApduTransmitter apduTransmitter;

    private int channelNumber = 1;

    public interface ApduTransmitter {
        byte[] transmit(byte[] command) throws Exception;
    }

    public ISO7816Channel(ApduTransmitter apduTransmitter)  {
        this.apduTransmitter = apduTransmitter;
    }

    public void openChannel(EuiccConnectionSettings euiccConnectionSettings) throws Exception {
        if(euiccConnectionSettings.isShallSendTerminalCapability()) {
            sendTerminalCapability();
        }

        if(euiccConnectionSettings.isShallSendOpenLogicalChannel()) {
            openLogicalChannel();
        }

        selectIsdr();
    }

    public void closeChannel(EuiccConnectionSettings euiccConnectionSettings) throws Exception {
        if(euiccConnectionSettings.isShallSendOpenLogicalChannel()) {
            closeLogicalChannel();
        }
    }

    public List<String> transmitAPDUS(List<String> apdus) {
        try {
            Log.debug(TAG, "Sending APDUs: " + apdus);

            List<String> responses = new ArrayList<>();

            for (String apdu : apdus) {
                Log.debug(TAG, "APDU: " + apdu);
                String responseString = transmitAPDU(apdu, (byte) channelNumber);
                Log.debug(TAG, "RESPONSE: " + responseString);

                responses.add(responseString);

                if (isSuccessStatusWord(responseString)) {
                    Log.debug(TAG, "SUCCESS: Response is 9000");
                } else {
                    Log.error(TAG, "APDU part error: " + responseString);
                    return responses;
                }
            }

            return responses;
        } catch (Exception e) {
            Log.error(TAG, "transmitAPDUS Error.", e);
        }
        return null;
    }

    private void sendTerminalCapability() throws Exception {
        try {
            // Select the MF
            selectMF();

            // Send the terminal capability command
            terminalCapability();
        } catch (Exception e) {
            Log.error(TAG,"Error sending TERMINAL CAPABILITY: " + e.getMessage());
            throw new Exception("Error sending TERMINAL CAPABILITY: " + e.getMessage());
        }
    }

    private void openLogicalChannel() throws Exception {
        String request = manageChannel(true, BASIC_CHANNEL);

        Log.debug(TAG, "OPEN LOGICAL CHANNEL request: " + request);
        String response = transmitAPDU(request, BASIC_CHANNEL);
        Log.debug(TAG, "OPEN LOGICAL CHANNEL result:  " + response);

        if(isSuccessStatusWord(response)) {
            String channelString = response.substring(0,2);
            channelNumber = Integer.parseInt(channelString);
            Log.debug(TAG, "Opened logical channel: " + channelNumber);
        } else  {
            Log.error(TAG, "Error opening logical channel: " + response);
            throw new Exception("Error opening logical channel: " + response);
        }
    }

    private void closeLogicalChannel() throws Exception {
        String request = manageChannel(false, (byte) channelNumber);

        Log.debug(TAG, "CLOSE LOGICAL CHANNEL request: " + request);
        String response = transmitAPDU(request, BASIC_CHANNEL);
        Log.debug(TAG, "CLOSE LOGICAL CHANNEL result:  " + response);

        channelNumber = 0;

        if(!isSuccessStatusWord(response)) {
            Log.error(TAG, "Error closing logical channel: " + response);
            throw new Exception("Error closing logical channel: " + response);
        }
    }

    private String transmitAPDU(String apdu, byte channel) throws Exception {
        byte[] command = Bytes.decodeHexString(apdu);

        // Set logical channel in CLA byte
        command[0] = (byte) ((command[0] & 0xFC) | channel);
        Log.debug(TAG, "Transmit command: " + Bytes.encodeHexString(command));

        byte[] response = apduTransmitter.transmit(command);

        if ((response != null) && (response.length >= 2 )) {
            int sw1 = response[response.length - 2] & 0xFF;
            int sw2 = response[response.length - 1] & 0xFF;

            if (sw1 == 0x6C) {
                command[command.length - 1] = response[response.length - 1];
                response = apduTransmitter.transmit(command);
            } else if (sw1 == 0x61) {
                do {
                    byte[] getResponseCmd = new byte[]{
                            command[0], (byte) 0xC0, 0x00, 0x00, (byte) sw2
                    };

                    byte[] tmp = apduTransmitter.transmit(getResponseCmd);
                    byte[] aux = response;
                    response = new byte[aux.length + tmp.length - 2];
                    System.arraycopy(aux, 0, response, 0, aux.length - 2);
                    System.arraycopy(tmp, 0, response, aux.length - 2, tmp.length);

                    sw1 = response[response.length - 2] & 0xFF;
                    sw2 = response[response.length - 1] & 0xFF;
                } while (sw1 == 0x61);
            }
        }

        if (response == null) {
            Log.error(TAG, "Error during transmitAPDU: Response is null.");
            throw new Exception("Error during transmitAPDU: Response is null.");
        } else {
            return Bytes.encodeHexString(response);
        }
    }

    private void terminalCapability() throws Exception {
        // According to ETS 102 221 Release 17 section 11.1.19 TERMINAL CAPABILITY
        // 80AA000005A9038301 +

        // RSP device capabilities (see GSMA SGP.22 v3.0.0 3.4.2 RSP Device Capabilities
        // 0011 0111 = 0x37
        // ││││ │││└─ Local User Interface in the Device (LUId) supported
        // ││││ ││└── Local Profile Download in the Device (LPDd) supported
        // ││││ │└─── Local Discovery Service in the Device (LDSd) supported
        // ││││ └──── LUIe based on SCWS supported
        // │││└────── Metadata update alerting supported
        // ││└─────── Enterprise Capable Device
        // │└──────── LUIe using E4E supported
        // └───────── LPR supported

        String rspDeviceCapabilities = "37";
        String data = "A9038301" + rspDeviceCapabilities;

        String request = genericCommand("80", "AA", "00", "00", data, null);

        Log.debug(TAG, "TERMINAL CAPABILITY request: " + request);
        String response = transmitAPDU(request, BASIC_CHANNEL);
        Log.debug(TAG, "TERMINAL CAPABILITY result:  " + response);

        if(!isSuccessStatusWord(response)) {
            Log.error(TAG, "Error sending TERMINAL CAPABILITY: " + response);
            throw new Exception("Error sending TERMINAL CAPABILITY: " + response);
        }
    }

    private void selectMF() throws Exception {
        // 00A40004023F00
        Log.debug(TAG, "SELECT MF request:  " + selectMFCommand(Definitions.MF_ID));
        String response = transmitAPDU(selectMFCommand(Definitions.MF_ID), BASIC_CHANNEL);
        Log.debug(TAG, "SELECT MF response: " + response);

        if(!isSuccessStatusWord(response)) {
            Log.error(TAG, "Error sending SELECT MF: " + response);
            throw new Exception("Error sending SELECT MF: " + response);
        }
    }

    public void selectIsdr() throws Exception {
        // 01A4040010A0000005591010FFFFFFFF8900000100
        Log.debug(TAG, "SELECT ISD-R request: " + selectByDFName(Definitions.ISDR_AID));
        String response = transmitAPDU(selectByDFName(Definitions.ISDR_AID), (byte) channelNumber);
        Log.debug(TAG, "SELECT ISD-R result:  " + response);

        if(!isSuccessStatusWord(response)) {
            Log.error(TAG, "Error sending SELECT ISD-R: " + response);
            throw new Exception("Error sending SELECT ISD-R: " + response);
        }
    }

    private boolean isSuccessStatusWord(String response) {
        return Apdu.isSuccessResponse(response);
    }

    public String manageChannel(boolean open, byte channelNumber) {
        // According to GlobalPlatform Card Specification v2.3.1 chapter 11.7 MANAGE CHANNEL command
        // Open:  0070000001
        // Close: XX7080XX
        if(open) {
            String cla = String.format("%02X", BASIC_CHANNEL);
            return genericCommand(cla, "70", "00", "00", null, "01");
        } else {
            String cla = String.format("%02X", channelNumber);
            return genericCommand(cla, "70", "80", cla,null, null);
        }
    }

    @SuppressWarnings("SameParameterValue")
    private String selectByDFName(String aid) {
        String cla = String.format("%02X", channelNumber);
        return genericCommand(cla, "A4", "04", "00", aid, null);
    }

    @SuppressWarnings("SameParameterValue")
    private String selectMFCommand(String fileIdentifier) {
        String cla = String.format("%02X", BASIC_CHANNEL);
        return genericCommand(cla,"A4", "00", "04", fileIdentifier, null);
    }

    @SuppressWarnings("SameParameterValue")
    private String genericCommand(String cla, String ins, String p1, String p2, String data, String le) {
        StringBuilder command = new StringBuilder(cla + ins + p1 +p2);

        if(data != null) {
            String lc = String.format("%02X", data.length()/2);
            command.append(lc).append(data);
        }
        if(le != null) {
            command.append(le);
        }

        return command.toString();
    }
}
