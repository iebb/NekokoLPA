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

import com.infineon.esim.lpa.core.dtos.result.remote.AuthenticateResult;
import com.infineon.esim.lpa.core.dtos.result.remote.DownloadException;
import com.infineon.esim.lpa.core.dtos.result.remote.DownloadResult;
import com.infineon.esim.lpa.core.dtos.result.remote.FuncExecException;
import com.infineon.esim.lpa.core.dtos.result.remote.HandleNotificationsResult;
import com.infineon.esim.lpa.core.dtos.result.remote.RemoteError;
import com.infineon.esim.lpa.lpa.LocalProfileAssistant;
import com.infineon.esim.util.Log;

import java.net.ConnectException;
import java.util.concurrent.Callable;

import io.sentry.Sentry;
import io.sentry.SentryEvent;
import io.sentry.SentryLevel;
import io.sentry.UserFeedback;
import io.sentry.protocol.Message;
import io.sentry.protocol.SentryId;

public class DownloadTask implements Callable<DownloadResult> {
    private static final String TAG = DownloadTask.class.getName();

    private final LocalProfileAssistant lpa;
    private final String confirmationCode;

    public DownloadTask(LocalProfileAssistant lpa, String confirmationCode) {
        this.lpa = lpa;
        this.confirmationCode = confirmationCode;
    }

    @Override
    public DownloadResult call() {
        try {
            // Download the profile
            DownloadResult downloadResult = lpa.downloadProfile(confirmationCode);
            HandleNotificationsResult handleNotificationsResult;
            try {
                handleNotificationsResult = lpa.handleNotifications();
            } catch (ConnectException e) {
                // Ignore exceptions (E.g. no internet connection) and retry later
                return downloadResult;
            }

            if(handleNotificationsResult.getSuccess()) {
                return downloadResult;
            }
            return downloadResult;

        } catch (DownloadException fe) {
            var downloadResult = new DownloadResult(fe.getRemoteError());
            downloadResult.deltaSpace = fe.deltaSpace;
            downloadResult.errorCode = fe.getResultData().getFinalResult().getErrorResult().getErrorReason().toString();
            downloadResult.notificationAddress = fe.getResultData().getNotificationMetadata().getNotificationAddress().toString();
            return downloadResult;
        } catch (Exception e) {
            e.printStackTrace();
            Log.error(TAG," " + "Downloading profile failed with exception: " + e.getMessage());
            return new DownloadResult(lpa.getLastEs9PlusError());
        }
    }
}
