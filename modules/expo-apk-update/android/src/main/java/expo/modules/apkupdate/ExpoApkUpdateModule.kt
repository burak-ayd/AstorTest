package expo.modules.apkupdate

import android.app.DownloadManager
import android.content.*
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.content.FileProvider
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File

class ExpoApkUpdateModule : Module() {
    private var downloadReceiver: BroadcastReceiver? = null

    // React Native tarafına event gönderirken standart yapı kullanıyoruz
    private fun emitEvent(eventName: String, data: String) {
        this@ExpoApkUpdateModule.sendEvent(eventName, mapOf("status" to data))
    }

    override fun definition() = ModuleDefinition {
        // JS tarafında kullanılacak isim
        Name("ExpoApkUpdate")

        // Dinlenecek eventler
        Events("APKDownloadComplete", "APKInstallResult")

        AsyncFunction("getCurrentVersion") { promise: Promise ->
            try {
                val context = appContext.reactContext ?: throw Exception("React Context null")
                val pkgInfo = context.packageManager.getPackageInfo(context.packageName, 0)
                val result = mapOf(
                    "versionName" to pkgInfo.versionName,
                    "versionCode" to if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) pkgInfo.longVersionCode.toInt() else pkgInfo.versionCode
                )
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("ERROR", e.message, e)
            }
        }

        AsyncFunction("downloadAndInstallAPK") { downloadUrl: String, promise: Promise ->
            Log.d("APKUpdateModule", "downloadAndInstallAPK başladı")
            try {
                val context = appContext.reactContext ?: throw Exception("React Context null")
                cleanupReceiver()
                
                val apkFileName = "AstorTest2-update.apk"
                deleteOldAPKFiles()
                
                val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                
                val request = DownloadManager.Request(Uri.parse(downloadUrl)).apply {
                    setTitle("Uygulama Güncelleniyor")
                    setDescription("Yeni sürüm indiriliyor...")
                    setNotificationVisibility(DownloadManager.Request.VISIBILITY_HIDDEN)
                    setAllowedNetworkTypes(DownloadManager.Request.NETWORK_WIFI or DownloadManager.Request.NETWORK_MOBILE)
                    setAllowedOverRoaming(true)
                    setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, apkFileName)
                }
                
                val downloadId = downloadManager.enqueue(request)
                
                downloadReceiver = object : BroadcastReceiver() {
                    override fun onReceive(ctx: Context?, intent: Intent?) {
                        val id = intent?.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)
                        if (id == downloadId) {
                            cleanupReceiver()
                            checkDownloadStatusAndInstall(downloadManager, downloadId)
                        }
                    }
                }
                
                val filter = IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                    context.registerReceiver(downloadReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
                } else {
                    context.registerReceiver(downloadReceiver, filter)
                }
                
