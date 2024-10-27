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

package com.infineon.esim.lpa.core.es10.base;

import com.beanit.jasn1.ber.types.BerType;
import com.infineon.esim.messages.Ber;
import com.infineon.esim.util.Bytes;
import com.infineon.esim.util.Strings;

import java.util.ArrayList;
import java.util.List;

public class TransportCommand {
    private static final String TAG = TransportCommand.class.getName();

    private static final String CLA = "81";
    private static final String INS = "E2";
    private static final String P1_11 = "11";
    private static final String P1_91 = "91";

    private static final int MAX_DATA_LENGTH_BYTE = 240;

    /*
    See GSMA SGP.21 chapter 5.7.2 Transport Command for more details
     */

    public static List<String> getTransportCommands(BerType berData) {
        return getTransportCommands(Ber.getEncodedAsHexString(berData));
    }

    public static List<String> getTransportCommands(List<String> encodedDataList) {
        List<String> transportCommands = new ArrayList<>();
        for(String encodedData : encodedDataList) {
            transportCommands.addAll(getTransportCommands(encodedData));
        }
        return transportCommands;
    }

    public static List<String> getTransportCommands(String encodedData) {
        if(encodedData == null || encodedData.isEmpty()) {
            return null;
        }

        List<String> commandList = new ArrayList<>();

//        Log.info(TAG, "Full transport command: " + encodedData);

        List<String> subcommandList = Strings.splitByLength(encodedData, MAX_DATA_LENGTH_BYTE);

        for(int i = 0; i < subcommandList.size(); i++) {
            String encodedCommandPart = subcommandList.get(i);
            String encodedLength = Bytes.encodeHexString(Ber.encodeLength(encodedCommandPart.length() / 2));
            String p2 = Bytes.encodeHexString(Bytes.toByteArray(i));

            commandList.add(CLA + INS + P1_11 + p2 + encodedLength + encodedCommandPart);
        }

        // Replace the P1 of the last command with P1_91
        int lastCommandIndex = commandList.size() - 1;
        commandList.set(lastCommandIndex,Strings.replaceRegion(commandList.get(lastCommandIndex), P1_91, 4));

        return commandList;
    }
}
