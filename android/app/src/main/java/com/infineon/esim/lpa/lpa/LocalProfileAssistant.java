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
import com.infineon.esim.lpa.data.StatusAndEventHandler;
import com.infineon.esim.lpa.euicc.EuiccManager;
import com.infineon.esim.lpa.euicc.base.EuiccConnection;
import com.infineon.esim.lpa.euicc.base.EuiccConnectionConsumer;
import com.infineon.esim.lpa.lpa.task.AuthenticateTask;
import com.infineon.esim.lpa.lpa.task.CancelSessionTask;
import com.infineon.esim.lpa.lpa.task.DownloadTask;
import com.infineon.esim.lpa.lpa.task.GetEuiccInfoTask;
import com.infineon.esim.lpa.lpa.task.GetProfileListTask;
import com.infineon.esim.lpa.lpa.task.HandleAndClearAllNotificationsTask;
import com.infineon.esim.lpa.lpa.task.ProfileActionTask;
import com.infineon.esim.lpa.data.ActionStatus;
import com.infineon.esim.lpa.data.Error;
import com.infineon.esim.lpa.util.android.InternetConnectionConsumer;
import com.infineon.esim.lpa.util.threading.TaskRunner;
import com.infineon.esim.util.Log;

public final class LocalProfileAssistant extends LocalProfileAssistantCoreImpl implements EuiccConnectionConsumer, InternetConnectionConsumer {
    private static final String TAG = LocalProfileAssistant.class.getName();

    private final StatusAndEventHandler statusAndEventHandler;
    private final MutableLiveData<ProfileList> profileList;
    private final NetworkStatusBroadcastReceiver networkStatusBroadcastReceiver;

    private EuiccConnection euiccConnection;

    private EuiccInfo euiccInfo;
    private AuthenticateResult authenticateResult;
    private DownloadResult downloadResult;
    private CancelSessionResult cancelSessionResult;

    public LocalProfileAssistant(EuiccManager euiccManager, StatusAndEventHandler statusAndEventHandler) {
        super();
        Log.debug(TAG,"Creating LocalProfileAssistant...");

        this.networkStatusBroadcastReceiver = new NetworkStatusBroadcastReceiver(this);
        this.statusAndEventHandler = statusAndEventHandler;
        this.profileList = new MutableLiveData<>();

        networkStatusBroadcastReceiver.registerReceiver();
        euiccManager.setEuiccConnectionConsumer(this);
    }

    public MutableLiveData<ProfileList> getProfileListLiveData() {
        return profileList;
    }

    public EuiccInfo getEuiccInfo() {
        return euiccInfo;
    }

    public AuthenticateResult getAuthenticateResult() {
        return authenticateResult;
    }

    public DownloadResult getDownloadResult() {
        return downloadResult;
    }

    public CancelSessionResult getCancelSessionResult() {
        return cancelSessionResult;
    }

    public Boolean resetEuicc() throws Exception {
        if(euiccConnection == null) {
            throw new Exception("Error: eUICC connection not available to LPA.");
        } else {
            return euiccConnection.resetEuicc();
        }
    }


    public void refreshProfileList() {
        Log.debug(TAG,"Refreshing profile list.");
        statusAndEventHandler.onStatusChange(ActionStatus.GET_PROFILE_LIST_STARTED);
        try {
            ProfileList result = new GetProfileListTask(this).call();
            profileList.postValue(result);
        } catch (Exception e) {
            statusAndEventHandler.onError(new Error("Exception during getting of profile list.", e.getMessage(), e));
        } finally {
            statusAndEventHandler.onStatusChange(ActionStatus.GET_PROFILE_LIST_FINISHED);
        }
    }


