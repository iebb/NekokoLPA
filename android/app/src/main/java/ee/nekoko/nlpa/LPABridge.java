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

package ee.nekoko.nlpa;

import android.os.Handler;
import android.os.Looper;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.Observer;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.Gson;
import com.infineon.esim.lpa.core.dtos.ActivationCode;
import com.infineon.esim.lpa.core.dtos.EuiccInfo;
import com.infineon.esim.lpa.core.dtos.profile.ProfileMetadata;
import com.infineon.esim.lpa.core.dtos.result.remote.AuthenticateResult;
import com.infineon.esim.lpa.core.dtos.result.remote.CancelSessionResult;
import com.infineon.esim.lpa.core.dtos.result.remote.DownloadResult;
import com.infineon.esim.lpa.data.ActionStatus;
import com.infineon.esim.lpa.data.AsyncActionStatus;
import com.infineon.esim.lpa.data.Error;
import com.infineon.esim.lpa.data.StatusAndEventHandler;
import com.infineon.esim.lpa.lpa.LocalProfileAssistant;
import com.infineon.esim.lpa.util.android.OneTimeEvent;
import com.infineon.esim.util.Log;

import java.util.Date;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

import ee.nekoko.lpa.euicc.EuiccManager;
import io.sentry.Sentry;

public class LPABridge extends ReactContextBaseJavaModule implements StatusAndEventHandler {

    @NonNull
    @Override
    public String getName() {
        return "InfineonDataModel";
    }


    private static final String TAG = LPABridge.class.getName();

    private static LPABridge instance;

    private LocalProfileAssistant lpa;
    private EuiccManager euiccManager;
    private final ReactContext context;

    private final MutableLiveData<AsyncActionStatus> actionStatusLiveData = new MutableLiveData<>();
    private final MutableLiveData<OneTimeEvent<Error>> errorEventLiveData = new MutableLiveData<>();

    // private String _targetICCID = "";
    private long _suppressErrorsUntil = 0;
    private long _suppressErrorsCount = 0;


    @ReactMethod()
    public LPABridge(ReactContext context) {
        this.context = context;
        this.euiccManager = new EuiccManager(context, this);
        this.lpa = new LocalProfileAssistant(euiccManager, this);

        new Handler(Looper.getMainLooper()).post(() -> {
            actionStatusLiveData.observeForever(actionStatusObserver);
            errorEventLiveData.observeForever(errorObserver);
            this.lpa.getProfileListLiveData().observeForever(data -> {
                emitData("profileList", data, false);
            });
            this.euiccManager.getEuiccListLiveData().observeForever(data -> {
                emitData("euiccList", data, true);
            });
        });

        euiccManager.initializeInterfaces();

        instance = this;

    }

    @Override
    public void initialize() {
        emitData("euiccList", euiccManager.getEuiccListLiveData().getValue(), true);
        emitData("profileList", this.lpa.getProfileListLiveData().getValue(), false);
    }

    public static void initializeInstance(ReactContext context) {
        if(instance == null) {
            instance = new LPABridge(context);
        }
    }

    @ReactMethod()
    public static LPABridge getInstance() {
        return instance;
    }


    public void emitData(String key, Object value, boolean global) {
        if(context == null || !context.hasActiveReactInstance()) {
            Log.debug(TAG, "Not ready!");
            Log.debug(TAG, "Failed sending: " + key);
            return;
        }
        String jsonData = new Gson().toJson(value);
        WritableMap params = Arguments.createMap();
        params.putString(key, jsonData);
        if (!global) {
            params.putString("currentEuicc", this.euiccManager.getCurrentEuiccLiveData().getValue());
        }
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDataUpdate", params);
    }


