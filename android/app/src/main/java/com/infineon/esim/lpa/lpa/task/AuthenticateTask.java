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

import com.infineon.esim.lpa.core.dtos.ActivationCode;
import com.infineon.esim.lpa.core.dtos.result.remote.AuthenticateResult;
import com.infineon.esim.lpa.core.dtos.result.remote.FuncExecException;
import com.infineon.esim.lpa.core.dtos.result.remote.RemoteError;
import com.infineon.esim.lpa.lpa.LocalProfileAssistant;
import com.infineon.esim.util.Log;

import java.util.concurrent.Callable;

public class AuthenticateTask implements Callable<AuthenticateResult> {
    private static final String TAG = AuthenticateTask.class.getName();

    private final LocalProfileAssistant lpa;
    private final ActivationCode activationCode;

    public AuthenticateTask(LocalProfileAssistant lpa, ActivationCode activationCode) {
        this.lpa = lpa;
        this.activationCode = activationCode;
    }

    @Override
    public AuthenticateResult call() throws Exception {

        try {
            return lpa.authenticate(activationCode);
        } catch (FuncExecException fe) {
            fe.printStackTrace();
            Log.error(TAG," " + "Authenticating failed with exception: " + fe.getMessage());
            return new AuthenticateResult(new RemoteError(fe.getFunctionExecutionStatus()));
        } catch (Exception e) {
            e.printStackTrace();
            Log.error(TAG," " + "Authenticating failed with exception: " + e.getMessage());
            return new AuthenticateResult(lpa.getLastEs9PlusError());
        }
    }
}
