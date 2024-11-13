package ee.nekoko.nlpa;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class SIMChangeReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(final Context context, final Intent intent) {

        Log.d("SimChangedReceiver", "--> SIM state changed <--");
        Log.d("SimChangedReceiver", "--> Refreshing eUICCs <--");
    }
}