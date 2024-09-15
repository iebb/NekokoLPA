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

package com.infineon.esim.lpa.euicc.base.task;

import com.infineon.esim.lpa.euicc.base.EuiccInterface;
import com.infineon.esim.util.Log;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;

public class RefreshEuiccNamesTask implements Callable<List<String>> {
    private static final String TAG = RefreshEuiccNamesTask.class.getName();

    private final List<EuiccInterface> euiccInterfaces;

    public RefreshEuiccNamesTask(List<EuiccInterface> euiccInterfaces) {
        this.euiccInterfaces = euiccInterfaces;
    }

    @Override
    public List<String> call() throws Exception {
        Log.debug(TAG,"Refreshing connected eUICC names.");

        List<String> euiccList = new ArrayList<>();
        for(EuiccInterface euiccInterface : euiccInterfaces) {
            for (String euiccName : euiccInterface.refreshEuiccNames()) {
                Log.debug(TAG, euiccInterface.getTag() + ": " + euiccName);
                euiccList.add(euiccName);
            }
        }

        return euiccList;
    }
}
