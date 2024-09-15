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

package com.infineon.esim.lpa.euicc.usbreader.acs;

import android.content.Context;

import com.infineon.esim.lpa.euicc.base.EuiccConnection;
import com.infineon.esim.lpa.euicc.base.EuiccService;
import com.infineon.esim.util.Log;

import java.util.List;

public class ACSService implements EuiccService {
    private static final String TAG = ACSService.class.getName();

    private final ACSCard ACSCard;

    private ACSEuiccConnection acsEuiccConnection;
    private boolean isConnected;

    public ACSService(Context context) {
        this.ACSCard = new ACSCard(context);
        this.isConnected = false;
    }

    public List<String> refreshEuiccNames() {
        Log.debug(TAG, "Refreshing ACS eUICC names...");
        return ACSCard.getReaderNames();
    }

    public void connect() throws Exception {
        Log.debug(TAG, "Opening connection to ACS service...");
        ACSCard.establishContext();

        isConnected = true;
    }

    public void disconnect() throws Exception {
        Log.debug(TAG, "Closing connection to ACS service...");
        ACSCard.releaseContext();

        isConnected = false;
    }

    public boolean isConnected() {
        return isConnected;
    }

    public EuiccConnection openEuiccConnection(String euiccName) {

        if(acsEuiccConnection != null && euiccName.equals(acsEuiccConnection.getEuiccName())) {
            Log.debug(TAG,"eUICC is already connected. Return existing eUICC connection.");
            return acsEuiccConnection;
        }

        acsEuiccConnection = new ACSEuiccConnection(ACSCard, euiccName);

        return acsEuiccConnection;
    }
}
