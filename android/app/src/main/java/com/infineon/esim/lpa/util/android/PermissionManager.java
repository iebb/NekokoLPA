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

package com.infineon.esim.lpa.util.android;

import android.app.AlertDialog;
import android.content.Context;
import android.content.pm.PackageManager;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;

import com.infineon.esim.lpa.data.Preferences;
import com.infineon.esim.util.Log;

import java.util.ArrayList;
import java.util.List;

public class PermissionManager {
    private static final String TAG = PermissionManager.class.getName();


    public interface Callback {
        void onComplete(Boolean allGranted);
    }

    private Context context;
    private Callback callback;

    private final List<PermissionRequest> permissionRequests;

    private final ActivityResultLauncher<String> permissionCheck;

    public static class PermissionRequest {
        private final String permissionName;
        private final String rationaleTitle;
        private final String rationaleBody;

        private int requestCounter = 2;

        public PermissionRequest(String permissionName, String rationaleTitle, String rationaleBody) {
            this.permissionName = permissionName;
            this.rationaleTitle = rationaleTitle;
            this.rationaleBody = rationaleBody;
        }

        public String getPermissionName() {
            return permissionName;
        }

        public String getRationaleTitle() {
            return rationaleTitle;
        }

        public String getRationaleBody() {
            return rationaleBody;
        }

        public void decrementCounter() {
            this.requestCounter--;
        }

        public boolean shouldAskForPermission() {
            return this.requestCounter > 0;
        }
    }

    public PermissionManager(@NonNull Fragment fragment) {
        this.permissionRequests = new ArrayList<>();
        permissionCheck = fragment.registerForActivityResult(new ActivityResultContracts.RequestPermission(),
                isGranted -> {
                    Log.debug(TAG, "Permission is granted: " + isGranted);

                    // Handle the rest of the permissions
                    handleNotGrantedPermissionRequests();
                });
    }

    public PermissionManager(@NonNull FragmentActivity fragmentActivity) {
        this.permissionRequests = new ArrayList<>();
        permissionCheck = fragmentActivity.registerForActivityResult(new ActivityResultContracts.RequestPermission(),
                isGranted -> {
                    Log.debug(TAG, "Permission is granted: " + isGranted);

                    // Handle the rest of the permissions
                    handleNotGrantedPermissionRequests();
                });
    }

    public PermissionManager context(Context context) {
        this.context = context;
        return this;
    }

    public PermissionManager request(List<PermissionRequest> permissionRequests) {
        this.permissionRequests.addAll(permissionRequests);
        return this;
    }


    public void checkPermission(Callback callback) {
        Log.debug(TAG, "Checking permissions.");
        this.callback = callback;

        handleNotGrantedPermissionRequests();
    }

    private void handleNotGrantedPermissionRequests() {
        for(PermissionRequest permissionRequest : permissionRequests) {
            if(!hasPermission(permissionRequest.getPermissionName())) {
                if (permissionRequest.shouldAskForPermission() && !Preferences.getPermissionFinallyDenied(permissionRequest.getPermissionName())) {
                    Log.debug(TAG, "Shall ask for permission for \"" + permissionRequest.getPermissionName() + "\"");
                    displayRationale(permissionRequest);
                    return;
                } else {
                    Log.debug(TAG, "Finally denied permission for \"" + permissionRequest.getPermissionName() + "\"");
                    Preferences.setPermissionFinallyDenied(permissionRequest.getPermissionName());
                    sendNegativeResult();
                    return;
                }
            }
        }

        sendPositiveResult();
    }

    private void displayRationale(PermissionRequest permissionRequest) {
        new AlertDialog.Builder(context)
                .setTitle(permissionRequest.getRationaleTitle())
                .setMessage(permissionRequest.getRationaleBody())
                .setCancelable(false)
                .setPositiveButton("OK", (dialog, which) -> requestPermission(permissionRequest)).show();
    }

    public void requestPermission(PermissionRequest permissionRequest) {
        Log.debug(TAG, "Requesting permission \"" + permissionRequest.getPermissionName() + "\"");
        Log.debug(TAG, "Tries left: " + permissionRequest.requestCounter);
        permissionRequest.decrementCounter();

        permissionCheck.launch(permissionRequest.getPermissionName());
    }

    private void sendPositiveResult() {
        callback.onComplete(true);
        cleanUp();
    }

    private void sendNegativeResult() {
        callback.onComplete(false);
        cleanUp();
    }

    private void cleanUp() {
        permissionRequests.clear();
        callback = null;
    }

    private boolean hasPermission(String permission) {
        Log.debug(TAG, "Checking permission \"" + permission + "\"");
        boolean hasPermission = ActivityCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED;
        Log.debug(TAG, "Has permission \"" + permission + "\": " + hasPermission);
        return hasPermission;
    }
}