                startDownloadPolling(downloadManager, downloadId, 0)
                promise.resolve("İndirme başlatıldı - Downloads klasörüne")
                
            } catch (e: Exception) {
                cleanupReceiver()
                promise.reject("ERROR", e.message, e)
            }
        }

        AsyncFunction("checkInstallPermission") { promise: Promise ->
            try {
                val canInstall = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    appContext.reactContext?.packageManager?.canRequestPackageInstalls() ?: false
                } else true
                promise.resolve(canInstall)
            } catch (e: Exception) {
                promise.reject("ERROR", e.message, e)
            }
        }

        Function("requestInstallPermission") {
            val activity = appContext.currentActivity
            val context = appContext.reactContext
            if (activity != null && context != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val intent = Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                    data = Uri.parse("package:${context.packageName}")
                }
                activity.startActivity(intent)
            }
        }

        OnDestroy {
            cleanupReceiver()
        }
    }

    private fun checkDownloadStatusAndInstall(dm: DownloadManager, downloadId: Long) {
        try {
            val cursor = dm.query(DownloadManager.Query().setFilterById(downloadId))
            if (cursor != null && cursor.moveToFirst()) {
                val statusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS)
                val reasonIndex = cursor.getColumnIndex(DownloadManager.COLUMN_REASON)
                val localUriIndex = cursor.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI)
                
                if (statusIndex == -1) {
                    cursor.close()
                    emitEvent("APKDownloadComplete", "error: Unable to check download status")
                    return
                }
                
                val status = cursor.getInt(statusIndex)
                val reason = if (reasonIndex != -1) cursor.getInt(reasonIndex) else -1
                val localUri = if (localUriIndex != -1) cursor.getString(localUriIndex) else null
                
                cursor.close()

                when (status) {
                    DownloadManager.STATUS_SUCCESSFUL -> {
                        emitEvent("APKDownloadComplete", "success")
                        val apkFile = getDownloadedFile(dm, downloadId, localUri)
                        if (apkFile != null && apkFile.exists() && apkFile.length() > 0) {
                            Handler(Looper.getMainLooper()).postDelayed({
                                installAPK(apkFile)
                            }, 500)
                        } else {
                            emitEvent("APKDownloadComplete", "error: Downloaded file is empty or missing")
                        }
                    }
                    DownloadManager.STATUS_FAILED -> emitEvent("APKDownloadComplete", "failed: Download failed (reason: $reason)")
                    DownloadManager.STATUS_PENDING -> emitEvent("APKDownloadComplete", "pending")
                    DownloadManager.STATUS_RUNNING -> emitEvent("APKDownloadComplete", "running")
                    DownloadManager.STATUS_PAUSED -> emitEvent("APKDownloadComplete", "paused")
                    else -> emitEvent("APKDownloadComplete", "failed: Unknown status ($status)")
                }
            } else {
                emitEvent("APKDownloadComplete", "failed: No download info")
            }
        } catch (e: Exception) {
            emitEvent("APKDownloadComplete", "error: ${e.message}")
        }
    }

    private fun getDownloadedFile(dm: DownloadManager, downloadId: Long, localUri: String?): File? {
        return try {
            if (localUri != null) {
                when {
                    localUri.startsWith("file://") -> {
                        val filePath = Uri.parse(localUri).path
                        if (filePath != null) File(filePath) else findAPKInDownloads()
                    }
                    localUri.startsWith("content://") -> getFileFromContentUri(localUri) ?: findAPKInDownloads()
                    else -> findAPKInDownloads()
                }
            } else {
                findAPKInDownloads()
            }
        } catch (e: Exception) {
            findAPKInDownloads()
        }
    }

    private fun getFileFromContentUri(contentUri: String): File? {
        return try {
            val context = appContext.reactContext ?: return null
            val uri = Uri.parse(contentUri)
            val cursor = context.contentResolver.query(uri, null, null, null, null)
            if (cursor != null && cursor.moveToFirst()) {
                val dataIndex = cursor.getColumnIndex("_data")
                if (dataIndex != -1) {
                    val filePath = cursor.getString(dataIndex)
                    cursor.close()
                    return if (filePath != null) File(filePath) else null
                }
                cursor.close()
            }
            findAPKInDownloads()
        } catch (e: Exception) {
            findAPKInDownloads()
        }
    }

    private fun findAPKInDownloads(): File? {
        return try {
            val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            val apkFile = File(downloadsDir, "AstorTest2-update.apk")
            if (apkFile.exists()) apkFile else null
        } catch (e: Exception) {
            null
        }
    }

    private fun startDownloadPolling(dm: DownloadManager, downloadId: Long, attempt: Int) {
        if (attempt > 60) {
            emitEvent("APKDownloadComplete", "error: Download timeout")
            return
        }
        
        Handler(Looper.getMainLooper()).postDelayed({
            try {
                val cursor = dm.query(DownloadManager.Query().setFilterById(downloadId))
                if (cursor != null && cursor.moveToFirst()) {
                    val statusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS)
                    if (statusIndex != -1) {
                        val status = cursor.getInt(statusIndex)
                        when (status) {
                            DownloadManager.STATUS_SUCCESSFUL -> {
                                cursor.close()
                                checkDownloadStatusAndInstall(dm, downloadId)
                                return@postDelayed
                            }
                            DownloadManager.STATUS_FAILED -> {
                                cursor.close()
                                emitEvent("APKDownloadComplete", "failed: Download failed")
                                return@postDelayed
                            }
                            else -> {
                                cursor.close()
                                startDownloadPolling(dm, downloadId, attempt + 1)
                            }
                        }
                    } else {
                        cursor.close()
                        startDownloadPolling(dm, downloadId, attempt + 1)
                    }
                } else {
                    cursor?.close()
                    startDownloadPolling(dm, downloadId, attempt + 1)
                }
            } catch (e: Exception) {
                startDownloadPolling(dm, downloadId, attempt + 1)
            }
        }, 5000)
    }

    private fun installAPK(apkFile: File) {
        try {
            if (!apkFile.exists()) {
                emitEvent("APKInstallResult", "error: APK file not found")
                return
            }

            val context = appContext.reactContext ?: return

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!context.packageManager.canRequestPackageInstalls()) {
                    emitEvent("APKInstallResult", "error: Install permission required")
                    // Otomatik olarak ayarları açıyoruz
                    val activity = appContext.currentActivity
                    if (activity != null) {
                       val intent = Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                           data = Uri.parse("package:${context.packageName}")
                       }
                       activity.startActivity(intent)
                    }
                    return
                }
            }

            val intent = Intent(Intent.ACTION_VIEW).apply {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    try {
                        val apkUri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", apkFile)
                        setDataAndType(apkUri, "application/vnd.android.package-archive")
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
                    } catch (e: Exception) {
                        emitEvent("APKInstallResult", "error: FileProvider configuration error: ${e.message}")
                        return
                    }
                } else {
                    val fileUri = Uri.fromFile(apkFile)
                    setDataAndType(fileUri, "application/vnd.android.package-archive")
                }
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
            }

            val resolveInfo = context.packageManager.resolveActivity(intent, 0)
            if (resolveInfo != null) {
                context.startActivity(intent)
                emitEvent("APKInstallResult", "install_started")
            } else {
                emitEvent("APKInstallResult", "error: No app can handle APK installation")
            }
        } catch (e: Exception) {
            emitEvent("APKInstallResult", "error: ${e.message}")
        }
    }

    private fun cleanupReceiver() {
        downloadReceiver?.let {
            try { appContext.reactContext?.unregisterReceiver(it) } catch (_: Exception) {}
            downloadReceiver = null
        }
    }

    private fun deleteOldAPKFiles() {
        try {
            val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            if (!downloadsDir.exists()) return
            
            val targetFile = File(downloadsDir, "AstorTest2-update.apk")
            if (targetFile.exists()) targetFile.delete()
            
            downloadsDir.listFiles { _, name -> 
                name.contains("AstorTest2") && name.endsWith(".apk")
            }?.forEach { it.delete() }
        } catch (e: Exception) {}
    }
}