    // observing action status
    final Observer<AsyncActionStatus> actionStatusObserver = actionStatus -> {
        Log.debug(TAG, "Observed that action status changed: " + actionStatus.getActionStatus());
        emitData("status", actionStatus.getActionStatus().ordinal(), false);
        emitData("statusText", actionStatus.getActionStatus(), false);

        switch (actionStatus.getActionStatus()) {
//            case ENABLE_PROFILE_FINISHED:
//            case DELETE_PROFILE_FINISHED:
//            case DISABLE_PROFILE_FINISHED:
//            case SET_NICKNAME_FINISHED:
//                try {
//                    TimeUnit.SECONDS.sleep(1);
//                } catch (InterruptedException ignored) {
//                }
//                refreshProfileList();
//                break;

            case AUTHENTICATE_DOWNLOAD_STARTED:
            case AUTHENTICATE_DOWNLOAD_FINISHED:
                emitData("authenticateResult", this.lpa.getAuthenticateResult(), false);
                break;

            case DOWNLOAD_PROFILE_STARTED:
            case DOWNLOAD_PROFILE_FINISHED:
                emitData("downloadResult", this.lpa.getDownloadResult(), false);
                break;
            case CANCEL_SESSION_STARTED:
            case CANCEL_SESSION_FINISHED:
                emitData("cancelResult", this.lpa.getCancelSessionResult(), false);
                break;
                //case REFRESH_PROFILE_LIST:
           /*
            case ENABLE_PROFILE_STARTED:
                Log.debug(TAG, "Show progress dialog for enabling profile started.");
                progressDialog = DialogHelper.showProgressDialog(this, R.string.action_switching_profile);
                disallowBackButtonPress();
            case ENABLE_PROFILE_FINISHED:
                finish();
                break;
            default:
                // nothing

            */
        }
    };

    // observing action status
    final Observer<OneTimeEvent<Error>> errorObserver = err -> {
        Error e = err.getContentIfNotHandled();
        if (e != null) {
            Exception exc = e.getException();
            if (exc != null) {
                Log.debug(TAG, "SentryId2: " + Sentry.captureException(exc));
            }
            String errHeader = e.getHeader();

            Log.debug(TAG, "Observed error: " + errHeader);
            Log.debug(TAG, "Body: " + e.getBody());
            if (this._suppressErrorsUntil <= new Date().getTime() || this._suppressErrorsCount <= 0) {
                emitData("error", e, true);
                this._suppressErrorsCount = 0;
            } else {
                this._suppressErrorsCount -= 1;
                try {
                    TimeUnit.SECONDS.sleep(5);
                } catch (InterruptedException ignored) {
                }
                if (errHeader != null && errHeader.contains("Exception during initializing eUICC")) {
                    refreshProfileList();
                }
            }
            var action = this.actionStatusLiveData.getValue();
            var euicc = this.euiccManager.getCurrentEuiccLiveData().getValue();


            if (euicc != null && !euicc.equals("NONE")) {
                var body = e.getBody();
                if (body != null && body.contains("no APDU access")) {
                    if (action != null && action.getActionStatus() == ActionStatus.GET_PROFILE_LIST_STARTED) {

                    } else {
                        refreshProfileList();
                    }
                }
            }
        }
    };


