package ee.nekoko.nlpa


import android.app.Application
import android.content.Context
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.hardware.usb.UsbManager
import android.net.ConnectivityManager
import android.net.wifi.WifiManager
import androidx.preference.PreferenceManager
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.infineon.esim.lpa.core.es9plus.TlsUtil
import com.infineon.esim.lpa.util.android.IO
import com.infineon.esim.lpa.util.android.NetworkStatus
import com.infineon.esim.util.Log


class MainApplication : Application(), ReactApplication {
    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): MutableList<ReactPackage>? =
                PackageList(this).packages.apply {
                    add(MainPackage())
                }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        }

    override val reactHost: ReactHost
        get() = getDefaultReactHost(applicationContext, reactNativeHost)

    init {
        instance = this
    }


    companion object {
        private var instance: MainApplication? = null

        @JvmStatic
        fun getAppContext(): Context {
            return instance!!.applicationContext
        }

        @JvmStatic
        fun getSharedPreferences(): SharedPreferences {
            return PreferenceManager.getDefaultSharedPreferences(instance!!.applicationContext)
        }

        @JvmStatic
        fun getStringResource(id: Int): String {
            return instance!!.resources.getString(id)
        }

        @JvmStatic
        fun getPacketManager(): PackageManager {
            return instance!!.applicationContext.packageManager
        }

        @JvmStatic
        fun getUsbManager(): UsbManager {
            return instance!!.applicationContext.getSystemService(Context.USB_SERVICE) as UsbManager
        }

        @JvmStatic
        fun getConnectivityManager(): ConnectivityManager {
            return instance!!.applicationContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        }

        @JvmStatic
        fun getWifiManager(): WifiManager {
            return instance!!.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
        }
    }

    override fun onCreate() {
        super.onCreate()
        Log.debug("nekoko.nlpa", "Initializing application.")

        // Register network callback for network status
        NetworkStatus.registerNetworkCallback()

        // Set trusted Root CAs
        initializeTrustedRootCas()
        SoLoader.init(this, false)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            load()
        }
    }

    fun initializeTrustedRootCas() {
        val liveCertificates: MutableList<java.security.cert.Certificate> =
            ArrayList()
        liveCertificates.add(
            IO.readCertificateFromResource(
                resources,
                R.raw.symantec_gsma_rspv2_root_ci1_pem
            )
        )

        val testCertificates: MutableList<java.security.cert.Certificate> =
            ArrayList()
        testCertificates.add(
            IO.readCertificateFromResource(
                resources,
                R.raw.gsma_test_root_ca_cert_pem
            )
        )
        testCertificates.add(
            IO.readCertificateFromResource(
                resources,
                R.raw.gsma_root_ci_test_1_2_pem
            )
        )
        testCertificates.add(
            IO.readCertificateFromResource(
                resources,
                R.raw.gsma_root_ci_test_1_5_pem
            )
        )
        TlsUtil.initializeCertificates(liveCertificates, testCertificates)

        TlsUtil.setTrustLevel(false) // true => trust test CI
    }


}
