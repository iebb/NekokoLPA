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

package com.infineon.esim.lpa.lpa.task;

import com.infineon.esim.lpa.core.dtos.EuiccInfo;
import com.infineon.esim.lpa.lpa.LocalProfileAssistant;
import com.infineon.esim.util.Log;

import java.util.concurrent.Callable;

public class GetEuiccInfoTask implements Callable<EuiccInfo> {
    private static final String TAG = GetEuiccInfoTask.class.getName();

    private final LocalProfileAssistant lpa;

    public GetEuiccInfoTask(LocalProfileAssistant lpa) {
        this.lpa = lpa;
    }

    @Override
    public EuiccInfo call() throws Exception {
        try {
            String eid = lpa.getEID();
            Log.debug(TAG,"EID: " + eid);

            EuiccInfo euiccInfo = lpa.getEuiccInfo2();
            euiccInfo.setEid(eid);

            Log.debug(TAG,"EuiccInfo: " + euiccInfo);

            return euiccInfo;
        } catch (Exception e) {
            e.printStackTrace();
            Log.error(TAG, "Getting eUICC info failed with exception: " + e.getMessage());
            throw e;
        }
    }
}
