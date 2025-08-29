// android/app/src/main/java/com/burakaydogan/AstorTest2/DebugModule.kt
package com.burakaydogan.AstorTest2

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.io.File

class DebugModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "DebugModule"
    }

    @ReactMethod
    fun checkBundleFile(promise: Promise) {
        try {
            val context = reactApplicationContext
            val bundlePath = File(context.filesDir, "index.android.bundle")
            
            val result = mapOf(
                "exists" to bundlePath.exists(),
                "path" to bundlePath.absolutePath,
                "size" to if (bundlePath.exists()) bundlePath.length() else 0,
                "lastModified" to if (bundlePath.exists()) bundlePath.lastModified() else 0,
                "canRead" to if (bundlePath.exists()) bundlePath.canRead() else false
            )
            
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}