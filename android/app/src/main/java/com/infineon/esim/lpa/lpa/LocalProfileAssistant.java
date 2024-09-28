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
import com.infineon.esim.lpa.core.dtos.EuiccInfo;
import com.infineon.esim.lpa.core.dtos.enums.ProfileActionType;
import com.infineon.esim.lpa.core.dtos.profile.ProfileList;
import com.infineon.esim.lpa.core.dtos.profile.ProfileMetadata;
import com.infineon.esim.lpa.core.dtos.result.remote.AuthenticateResult;
import com.infineon.esim.lpa.core.dtos.result.remote.CancelSessionResult;
import com.infineon.esim.lpa.core.dtos.result.remote.DownloadResult;
import com.infineon.esim.lpa.core.dtos.result.remote.FuncExecException;
import com.infineon.esim.lpa.core.dtos.result.remote.RemoteError;
import com.infineon.esim.lpa.core.es9plus.Es9PlusInterface;
import com.infineon.esim.lpa.data.StatusAndEventHandler;

import ee.nekoko.lpa.euicc.base.EuiccConnection;
import ee.nekoko.lpa.euicc.base.EuiccConnectionConsumer;

import com.infineon.esim.lpa.lpa.task.AuthenticateTask;
import com.infineon.esim.lpa.lpa.task.CancelSessionTask;
import com.infineon.esim.lpa.lpa.task.DownloadTask;
import com.infineon.esim.lpa.lpa.task.GetEuiccInfoTask;
import com.infineon.esim.lpa.lpa.task.HandleAndClearAllNotificationsTask;
import com.infineon.esim.lpa.lpa.task.ProfileActionTask;
import com.infineon.esim.lpa.data.ActionStatus;
import com.infineon.esim.lpa.data.Error;
import com.infineon.esim.lpa.util.threading.TaskRunner;
import com.infineon.esim.util.Log;

import java.util.ArrayList;

public final class LocalProfileAssistant extends LocalProfileAssistantCoreImpl implements EuiccConnectionConsumer {
    private static final String TAG = LocalProfileAssistant.class.getName();

    private final StatusAndEventHandler statusAndEventHandler;
    private final MutableLiveData<ProfileList> profileList;

    private EuiccConnection euiccConnection;

    public LocalProfileAssistant(EuiccConnection euiccConnection, StatusAndEventHandler statusAndEventHandler) {
        super();
        Log.debug(TAG,"Creating LocalProfileAssistant...");
        this.statusAndEventHandler = statusAndEventHandler;
        this.profileList = new MutableLiveData<>();
        this.euiccConnection = euiccConnection;
        this.es9PlusInterface = new Es9PlusInterface();
        this.setEuiccChannel(euiccConnection);
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
        statusAndEventHandler.onStatusChange(ActionStatus.GET_PROFILE_LIST_STARTED);
        try {
            ProfileList result = new ProfileList(this.getProfiles());
            profileList.postValue(result);
            return result;
        } catch (Exception e) {
            profileList.postValue(new ProfileList(new ArrayList<>()));
            statusAndEventHandler.onError(new Error("Exception during getting of profile list.", e.getMessage(), e));
        } finally {
            statusAndEventHandler.onStatusChange(ActionStatus.GET_PROFILE_LIST_FINISHED);
        }
        return profileList.getValue();
    }

    public void enableProfile(ProfileMetadata profile) {
        // sync mode
        statusAndEventHandler.onStatusChange(ActionStatus.ENABLE_PROFILE_STARTED);

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
            statusAndEventHandler.onStatusChange(ActionStatus.ENABLE_PROFILE_FINISHED);
        }
    }

    public void disableProfile(ProfileMetadata profile) {
        // sync mode
        statusAndEventHandler.onStatusChange(ActionStatus.DISABLE_PROFILE_STARTED);
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
            statusAndEventHandler.onStatusChange(ActionStatus.DISABLE_PROFILE_FINISHED);
        }
    }

    public void deleteProfile(ProfileMetadata profile) {
        // sync mode
        statusAndEventHandler.onStatusChange(ActionStatus.DELETE_PROFILE_STARTED);
        try {
            new ProfileActionTask(this, ProfileActionType.PROFILE_ACTION_DELETE, profile).call();
            refreshProfileList();
        } catch (Exception e) {
            if (e.getMessage().contains("Opening eUICC connection failed.")) {

            } else {
                statusAndEventHandler.onError(new Error("Error during deleting of profile.", e.getMessage(), e));
            }
        } finally {
            statusAndEventHandler.onStatusChange(ActionStatus.DELETE_PROFILE_FINISHED);
        }
    }


    public void setNickname(ProfileMetadata profile) {
        // sync mode
        statusAndEventHandler.onStatusChange(ActionStatus.SET_NICKNAME_STARTED);
        try {
            new ProfileActionTask(this, ProfileActionType.PROFILE_ACTION_SET_NICKNAME, profile).call();
            refreshProfileList();
        } catch (Exception e) {
            if (e.getMessage().contains("Opening eUICC connection failed.")) {

            } else {
                statusAndEventHandler.onError(new Error("Error during deleting of profile.", e.getMessage(), e));
            }
        } finally {
            statusAndEventHandler.onStatusChange(ActionStatus.SET_NICKNAME_FINISHED);
        }
    }

    public void handleAndClearAllNotifications() {
        statusAndEventHandler.onStatusChange(ActionStatus.CLEAR_ALL_NOTIFICATIONS_STARTED);

        HandleAndClearAllNotificationsTask handleAndClearAllNotificationsTask = new HandleAndClearAllNotificationsTask(this);

        new TaskRunner().executeAsync(handleAndClearAllNotificationsTask,
                result -> statusAndEventHandler.onStatusChange(ActionStatus.CLEAR_ALL_NOTIFICATIONS_FINISHED),
                e -> statusAndEventHandler.onError(new Error("Error during clearing of all eUICC notifications.", e.getMessage(), e)));
    }

    public DownloadResult download(String confirmationCode) {
        Log.debug(TAG, "Authenticate");
        statusAndEventHandler.onStatusChange(ActionStatus.DOWNLOAD_PROFILE_STARTED);
        try {
            return new DownloadTask(this, confirmationCode).call();
        } catch (Exception e) {
            statusAndEventHandler.onError(new Error("Error during download of profile.", e.getMessage(), e));
        } finally {
            statusAndEventHandler.onStatusChange(ActionStatus.DOWNLOAD_PROFILE_FINISHED);
        }
        return null;
    }

    public CancelSessionResult cancelSession(long cancelSessionReason) {
        Log.debug(TAG, "Cancel session: " + cancelSessionReason);

        statusAndEventHandler.onStatusChange(ActionStatus.CANCEL_SESSION_STARTED);
        try {
            return new CancelSessionTask(this, cancelSessionReason).call();
        } catch (Exception e) {
            statusAndEventHandler.onError(new Error("Error cancelling session.", e.getMessage(), e));
        } finally {
            statusAndEventHandler.onStatusChange(ActionStatus.CANCEL_SESSION_FINISHED);
        }
        return null;
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
        super.setEuiccChannel(euiccConnection);

        if(euiccConnection != null) {
            refreshProfileList();
        }
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
    }
}