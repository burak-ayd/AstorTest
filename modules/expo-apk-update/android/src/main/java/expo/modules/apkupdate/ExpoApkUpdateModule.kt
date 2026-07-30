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
        Log.d("APKUpdateModule", "Event gönderiliyor: $eventName = $data")
        this@ExpoApkUpdateModule.sendEvent(eventName, mapOf("status" to data))
        Log.d("APKUpdateModule", "Event gönderildi: $eventName")
    }

    override fun definition() = ModuleDefinition {
        // JS tarafında kullanılacak isim
        Name("ExpoApkUpdate")

        // Dinlenecek eventler
        Events("APKDownloadComplete", "APKInstallResult", "APKDownloadProgress")

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
            Log.d("APKUpdateModule", "checkDownloadStatusAndInstall başladı, downloadId: $downloadId")
            val cursor = dm.query(DownloadManager.Query().setFilterById(downloadId))
            if (cursor != null && cursor.moveToFirst()) {
                val statusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS)
                val reasonIndex = cursor.getColumnIndex(DownloadManager.COLUMN_REASON)
                val localUriIndex = cursor.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI)
                
                if (statusIndex == -1) {
                    cursor.close()
                    Log.e("APKUpdateModule", "Status index bulunamadı")
                    emitEvent("APKDownloadComplete", "error: Unable to check download status")
                    return
                }
                
                val status = cursor.getInt(statusIndex)
                val reason = if (reasonIndex != -1) cursor.getInt(reasonIndex) else -1
                val localUri = if (localUriIndex != -1) cursor.getString(localUriIndex) else null
                
                cursor.close()
                
                Log.d("APKUpdateModule", "Download status: $status, reason: $reason, localUri: $localUri")

                when (status) {
                    DownloadManager.STATUS_SUCCESSFUL -> {
                        Log.d("APKUpdateModule", "İndirme başarılı! Event gönderiliyor...")
                        emitEvent("APKDownloadComplete", "success")
                        Log.d("APKUpdateModule", "APKDownloadComplete event gönderildi")
                        
                        val apkFile = getDownloadedFile(dm, downloadId, localUri)
                        if (apkFile != null && apkFile.exists() && apkFile.length() > 0) {
                            Log.d("APKUpdateModule", "APK dosyası bulundu: ${apkFile.absolutePath}, boyut: ${apkFile.length()}")
                            Handler(Looper.getMainLooper()).postDelayed({
                                Log.d("APKUpdateModule", "installAPK çağrılıyor...")
                                installAPK(apkFile)
                            }, 500)
                        } else {
                            Log.e("APKUpdateModule", "APK dosyası bulunamadı veya boş")
                            emitEvent("APKDownloadComplete", "error: Downloaded file is empty or missing")
                        }
                    }
                    DownloadManager.STATUS_FAILED -> {
                        Log.e("APKUpdateModule", "İndirme başarısız, reason: $reason")
                        emitEvent("APKDownloadComplete", "failed: Download failed (reason: $reason)")
                    }
                    DownloadManager.STATUS_PENDING -> {
                        Log.d("APKUpdateModule", "İndirme beklemede")
                        emitEvent("APKDownloadComplete", "pending")
                    }
                    DownloadManager.STATUS_RUNNING -> {
                        Log.d("APKUpdateModule", "İndirme devam ediyor")
                        emitEvent("APKDownloadComplete", "running")
                    }
                    DownloadManager.STATUS_PAUSED -> {
                        Log.d("APKUpdateModule", "İndirme duraklatıldı")
                        emitEvent("APKDownloadComplete", "paused")
                    }
                    else -> {
                        Log.e("APKUpdateModule", "Bilinmeyen durum: $status")
                        emitEvent("APKDownloadComplete", "failed: Unknown status ($status)")
                    }
                }
            } else {
                Log.e("APKUpdateModule", "Cursor null veya boş")
                emitEvent("APKDownloadComplete", "failed: No download info")
            }
        } catch (e: Exception) {
            Log.e("APKUpdateModule", "checkDownloadStatusAndInstall hatası: ${e.message}", e)
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
        if (attempt > 120) { // 120 * 500ms = 60 saniye
            emitEvent("APKDownloadComplete", "error: Download timeout")
            return
        }
        
        Handler(Looper.getMainLooper()).postDelayed({
            try {
                val cursor = dm.query(DownloadManager.Query().setFilterById(downloadId))
                if (cursor != null && cursor.moveToFirst()) {
                    val statusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS)
                    val bytesDownloadedIndex = cursor.getColumnIndex(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR)
                    val bytesTotalIndex = cursor.getColumnIndex(DownloadManager.COLUMN_TOTAL_SIZE_BYTES)
                    
                    if (statusIndex != -1) {
                        val status = cursor.getInt(statusIndex)
                        
                        // İndirme progress'ini hesapla ve gönder
                        if (bytesDownloadedIndex != -1 && bytesTotalIndex != -1) {
                            val bytesDownloaded = cursor.getLong(bytesDownloadedIndex)
                            val bytesTotal = cursor.getLong(bytesTotalIndex)
                            
                            if (bytesTotal > 0) {
                                val progress = ((bytesDownloaded.toFloat() / bytesTotal.toFloat()) * 100).toInt()
                                Log.d("APKUpdateModule", "İndirme progress: $progress% ($bytesDownloaded / $bytesTotal bytes)")
                                
                                // Progress event'i gönder
                                this@ExpoApkUpdateModule.sendEvent("APKDownloadProgress", mapOf(
                                    "progress" to progress,
                                    "bytesDownloaded" to bytesDownloaded,
                                    "bytesTotal" to bytesTotal
                                ))
                            }
                        }
                        
                        when (status) {
                            DownloadManager.STATUS_SUCCESSFUL -> {
                                cursor.close()
                                Log.d("APKUpdateModule", "İndirme tamamlandı!")
                                // Son progress: 100%
                                this@ExpoApkUpdateModule.sendEvent("APKDownloadProgress", mapOf(
                                    "progress" to 100,
                                    "bytesDownloaded" to 0L,
                                    "bytesTotal" to 0L
                                ))
                                checkDownloadStatusAndInstall(dm, downloadId)
                                return@postDelayed
                            }
                            DownloadManager.STATUS_FAILED -> {
                                cursor.close()
                                Log.e("APKUpdateModule", "İndirme başarısız!")
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
                Log.e("APKUpdateModule", "Polling hatası: ${e.message}", e)
                startDownloadPolling(dm, downloadId, attempt + 1)
            }
        }, 500) // Her 500ms'de bir kontrol et (daha sık güncelleme)
    }

    private fun installAPK(apkFile: File) {
        try {
            Log.d("APKUpdateModule", "installAPK başladı, dosya: ${apkFile.absolutePath}")
            
            if (!apkFile.exists()) {
                Log.e("APKUpdateModule", "APK dosyası bulunamadı!")
                emitEvent("APKInstallResult", "error: APK file not found")
                return
            }

            val context = appContext.reactContext
            if (context == null) {
                Log.e("APKUpdateModule", "React context null!")
                emitEvent("APKInstallResult", "error: React context is null")
                return
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!context.packageManager.canRequestPackageInstalls()) {
                    Log.e("APKUpdateModule", "Yükleme izni yok!")
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

            Log.d("APKUpdateModule", "Intent oluşturuluyor...")
            val intent = Intent(Intent.ACTION_VIEW).apply {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    try {
                        Log.d("APKUpdateModule", "FileProvider ile URI oluşturuluyor...")
                        val apkUri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", apkFile)
                        Log.d("APKUpdateModule", "APK URI: $apkUri")
                        setDataAndType(apkUri, "application/vnd.android.package-archive")
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
                    } catch (e: Exception) {
                        Log.e("APKUpdateModule", "FileProvider hatası: ${e.message}", e)
                        emitEvent("APKInstallResult", "error: FileProvider configuration error: ${e.message}")
                        return
                    }
                } else {
                    Log.d("APKUpdateModule", "File URI oluşturuluyor (Android < N)...")
                    val fileUri = Uri.fromFile(apkFile)
                    setDataAndType(fileUri, "application/vnd.android.package-archive")
                }
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
            }

            val resolveInfo = context.packageManager.resolveActivity(intent, 0)
            if (resolveInfo != null) {
                Log.d("APKUpdateModule", "Yükleyici başlatılıyor...")
                context.startActivity(intent)
                Log.d("APKUpdateModule", "Yükleyici başlatıldı! Event gönderiliyor...")
                emitEvent("APKInstallResult", "install_started")
                Log.d("APKUpdateModule", "APKInstallResult event gönderildi")
            } else {
                Log.e("APKUpdateModule", "APK yükleyici bulunamadı!")
                emitEvent("APKInstallResult", "error: No app can handle APK installation")
            }
        } catch (e: Exception) {
            Log.e("APKUpdateModule", "installAPK hatası: ${e.message}", e)
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