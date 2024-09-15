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

package com.infineon.esim.lpa.euicc.usbreader.identive;

import static com.identive.libs.WinDefs.SCARD_SPECIFIC;

import android.content.Context;

import com.identive.libs.SCard;
import com.identive.libs.WinDefs;
import com.infineon.esim.lpa.euicc.base.generic.Atr;
import com.infineon.esim.util.Bytes;
import com.infineon.esim.util.Log;

import java.util.ArrayList;
import java.util.List;

public class IdentiveCard {
    private static final String TAG = IdentiveCard.class.getName();

    private static final long SCARD_E_NO_READERS_AVAILABLE = -2146435026L;

    private final SCard smartCard;
    private final IdentiveContext identiveContext;

    public IdentiveCard(Context context) {
        this.identiveContext = new IdentiveContext(context);
        this.smartCard = new SCard();
    }

    List<String> getReaderNames() {
        long lRetval;
        List<String> euiccNames = new ArrayList<>();

        ArrayList<String> interfaceNames = new ArrayList<>();
        lRetval = smartCard.SCardListReaders(identiveContext, interfaceNames);
        if (lRetval != WinDefs.SCARD_S_SUCCESS) {
            if (lRetval == SCARD_E_NO_READERS_AVAILABLE) {
                Log.debug(TAG, "Identive interface is not connected");
            } else {
                Log.error(TAG, "List Card Readers Error: " + Long.toUnsignedString(lRetval, 16));
            }
        } else {
            if (interfaceNames.size() >= 1) {
                Log.debug(TAG, "Identive interfaces: " + interfaceNames);
                euiccNames.addAll(interfaceNames);
            }
        }

        return euiccNames;
    }

    boolean isConnected() {
        SCard.SCardState cardState = smartCard.new SCardState();
        smartCard.SCardStatus(cardState);
        Log.debug(TAG, "SCardState: " + cardState.getnState());

        // Check if card is available
        return cardState.getnState() == SCARD_SPECIFIC;
    }

    void establishContext() throws Exception {
        long lRetval;

        try {
            lRetval = smartCard.USBRequestPermission(identiveContext);
            if (lRetval != WinDefs.SCARD_S_SUCCESS) {
                Log.error(TAG, "USB Request Permission Error:" + Long.toUnsignedString(lRetval, 16));
                throw new Exception("USB Request Permission Error:" + Long.toUnsignedString(lRetval, 16));
            }
        } catch (IllegalArgumentException e) {
            Log.error(TAG, "Catching the FLAG_IMMUTABLE exception since Identiv USB reader library seems not to be compatible with Android 12+.");
        }

        lRetval = smartCard.SCardEstablishContext(identiveContext);
        if (lRetval != WinDefs.SCARD_S_SUCCESS) {
            Log.error(TAG, "SCardEstablishContext Error");
            throw new Exception("SCardEstablishContext Error: " + Long.toUnsignedString(lRetval, 16));
        }
    }

    void releaseContext() throws Exception {
        long lRetval;
        lRetval = smartCard.SCardReleaseContext();
        if (lRetval != WinDefs.SCARD_S_SUCCESS) {
            Log.error(TAG, "SCardReleaseContext Error:" + Long.toUnsignedString(lRetval, 16));
            throw new Exception("SCardReleaseContext Error:" + Long.toUnsignedString(lRetval, 16));
        }

        identiveContext.unregisterReceiver();
    }

    void connectCard(String cardName) throws Exception {
        Log.debug(TAG, "Opening Identive eUICC connection...");
        long lRetval;

        lRetval = smartCard.SCardConnect(
                cardName,
                WinDefs.SCARD_SHARE_EXCLUSIVE,    // mode = 1:exclusive, 2:shared, 3:direct,
                (int) WinDefs.SCARD_PROTOCOL_TX); // protocol = 1:T=0, 2:T=1, 3:T=Tx);
        if (lRetval != WinDefs.SCARD_S_SUCCESS) {
            Log.error(TAG, "Card Connection Error");
            throw new Exception("Card Connection Error");
        }

        SCard.SCardState cardState = smartCard.new SCardState();
        lRetval = smartCard.SCardStatus(cardState);
        if (lRetval != WinDefs.SCARD_S_SUCCESS) {
            Log.error(TAG, "Card Status Error");
            throw new Exception("Card Status Error");
        }

        byte[] atr = Bytes.sub(cardState.getAbyATR(), 0, cardState.getnATRlen());
        Log.debug(TAG, "ATR: " + Bytes.encodeHexString(atr));

        if(!Atr.isAtrValid(atr)) {
            disconnectCard();
            Log.error(TAG, "eUICC not allowed!");
            throw new Exception("eUICC not allowed!");
        }
    }

    void disconnectCard() throws Exception {
        long lRetval = smartCard.SCardDisconnect(WinDefs.SCARD_UNPOWER_CARD);
        if (lRetval != WinDefs.SCARD_S_SUCCESS) {
            Log.error(TAG, "Card disconnect error: " + lRetval);
            throw new Exception("Card disconnect error: " + lRetval);
        }
    }

    void resetCard() throws Exception {
        long lRetval = smartCard.SCardReconnect(
                WinDefs.SCARD_SHARE_EXCLUSIVE,   // mode =        1:exclusive, 2:shared, 3:direct,
                (int) WinDefs.SCARD_PROTOCOL_TX, // protocol =    1:T=0, 2:T=1, 3:T=Tx,
                WinDefs.SCARD_RESET_CARD);       // disposition = SCARD_UNPOWER_CARD);

        if (lRetval != WinDefs.SCARD_S_SUCCESS) {
            Log.error(TAG, "Card reconnect error: " + lRetval);
            throw new Exception("Card reconnect error: " + lRetval);
        }
    }

    byte[] transmitToCard(byte[] command) {
        byte[] response = null;

        SCard.SCardIOBuffer transmit = smartCard.new SCardIOBuffer();
        transmit.setnInBufferSize(command.length);
        transmit.setAbyInBuffer(command);
        transmit.setnOutBufferSize(0x8000);
        transmit.setAbyOutBuffer(new byte[0x8000]);

        long lRetval = smartCard.SCardTransmit(transmit);
        if (lRetval != WinDefs.SCARD_S_SUCCESS) {
            Log.error(TAG, "SCardTransmit failed " + lRetval);
        } else {
            int responseLen = transmit.getnBytesReturned();
            response = Bytes.sub(transmit.getAbyOutBuffer(),0,responseLen);
        }

        return response;
    }
}
