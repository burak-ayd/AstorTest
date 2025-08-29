package com.burakaydogan.AstorTest2

import android.app.Application
import android.content.res.Configuration
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper
import java.io.File

class MainApplication : Application(), ReactApplication {
  override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
        this,
        object : DefaultReactNativeHost(this) {
          override fun getPackages(): List<ReactPackage> {
  val packages = PackageList(this).packages
  // Bu satırı ekleyin:
  packages.add(object : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext) = 
      listOf(DebugModule(reactContext))
    override fun createViewManagers(reactContext: ReactApplicationContext) = emptyList<ViewManager<*, *>>()
  })
  return packages
}

          override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

          override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

          override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED

          override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED

          // OTA bundle desteği - Bundle yükleme önceliği
          override fun getJSBundleFile(): String? {
            if (BuildConfig.DEBUG) {
              return super.getJSBundleFile()
            }

            val context = applicationContext
            val bundlePath = File(context.filesDir, "index.android.bundle")
            
            // Log ekleyin debug için
            println("OTA Bundle Check: ${bundlePath.absolutePath}")
            println("OTA Bundle Exists: ${bundlePath.exists()}")
            
            if (bundlePath.exists()) {
              println("OTA Bundle Size: ${bundlePath.length()} bytes")
              return bundlePath.absolutePath
            }
            
            return super.getJSBundleFile()
          }

          // Asset bundle'ını tamamen devre dışı bırak OTA varsa
          override fun getBundleAssetName(): String? {
            if (BuildConfig.DEBUG) {
              return super.getBundleAssetName()
            }

            val context = applicationContext
            val bundlePath = File(context.filesDir, "index.android.bundle")
            
            // OTA bundle varsa asset bundle kullanma
            return if (bundlePath.exists()) {
              null
            } else {
              super.getBundleAssetName()
            }
          }
      }
  )

  override val reactHost: ReactHost
    get() = ReactNativeHostWrapper.createReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}