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
package com.infineon.esim.lpa.lpa;

import androidx.lifecycle.MutableLiveData;

import com.infineon.esim.lpa.core.LocalProfileAssistantCoreImpl;
import com.infineon.esim.lpa.core.dtos.ActivationCode;
import com.infineon.esim.lpa.core.dtos.enums.ProfileActionType;
import com.infineon.esim.lpa.core.dtos.profile.ProfileList;
import com.infineon.esim.lpa.core.dtos.profile.ProfileMetadata;
import com.infineon.esim.lpa.core.dtos.result.remote.AuthenticateResult;
import com.infineon.esim.lpa.core.dtos.result.remote.CancelSessionResult;
import com.infineon.esim.lpa.core.dtos.result.remote.DownloadException;
import com.infineon.esim.lpa.core.dtos.result.remote.DownloadResult;
import com.infineon.esim.lpa.core.dtos.result.remote.FuncExecException;
import com.infineon.esim.lpa.core.dtos.result.remote.HandleNotificationsResult;
import com.infineon.esim.lpa.core.dtos.result.remote.RemoteError;
import com.infineon.esim.lpa.core.es10.Es10Interface;
import com.infineon.esim.lpa.core.es9plus.Es9PlusInterface;
import com.infineon.esim.lpa.data.ActionStatus;
import com.infineon.esim.lpa.data.Error;
import com.infineon.esim.lpa.data.StatusAndEventHandler;
import com.infineon.esim.lpa.lpa.task.CancelSessionTask;
import com.infineon.esim.lpa.lpa.task.HandleAndClearAllNotificationsTask;
import com.infineon.esim.lpa.lpa.task.ProfileActionTask;
import com.infineon.esim.lpa.util.threading.TaskRunner;
import com.infineon.esim.util.Log;

import java.net.ConnectException;
import java.util.ArrayList;

import ee.nekoko.lpa.euicc.base.EuiccConnection;
import ee.nekoko.lpa.euicc.base.EuiccConnectionConsumer;

public final class LocalProfileAssistant extends LocalProfileAssistantCoreImpl implements EuiccConnectionConsumer {
    private static final String TAG = LocalProfileAssistant.class.getName();

    private final StatusAndEventHandler statusAndEventHandler;
    private final MutableLiveData<ProfileList> profileList;
    private final String name;

    private EuiccConnection euiccConnection;

    public LocalProfileAssistant(EuiccConnection euiccConnection, String name, StatusAndEventHandler statusAndEventHandler) {
        super();
        Log.debug(TAG,"Creating LocalProfileAssistant...");
        this.statusAndEventHandler = statusAndEventHandler;
        this.profileList = new MutableLiveData<>();
        this.euiccConnection = euiccConnection;
        this.es10Interface = new Es10Interface(euiccConnection, name);
        this.name = name;
    }

    public MutableLiveData<ProfileList> getProfileListLiveData() {
        return profileList;
    }


    public Boolean resetEuicc() throws Exception {
        if(euiccConnection == null) {
            throw new Exception("Error: eUICC connection not available to LPA.");
        } else {
            return euiccConnection.resetEuicc();
        }
    }


    public ProfileList refreshProfileList() {
        Log.debug(TAG,"Refreshing profile list.");

        try {
            ProfileList result = new ProfileList(this.getProfiles());
            profileList.postValue(result);
            return result;
        } catch (Exception e) {
            profileList.postValue(new ProfileList(new ArrayList<>()));
            statusAndEventHandler.onError(new Error("Exception during getting of profile list.", e.getMessage(), e));
        } finally {

        }
        return profileList.getValue();
    }

    public void enableProfile(ProfileMetadata profile) {
        // sync mode


        try {
            if (profile.isEnabled()) {
                Log.debug(TAG, "Profile already enabled!");
            } else {
                new ProfileActionTask(this, ProfileActionType.PROFILE_ACTION_ENABLE, profile).call();
                Thread.sleep(500);
                refreshProfileList();
            }
        } catch (Exception e) {
            if (e.getMessage().contains("Opening eUICC connection failed.")) {

            } else {
                statusAndEventHandler.onError(new Error("Error during enabling profile.", e.getMessage(), e));
            }
        } finally {

        }
    }

    public void disableProfile(ProfileMetadata profile) {
        // sync mode

        try {
            if (!profile.isEnabled()) {
                Log.debug(TAG, "Profile already disabled!");
            } else {
                new ProfileActionTask(this, ProfileActionType.PROFILE_ACTION_DISABLE, profile).call();
                refreshProfileList();
            }
        } catch (Exception e) {
            if (e.getMessage().contains("Opening eUICC connection failed.")) {

            } else {
                statusAndEventHandler.onError(new Error("Error during enabling profile.", e.getMessage(), e));
            }
        } finally {

        }
    }

