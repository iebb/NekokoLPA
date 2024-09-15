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

package com.infineon.esim.lpa.core.worker.local;

import com.gsma.sgp.messages.rspdefinitions.DeleteProfileResponse;
import com.gsma.sgp.messages.rspdefinitions.Iccid;
import com.infineon.esim.lpa.core.es10.Es10Interface;
import com.infineon.esim.util.Bytes;
import com.infineon.esim.util.Log;

public class DeleteProfileWorker {
    private static final String TAG = DeleteProfileWorker.class.getName();

    private final Es10Interface es10Interface;

    public DeleteProfileWorker(Es10Interface es10Interface) {
        this.es10Interface = es10Interface;
    }

    public int delete(String iccidString) throws Exception {
        Log.debug(TAG, "Deleting profile with ICCID: " + iccidString);

        Iccid iccid = new Iccid(Bytes.decodeHexString(iccidString));

        DeleteProfileResponse deleteProfileResponse = es10Interface.es10c_deleteProfileByIccid(iccid);

        return deleteProfileResponse.getDeleteResult().intValue();
    }
}
