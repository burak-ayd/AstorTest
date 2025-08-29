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
            // Packages that cannot be autolinked yet can be added manually here, for example:
            // packages.add(MyReactNativePackage())
            return packages
          }

          override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

          override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

          override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED

          override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED

          // OTA bundle desteği için bundle dosyasının konumunu override et
          override fun getJSBundleFile(): String? {
            // Sadece release modda OTA bundle'ını kontrol et
            if (BuildConfig.DEBUG) {
              return super.getJSBundleFile()
            }

            val context = applicationContext
            // DocumentDirectoryPath ile uyumlu olması için filesDir/Documents kullan
            val documentsDir = File(context.filesDir, "Documents")
            if (!documentsDir.exists()) {
              documentsDir.mkdirs()
            }
            
            val bundlePath = File(documentsDir, "index.android.bundle")
            
            return if (bundlePath.exists()) {
              bundlePath.absolutePath
            } else {
              super.getJSBundleFile()
            }
          }

          // Bundle asset ismini override et
          override fun getBundleAssetName(): String? {
            // Debug modda varsayılan davranışı kullan
            if (BuildConfig.DEBUG) {
              return super.getBundleAssetName()
            }

            val context = applicationContext
            val documentsDir = File(context.filesDir, "Documents")
            val bundlePath = File(documentsDir, "index.android.bundle")
            
            return if (bundlePath.exists()) {
              null // JSBundleFile kullanıldığında null döndür
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