package ee.nekoko.nlpa_utils

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import okhttp3.Call
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import java.io.IOException
import java.security.SecureRandom
import java.security.cert.X509Certificate
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager

class CustomHttp @ReactMethod constructor(private val context: ReactContext?) : ReactContextBaseJavaModule() {


    @ReactMethod
    fun sendHttpRequest(url: String, body: String, promise: Promise) {
        Log.d(TAG, "Use Custom HTTP: Server URL: $url")
        val trustAllCertificates = arrayOf<TrustManager>(
            object : X509TrustManager {
                override fun checkClientTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
                override fun checkServerTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
                override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
            }
        )

        // Install the all-trusting TrustManager
        val sslContext = SSLContext.getInstance("SSL")
        sslContext.init(null, trustAllCertificates, SecureRandom())

        // Create an OkHttpClient that trusts all certificates
        val client = OkHttpClient.Builder()
            .sslSocketFactory(sslContext.socketFactory, trustAllCertificates[0] as X509TrustManager)
            .hostnameVerifier { _, _ -> true }
            .build()

        // Set up the JSON media type and the request body
        val mediaType = "application/json; charset=utf-8".toMediaTypeOrNull()

        // Build the request with custom headers
        val request = Request.Builder()
            .url(url)
            .post(body.toRequestBody(mediaType))
            .addHeader("Content-Type", "application/json")
            .addHeader("Accept", "application/json")
            .addHeader("User-Agent", "gsma-rsp-lpad")
            .addHeader("X-Admin-Protocol", "gsma/rsp/v2.2.0")
            .build()

        // Execute the request
        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                e.printStackTrace()
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    if (!response.isSuccessful) {
                        promise.reject(response.code.toString(), response.toString())
                    } else {
                        promise.resolve(response.body?.string())
                    }
                }
            }
        })
    }

    companion object {
        private val TAG: String = CustomHttp::class.java.name
    }

    override fun getName(): String {
        return "CustomHttp"
    }
}