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

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.view.WindowManager;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import ee.nekoko.nlpa.MainApplication;
import ee.nekoko.nlpa.R;
import com.infineon.esim.lpa.data.Error;
import com.infineon.esim.util.Log;

public class DialogHelper {
    private static final String TAG = DialogHelper.class.getName();

    @SuppressWarnings("unused")
    public static void showToastMessage(Context context, int stringId) {
        Toast.makeText(context, stringId, Toast.LENGTH_SHORT).show();
    }

    public static void showGenericErrorDialog(final Activity activity) {
        showGenericErrorDialog(activity, false);
    }

    public static void showGenericErrorDialog(final Activity activity, final Boolean doActivityFinish) {
        showErrorDialog(activity,
                R.string.error_generic_heading,
                R.string.error_generic_body,
                doActivityFinish);
    }

    public static void showErrorDialog(final Activity activity,
                                       final Error error,
                                       final Boolean doActivityFinish) {
        showErrorDialog(activity, error.getHeader(), error.getBody(), doActivityFinish);
    }

    public static void showErrorDialog(final Activity activity,
                                       final String heading,
                                       final String body,
                                       final Boolean doActivityFinish) {
        showErrorDialog(activity, 0, 0, heading, 0, body, doActivityFinish);
    }

    public static void showErrorDialog(final Activity activity,
                                       final int heading,
                                       final int body,
                                       final Boolean doActivityFinish) {
        showErrorDialog(activity, 0, heading, null, body, null, doActivityFinish);
    }

    public static void showErrorDialog(final Activity activity,
                                       final int iconId,
                                       final int heading,
                                       final int body,
                                       final Boolean doActivityFinish) {
        showErrorDialog(activity, iconId, heading, null, body, null, doActivityFinish);
    }

    public static void showErrorDialog(final Activity activity,
                                       final int heading,
                                       final String body,
                                       final Boolean doActivityFinish) {
        showErrorDialog(activity, 0, heading, null, 0, body, doActivityFinish);
    }

    public static void showErrorDialog(final Activity activity,
                                       final int iconId,
                                       final int heading,
                                       final String headingStr,
                                       final int body,
                                       final String bodyStr,
                                       final Boolean doActivityFinish) {
        try {
            AlertDialog.Builder builder = new AlertDialog.Builder(activity)
                    .setCancelable(false)
                    .setPositiveButton(android.R.string.ok, (dialog, id) -> {
                        dialog.dismiss();
                        if (doActivityFinish) {
                            activity.finish();
                        }
                    });
            if(iconId != 0) {
                builder.setIcon(iconId);
            }

            if (headingStr != null) {
                builder.setTitle(headingStr);
            } else {
                builder.setTitle(heading);
            }

            if (bodyStr != null) {
                builder.setMessage(bodyStr);
            } else {
                builder.setMessage(body);
            }

            builder.show();

        } catch (WindowManager.BadTokenException unused) {
            // Ignore... happens if the activity was destroyed
        }
    }

    public static AlertDialog showCancelableProgressDialog(Activity activity, String body, DialogInterface.OnClickListener onCancelListener) {
        return showProgressDialog(activity, body, onCancelListener);
    }

    public static AlertDialog showProgressDialog(Activity activity, int bodyResourceId) {
        return showProgressDialog(activity, MainApplication.getStringResource(bodyResourceId));
    }

    public static AlertDialog showProgressDialog(Activity activity, String body) {
        return showProgressDialog(activity, body, null);
    }

    // To close the dialog, use progressDialog.dismiss()
    private static AlertDialog showProgressDialog(Activity activity, String bodyString, DialogInterface.OnClickListener onCancelListener) {
        AlertDialog progressDialog = null;
        try {
            ProgressBar progressBar = new ProgressBar(activity, null, android.R.attr.progressBarStyle);
            if(onCancelListener == null) {
                progressBar.setPadding(0,75,0,100);
            } else {
                progressBar.setPadding(0, 75, 0, 0);
            }

            AlertDialog.Builder builder = new AlertDialog.Builder(activity)
                    .setView(progressBar)
                    .setTitle(bodyString);

            if(onCancelListener != null) {
                builder.setNegativeButton(R.string.generic_button_cancel_text, onCancelListener);
            }

            progressDialog = builder.create();
            progressDialog.setCanceledOnTouchOutside(false);
            progressDialog.show();

        } catch (WindowManager.BadTokenException unused) {
            // Ignore... happens if the activity was destroyed
        }
        return progressDialog;
    }

    public static void showEditTextDialog(Activity activity, String title, String editTextHint, TextReturnCallback textReturnCallback) {

        try {
            LinearLayout linearLayout = new LinearLayout(activity);
            linearLayout.setLayoutParams(new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.MATCH_PARENT));
            linearLayout.setPadding(75,0,0,0);

            EditText editText = new EditText(activity);
            editText.setHint(editTextHint);
            editText.setText(editTextHint);
            linearLayout.addView(editText);

            AlertDialog.Builder builder = new AlertDialog.Builder(activity)
                    .setTitle(title)
                    .setView(linearLayout)
                    .setCancelable(true)
                    .setPositiveButton(R.string.generic_button_ok_text, (dialogInterface, i) -> {
                        Log.debug(TAG, "OK button has been clicked. Edit text is: " + editText.getEditableText().toString());
                        textReturnCallback.onReturn(editText.getEditableText().toString());
                    })
                    .setNegativeButton(R.string.generic_button_cancel_text,null);

            AlertDialog dialog = builder.create();
            dialog.setCanceledOnTouchOutside(false);
            dialog.show();
        } catch (WindowManager.BadTokenException unused) {
            // Ignore... happens if the activity was destroyed
        }
    }

    public interface TextReturnCallback {
        void onReturn(String text);
    }
}