    public void deleteProfile(ProfileMetadata profile) {
        // sync mode

        try {
            new ProfileActionTask(this, ProfileActionType.PROFILE_ACTION_DELETE, profile).call();
            refreshProfileList();
        } catch (Exception e) {
            if (e.getMessage().contains("Opening eUICC connection failed.")) {

            } else {
                statusAndEventHandler.onError(new Error("Error during deleting of profile.", e.getMessage(), e));
            }
        } finally {

        }
    }


    public void setNickname(ProfileMetadata profile) {
        // sync mode

        try {
            new ProfileActionTask(this, ProfileActionType.PROFILE_ACTION_SET_NICKNAME, profile).call();
            refreshProfileList();
        } catch (Exception e) {
            if (e.getMessage().contains("Opening eUICC connection failed.")) {

            } else {
                statusAndEventHandler.onError(new Error("Error during deleting of profile.", e.getMessage(), e));
            }
        } finally {

        }
    }

    public void handleAndClearAllNotifications() {


        HandleAndClearAllNotificationsTask handleAndClearAllNotificationsTask = new HandleAndClearAllNotificationsTask(this);

        new TaskRunner().executeAsync(handleAndClearAllNotificationsTask,
                result -> statusAndEventHandler.onStatusChange(ActionStatus.CLEAR_ALL_NOTIFICATIONS_FINISHED),
                e -> statusAndEventHandler.onError(new Error("Error during clearing of all eUICC notifications.", e.getMessage(), e)));
    }

    public DownloadResult download(String confirmationCode) {
        Log.debug(TAG, "Downloading Profile");

        try {
            try {
                // Download the profile
                DownloadResult downloadResult = this.downloadProfile(confirmationCode);
                HandleNotificationsResult handleNotificationsResult;
                try {
                    handleNotificationsResult = this.handleNotifications();
                } catch (ConnectException e) {
                    // Ignore exceptions (E.g. no internet connection) and retry later
                    return downloadResult;
                } catch (Exception e) {
                    downloadResult.errorCode = "NOTI";
                    downloadResult.error = e.getMessage();
                    return downloadResult;
                }

                if (handleNotificationsResult.getSuccess()) {
                    return downloadResult;
                }
                return downloadResult;

            } catch (DownloadException fe) {
                var downloadResult = new DownloadResult(fe.getRemoteError());
                downloadResult.deltaSpace = fe.deltaSpace;
                downloadResult.errorCode = fe.getResultData().getFinalResult().getErrorResult().getErrorReason().toString();
                downloadResult.notificationAddress = fe.getResultData().getNotificationMetadata().getNotificationAddress().toString();
                downloadResult.error = fe.getMessage();
                return downloadResult;
            } catch (Exception e) {
                Log.error(TAG," " + "Downloading profile failed with exception: " + e.getMessage());
                var downloadResult = new DownloadResult(this.getLastEs9PlusError());
                downloadResult.errorCode = "X";
                downloadResult.error = "Downloading profile failed with exception: " + e.getMessage();
                return downloadResult;
            }
        } catch (Exception e) {
            statusAndEventHandler.onError(new Error("Error during download of profile.", e.getMessage(), e));
        } finally {

        }
        return null;
    }

    public CancelSessionResult cancelSessionR(long cancelSessionReason) {
        Log.debug(TAG, "Cancel session: " + cancelSessionReason);
        try {
            return this.cancelSession(cancelSessionReason);
        } catch (Exception e) {
            e.printStackTrace();
            Log.error(TAG,"CancelSession failed with exception: " + e.getMessage());
            return new CancelSessionResult(this.getLastEs9PlusError());
        } finally {

        }
    }

    // TODO: @ieb: simplify

    public AuthenticateResult authenticateWith(ActivationCode activationCode) {
        try {
            return this.authenticate(activationCode);
        } catch (FuncExecException fe) {
            Log.error(TAG," " + "Authenticating failed with exception: " + fe.getMessage());
            return new AuthenticateResult(new RemoteError(fe.getFunctionExecutionStatus()));
        } catch (Exception e) {
            Log.error(TAG," " + "Authenticating failed with exception: " + e.getMessage());
            return new AuthenticateResult(this.getLastEs9PlusError());
        }
    }

    @Override
    public void onEuiccConnectionUpdate(EuiccConnection euiccConnection) {
        Log.debug(TAG, "Updated eUICC connection.");
        this.euiccConnection = euiccConnection;
        super.setEuiccChannel(euiccConnection, name);

        if(euiccConnection != null) {
            refreshProfileList();
        }
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
    }
}