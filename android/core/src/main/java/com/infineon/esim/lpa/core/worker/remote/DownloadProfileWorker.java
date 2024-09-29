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

package com.infineon.esim.lpa.core.worker.remote;

import com.gsma.sgp.messages.rspdefinitions.EUICCInfo2;
import com.gsma.sgp.messages.rspdefinitions.GetBoundProfilePackageRequest;
import com.gsma.sgp.messages.rspdefinitions.GetBoundProfilePackageResponse;
import com.gsma.sgp.messages.rspdefinitions.Octet32;
import com.gsma.sgp.messages.rspdefinitions.PrepareDownloadRequest;
import com.gsma.sgp.messages.rspdefinitions.PrepareDownloadResponse;
import com.gsma.sgp.messages.rspdefinitions.ProfileInstallationResult;
import com.infineon.esim.lpa.core.dtos.ConfirmationCode;
import com.infineon.esim.lpa.core.dtos.ProfileDownloadSession;
import com.infineon.esim.lpa.core.dtos.result.remote.DownloadException;
import com.infineon.esim.lpa.core.dtos.result.remote.DownloadResult;
import com.infineon.esim.lpa.core.dtos.result.remote.FuncExecException;
import com.infineon.esim.lpa.core.es10.Es10Interface;
import com.infineon.esim.lpa.core.es9plus.Es9PlusInterface;
import com.infineon.esim.lpa.core.es9plus.messages.response.base.FunctionExecutionStatus;
import com.infineon.esim.util.Log;

import java.util.ArrayList;

public class DownloadProfileWorker {
    private static final String TAG = DownloadProfileWorker.class.getName();

    private final ProfileDownloadSession profileDownloadSession;

    private final Es10Interface es10Interface;
    private final Es9PlusInterface es9PlusInterface;

    public DownloadProfileWorker(ProfileDownloadSession profileDownloadSession) {
        this.profileDownloadSession = profileDownloadSession;
        this.es10Interface = profileDownloadSession.getEs10Interface();
        this.es9PlusInterface = profileDownloadSession.getEs9PlusInterface();
    }

    public DownloadResult downloadProfile(String confirmationCode) throws Exception {
        Log.debug(TAG, "Downloading profile...");

        // Process confirmation code hash (optional)
        Octet32 hashCc = null;
        if(confirmationCode != null) {
            hashCc = ConfirmationCode.getHashCC(confirmationCode, profileDownloadSession.getTransactionId());
        }

        var freeSpace = parse(es10Interface.es10b_getEuiccInfo2());

        // Send PrepareDownloadRequest to eUICC
        PrepareDownloadRequest prepareDownloadRequest = profileDownloadSession.es10_getPrepareDownloadRequest(hashCc);
        PrepareDownloadResponse prepareDownloadResponse = es10Interface.es10b_prepareDownloadRequest(prepareDownloadRequest);
        profileDownloadSession.es10_processPrepareDownloadResponse(prepareDownloadResponse);

        // Send GetBoundProfilePackageRequest to SM-DP+
        GetBoundProfilePackageRequest getBoundProfilePackageRequest = profileDownloadSession.es9Plus_getBoundProfilePackageRequest();
        GetBoundProfilePackageResponse getBoundProfilePackageResponse = es9PlusInterface.getBoundProfilePackage(getBoundProfilePackageRequest);
        profileDownloadSession.es9Plus_processGetBoundProfilePackageResponse(es9PlusInterface.getFunctionExecutionStatus(), getBoundProfilePackageResponse);

        // Send LoadBoundProfilePackage to eUICC
        ProfileInstallationResult profileInstallationResult = es10Interface.es10b_loadBoundProfilePackage(profileDownloadSession.es10_getBoundProfilePackage());
        profileDownloadSession.es10_processProfileInstallationResult(profileInstallationResult);


        boolean result = profileDownloadSession.isProfileInstalledSuccessfully();
        var freeSpaceAfter = parse(es10Interface.es10b_getEuiccInfo2());
        var deltaSpace = freeSpace - freeSpaceAfter;
        if (!result) {
            throw new DownloadException(
                    "Error Code " + profileInstallationResult.getProfileInstallationResultData().getFinalResult().getErrorResult().getErrorReason().toString() +
                            " in downloading profile from " + profileInstallationResult.getProfileInstallationResultData().getNotificationMetadata().getNotificationAddress(),
                    profileInstallationResult.getProfileInstallationResultData(),
                    profileDownloadSession,
                    deltaSpace
            );
            // return new DownloadResult(profileDownloadSession.getLastError());

        } else {
            var data = new DownloadResult();
            data.deltaSpace = deltaSpace;
            data.downloadBytes = profileDownloadSession.es10_getBoundProfilePackage().getBoundProfilePackage().getSequenceOf86().toString().length();
            data.notificationAddress = profileInstallationResult.getProfileInstallationResultData().getNotificationMetadata().getNotificationAddress().toString();

            return data;
        }
    }

    int parse(EUICCInfo2 euiccInfo2) {
        byte[] ecr = euiccInfo2.getExtCardResource().value;
        ArrayList<Integer> data = new ArrayList<>();
        int i = 0;

        if (ecr != null) {
            while (i < ecr.length) {
                i++;
                int dataLen = ecr[i++];
                int v = 0;
                int j = 0;
                while (j < dataLen) {
                    v = (v << 8);
                    v += (ecr[i] & 0xFF); // Convert byte to unsigned int
                    i++;
                    j++;
                }
                data.add(v);
            }
            return data.get(1);
        }
        return 0;
    }
}
