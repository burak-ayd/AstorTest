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
              
              // Bundle'ın geçerli olduğunu kontrol et
              try {
                val bundleContent = bundlePath.readText()
                if (bundleContent.length < 1000) {
                  println("OTA Bundle çok küçük, assets kullanılıyor")
                  return super.getJSBundleFile()
                }
                
                // Bundle'ın JavaScript içerdiğini kontrol et
                if (!bundleContent.contains("__d(function") && !bundleContent.contains("(function("))))) {
                  println("OTA Bundle geçersiz format, assets kullanılıyor")
                  return super.getJSBundleFile()
                }
                
                println("OTA Bundle geçerli, yükleniyor")
                return bundlePath.absolutePath
              } catch (e: Exception) {
                println("OTA Bundle okuma hatası: ${e.message}")
                return super.getJSBundleFile()
              }
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