    @ReactMethod(isBlockingSynchronousMethod = true)
    public String getCurrentEuicc() {
        return euiccManager.getCurrentEuiccLiveData().getValue();
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public String getEuiccListJSON() {
        return new Gson().toJson(euiccManager.getEuiccListLiveData().getValue());
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public String getProfileListJSON() {
        return new Gson().toJson(lpa.getProfileListLiveData().getValue());
    }

    @ReactMethod()
    public LiveData<AsyncActionStatus> getAsyncActionStatusLiveData() {
        return actionStatusLiveData;
    }

    @ReactMethod()
    public LiveData<OneTimeEvent<Error>> getErrorEventLiveData() {
        return errorEventLiveData;
    }

    // endregion

    // region eUICC interface methods
    @ReactMethod()
    public void refreshEuiccs() {
        Log.debug(TAG, "Refreshing eUICC list...");
        euiccManager.refreshEuiccList();
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public String selectEuicc(String euiccName) {
        Log.debug(TAG, "Selecting euicc " + euiccName + "...");

        try {
            return euiccManager.selectEuicc(euiccName);
        } catch (Exception e) {
            Log.debug(TAG, "SelectEUICC Failed");
            Log.debug(TAG, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public void startConnectingEuiccInterface(String interfaceTag) {
        Log.debug(TAG, "Connecting eUICC interface " + interfaceTag + "...");
        euiccManager.startConnectingEuiccInterface(interfaceTag);
    }

    @SuppressWarnings("unused")
    public void startDisconnectingReader(String interfaceTag) {
        Log.debug(TAG, "Disconnecting eUICC interface " + interfaceTag + "...");
        euiccManager.startDisconnectingInterface(interfaceTag);
    }

    @SuppressWarnings("unused")
    public Boolean isEuiccInterfaceConnected(String readerTag) {
        return euiccManager.isEuiccInterfaceConnected(readerTag);
    }

    // endregion

    // region LPA methods


    @ReactMethod(isBlockingSynchronousMethod = true)
    public String getEuiccInfo1JSON() throws Exception {
        return new Gson().toJson(lpa.es10Interface.es10b_getEuiccInfo1());
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public String getEuiccInfo2JSON() throws Exception {
        return new Gson().toJson(lpa.es10Interface.es10b_getEuiccInfo2());
    }

    public EuiccInfo getEuiccInfo() {
        return lpa.getEuiccInfo();
    }

    public void refreshEuiccInfo() {
        lpa.refreshEuiccInfo();
    }

    @ReactMethod()
    public void refreshProfileList() {
        // lpa.refreshProfileList();
        euiccManager.refreshEuiccList();
    }

    @ReactMethod()
    public void refreshProfileListWithDevice(String device) {
        Log.debug(TAG, "Refreshing eUICC list...");
        euiccManager.refreshEuiccList();
    }

    public void enableProfile(ProfileMetadata profile) {
        lpa.enableProfile(profile);
        euiccManager.refreshSingleEuicc(getCurrentEuicc());
    }

    @ReactMethod()
    public void enableProfileByIccId(String iccid) {
        var profile = Objects.requireNonNull(lpa.getProfileListLiveData().getValue()).findMatchingProfile(iccid);
        if (profile != null) {
            enableProfile(profile);
        }
    }

    public void disableProfile(ProfileMetadata profile) {
        lpa.disableProfile(profile);
        euiccManager.refreshSingleEuicc(getCurrentEuicc());
    }

    @ReactMethod()
    public void disableProfileByIccId(String iccid) {
        var profile = Objects.requireNonNull(lpa.getProfileListLiveData().getValue()).findMatchingProfile(iccid);
        if (profile != null) {
            disableProfile(profile);
        }
    }

    public void deleteProfile(ProfileMetadata profile) {
        lpa.deleteProfile(profile);
        euiccManager.refreshSingleEuicc(getCurrentEuicc());
    }

    @ReactMethod()
    public void deleteProfileByIccId(String iccid) {
        var profile = Objects.requireNonNull(lpa.getProfileListLiveData().getValue()).findMatchingProfile(iccid);
        if (profile != null) {
            deleteProfile(profile);
        }
    }

    public void setNickname(ProfileMetadata profile) {
        lpa.setNickname(profile);
        euiccManager.refreshSingleEuicc(getCurrentEuicc());
    }

    @ReactMethod()
    public void setNicknameByIccId(String iccid, String nickname) {
        Log.debug(TAG, "Set Nickname " + nickname);
        var profile = Objects.requireNonNull(lpa.getProfileListLiveData().getValue()).findMatchingProfile(iccid);
        if (profile != null) {
            profile.setNickname(nickname);
            lpa.setNickname(profile);
        }
    }

    public void handleAndClearAllNotifications() {
        lpa.handleAndClearAllNotifications();
    }

    public void authenticate(ActivationCode activationCode) {
        lpa.startAuthentication(activationCode);
    }


    @ReactMethod()
    public void authenticateWithCode(String activationCode) {
        ActivationCode ac = new ActivationCode(activationCode);
        lpa.startAuthentication(ac);
    }

    public AuthenticateResult getAuthenticateResult() {
        return lpa.getAuthenticateResult();
    }

    @ReactMethod()
    public void downloadProfile(String confirmationCode) {
        lpa.startProfileDownload(confirmationCode);
    }

    public DownloadResult getDownloadResult() {
        return lpa.getDownloadResult();
    }

    @ReactMethod()
    public void cancelSession(double cancelSessionReason) {
        lpa.startCancelSession((long) cancelSessionReason);
    }

    public CancelSessionResult getCancelSessionResult() {
        return lpa.getCancelSessionResult();
    }

    // endregion

    // region Status and error handling

    @Override
    public void onStatusChange(AsyncActionStatus newAsyncActionStatus) {
        actionStatusLiveData.postValue(newAsyncActionStatus);
    }

    @Override
    public void onStatusChange(ActionStatus actionStatus) {
        Log.debug(TAG, "Changing action status to: " + actionStatus);
        actionStatusLiveData.postValue(new AsyncActionStatus(actionStatus));
    }

    @Override
    public void onError(Error error) {
        Log.error(TAG, error.getHeader() + ": " + error.getBody());
        triggerErrorEvent(error);
    }

    private void triggerErrorEvent(Error error) {
        Log.debug(TAG,"Setting new error event.");
        Log.debug(TAG,error.toString());
        OneTimeEvent<Error> newErrorEvent = new OneTimeEvent<>(error);
        errorEventLiveData.postValue(newErrorEvent);
    }



    // endregion
}
