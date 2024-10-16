package ee.nekoko.nlpa


import android.app.Application
import android.content.Context
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.hardware.usb.UsbManager
import android.net.ConnectivityManager
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
import com.infineon.esim.lpa.util.android.NetworkStatus
import com.infineon.esim.util.Log
import java.security.KeyManagementException
import java.security.NoSuchAlgorithmException
import java.security.SecureRandom
import java.security.cert.CertificateException
import java.security.cert.X509Certificate
import javax.net.ssl.HttpsURLConnection
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager


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
    }

    private fun disableSSLCertificateChecking() {
        val trustAllCerts = arrayOf<TrustManager>(object : X509TrustManager {
            override fun getAcceptedIssuers(): Array<X509Certificate>? {
                return null
            }

            @Throws(CertificateException::class)
            override fun checkClientTrusted(arg0: Array<X509Certificate?>?, arg1: String?) {
                // Not implemented
            }

            @Throws(CertificateException::class)
            override fun checkServerTrusted(arg0: Array<X509Certificate?>?, arg1: String?) {
                // Not implemented
            }
        })

        try {
            val sc = SSLContext.getInstance("TLS")

            sc.init(null, trustAllCerts, SecureRandom())

            HttpsURLConnection.setDefaultSSLSocketFactory(sc.socketFactory)
        } catch (e: KeyManagementException) {
            e.printStackTrace()
        } catch (e: NoSuchAlgorithmException) {
            e.printStackTrace()
        }
    }
    override fun onCreate() {
        super.onCreate()
        Log.debug("nekoko.nlpa", "Initializing application.")
        NetworkStatus.registerNetworkCallback()
        SoLoader.init(this, false)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            load()
        }
        Log.debug("nekoko.nlpa", "Initialized.")
        disableSSLCertificateChecking()
    }

}