    public void refreshProfileListAsync() {
        Log.debug(TAG,"Refreshing profile list.");
        statusAndEventHandler.onStatusChange(ActionStatus.GET_PROFILE_LIST_STARTED);

        new TaskRunner().executeAsync(new GetProfileListTask(this),
                result -> {
                    if (result != null) { // sometimes it hasn't been initialized
                        statusAndEventHandler.onStatusChange(ActionStatus.GET_PROFILE_LIST_FINISHED);
                        profileList.setValue(result);
                    }
                },
                e -> statusAndEventHandler.onError(new Error("Exception during getting of profile list.", e.getMessage(), e)));
    }

    public void refreshEuiccInfo() {
        Log.debug(TAG, "Refreshing eUICC info.");
        statusAndEventHandler.onStatusChange(ActionStatus.GETTING_EUICC_INFO_STARTED);

        new TaskRunner().executeAsync(new GetEuiccInfoTask(this),
                result -> {
                    euiccInfo = result;
                    statusAndEventHandler.onStatusChange(ActionStatus.GETTING_EUICC_INFO_FINISHED);
                },
                e -> statusAndEventHandler.onError(new Error("Exception during getting of eUICC info.", e.getMessage(), e)));
    }

    public void enableProfile(ProfileMetadata profile) {
        // sync mode
        statusAndEventHandler.onStatusChange(ActionStatus.ENABLE_PROFILE_STARTED);

        try {
            if (profile.isEnabled()) {
                Log.debug(TAG, "Profile already enabled!");
            } else {
                new ProfileActionTask(this, ProfileActionType.PROFILE_ACTION_ENABLE, profile).call();
                ProfileList result = new GetProfileListTask(this).call();
                profileList.postValue(result);
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
                ProfileList result = new GetProfileListTask(this).call();
                profileList.postValue(result);
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
        statusAndEventHandler.onStatusChange(ActionStatus.DELETE_PROFILE_STARTED);

        new TaskRunner().executeAsync(new ProfileActionTask(this,
                        ProfileActionType.PROFILE_ACTION_DELETE,
                        profile),
                result -> statusAndEventHandler.onStatusChange(ActionStatus.DELETE_PROFILE_FINISHED),
                e -> statusAndEventHandler.onError(new Error("Error during deleting of profile.", e.getMessage(), e)));
    }


    public void setNickname(ProfileMetadata profile) {
        statusAndEventHandler.onStatusChange(ActionStatus.SET_NICKNAME_STARTED);

        ProfileActionTask profileActionTask = new ProfileActionTask(this,
                ProfileActionType.PROFILE_ACTION_SET_NICKNAME,
                profile);

        new TaskRunner().executeAsync(profileActionTask,
                result -> statusAndEventHandler.onStatusChange(ActionStatus.SET_NICKNAME_FINISHED),
                e -> statusAndEventHandler.onError(new Error("Error during setting nickname of profile.", e.getMessage(), e)));
    }

    public void handleAndClearAllNotifications() {
        statusAndEventHandler.onStatusChange(ActionStatus.CLEAR_ALL_NOTIFICATIONS_STARTED);

        HandleAndClearAllNotificationsTask handleAndClearAllNotificationsTask = new HandleAndClearAllNotificationsTask(this);

        new TaskRunner().executeAsync(handleAndClearAllNotificationsTask,
                result -> statusAndEventHandler.onStatusChange(ActionStatus.CLEAR_ALL_NOTIFICATIONS_FINISHED),
                e -> statusAndEventHandler.onError(new Error("Error during clearing of all eUICC notifications.", e.getMessage(), e)));
    }

    public void startAuthentication(ActivationCode activationCode) {
        authenticateResult = null;
        statusAndEventHandler.onStatusChange(ActionStatus.AUTHENTICATE_DOWNLOAD_STARTED);

        AuthenticateTask authenticateTask = new AuthenticateTask(
                this,
                activationCode);

        new TaskRunner().executeAsync(authenticateTask,
                authenticateResult -> {
                    postProcessAuthenticate(authenticateResult);
                    statusAndEventHandler.onStatusChange(ActionStatus.AUTHENTICATE_DOWNLOAD_FINISHED);
                },
                e -> statusAndEventHandler.onError(new Error("Error authentication of profile download.", e.getMessage(), e)));
    }

    public void postProcessAuthenticate(AuthenticateResult authenticateResult) {
        this.authenticateResult = authenticateResult;

        if(authenticateResult.getSuccess()) {
            // Check if there is a matching profile already installed
            ProfileMetadata newProfile = authenticateResult.getProfileMetadata();
            ProfileMetadata matchingProfile = null;
            if (newProfile != null) {
                ProfileList profileList = this.profileList.getValue();
                if(profileList != null) {
                    matchingProfile = profileList.findMatchingProfile(newProfile.getIccid());
                }
                if ((matchingProfile != null) && (matchingProfile.getNickname() != null)) {
                    Log.debug(TAG, "Profile already installed: " + matchingProfile.getNickname());
                    String errorMessage = "Profile with this ICCID already installed: " + matchingProfile.getNickname();
                    statusAndEventHandler.onError(new Error("Profile already installed!", errorMessage));
                }
            }
        }
    }

    public void startProfileDownload(String confirmationCode) {
        downloadResult = null;
        statusAndEventHandler.onStatusChange(ActionStatus.DOWNLOAD_PROFILE_STARTED);

        new TaskRunner().executeAsync(
                new DownloadTask(this, confirmationCode),
                downloadResult -> {
                    postProcessDownloadProfile(downloadResult);
                    statusAndEventHandler.onStatusChange(ActionStatus.DOWNLOAD_PROFILE_FINISHED);
                },
                e -> statusAndEventHandler.onError(new Error("Error during download of profile.", e.getMessage(), e)));
    }


    private void postProcessDownloadProfile(DownloadResult downloadResult) {
        this.downloadResult = downloadResult;
        ProfileList profileList = this.profileList.getValue();

        Log.debug(TAG, "Post processing new profile. download success: " + downloadResult.getSuccess());
        if(downloadResult.getSuccess() && (profileList != null)) {
            ProfileMetadata profileMetadata = authenticateResult.getProfileMetadata();
            Log.debug(TAG, "Post processing new profile: " + profileMetadata);

            Log.debug(TAG, "Profile nickname: \"" + profileMetadata.getNickname() + "\"");
            if(!profileMetadata.hasNickname()) {
                String nickname = profileList.getUniqueNickname(profileMetadata);

                Log.debug(TAG, "Profile does not have a nickname. So set a new one: \"" + nickname + "\"");
                profileMetadata.setNickname(nickname);
                setNickname(profileMetadata);
            }
        }
    }

    public void startCancelSession(long cancelSessionReason) {
        Log.debug(TAG, "Cancel session: " + cancelSessionReason);

        statusAndEventHandler.onStatusChange(ActionStatus.CANCEL_SESSION_STARTED);

        CancelSessionTask cancelSessionTask = new CancelSessionTask(
                this,
                cancelSessionReason);

        new TaskRunner().executeAsync(cancelSessionTask,
                result -> {
                    cancelSessionResult = result;
                    statusAndEventHandler.onStatusChange(ActionStatus.CANCEL_SESSION_FINISHED);
                },
                e -> statusAndEventHandler.onError(new Error("Error cancelling session.", e.getMessage(), e)));
    }

    @Override
    public void onEuiccConnectionUpdate(EuiccConnection euiccConnection) {
        Log.debug(TAG, "Updated eUICC connection.");
        this.euiccConnection = euiccConnection;
        super.setEuiccChannel(euiccConnection);

        if(euiccConnection != null) {
            refreshProfileListAsync();
        }
    }

    @Override
    public void onConnected() {
        Log.debug(TAG, "Internet connection established.");
        super.enableEs9PlusInterface();
    }

    @Override
    public void onDisconnected() {
        Log.debug(TAG, "Internet connection lost.");
        super.disableEs9PlusInterface();
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        networkStatusBroadcastReceiver.unregisterReceiver();
    }
}