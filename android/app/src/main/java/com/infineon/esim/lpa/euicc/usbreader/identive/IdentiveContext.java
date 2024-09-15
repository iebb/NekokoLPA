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

package com.infineon.esim.lpa.euicc.usbreader.identive;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.ContextWrapper;
import android.content.Intent;
import android.content.IntentFilter;

import com.infineon.esim.util.Log;

final public class IdentiveContext extends ContextWrapper {
    private static final String TAG = IdentiveContext.class.getName();

    private BroadcastReceiver broadcastReceiver = null;

    IdentiveContext(Context context) {
        super(context);
    }

    @Override
    protected void finalize() throws Throwable {
        Log.debug(TAG, "Finalizing IdentiveContext.");
        try {
            unregisterReceiver();
        } finally {
            super.finalize();
        }
    }
    
    @Override
    public Intent registerReceiver(BroadcastReceiver receiver, IntentFilter filter) {
        Log.debug(TAG, "Registering receiver");
        broadcastReceiver = receiver;
        return super.registerReceiver(receiver, filter);
    }

    // fixed resource leak in SCard.class
    // - missing a call to unregisterReceiver()
    public void unregisterReceiver() {
        if (broadcastReceiver != null) {
            Log.debug(TAG, "Unregistering receiver.");
            super.unregisterReceiver(broadcastReceiver);
            broadcastReceiver = null;
        }
    }
}
