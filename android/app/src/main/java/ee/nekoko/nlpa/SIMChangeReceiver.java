package ee.nekoko.nlpa;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import com.infineon.esim.util.Log;

public class SIMChangeReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(final Context context, final Intent intent) {

        Log.debug("SimChangedReceiver", "--> SIM state changed <--");
        Log.debug("SimChangedReceiver", "--> Refreshing eUICCs <--");
//        var model = LPABridge.getInstance();
//        model.refreshEuiccs();
    }
}