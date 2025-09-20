package com.burakaydogan.AstorTest

import android.app.DownloadManager
import android.content.*
import android.net.Uri
import android.os.Build
import android.os.Environment
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File
import android.util.Log
import android.app.Activity
class APKUpdateModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var downloadReceiver: BroadcastReceiver? = null

    // Bu satırı ekleyin - currentActivity property'si
    private val currentReactActivity: Activity?
        get() = reactApplicationContext.currentActivity

    override fun getName() = "APKUpdateModule"

    @ReactMethod
    fun getCurrentVersion(promise: Promise) {
        try {
            val context = reactApplicationContext
            val pkgInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            val result = WritableNativeMap().apply {
                putString("versionName", pkgInfo.versionName)
                putInt("versionCode", if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) pkgInfo.longVersionCode.toInt() else pkgInfo.versionCode)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun downloadAndInstallAPK(downloadUrl: String, promise: Promise) {
        Log.d("APKUpdateModule", "downloadAndInstallAPK başladı")
        try {
            val context = reactApplicationContext
            cleanupReceiver()
            
            val apkFileName = "AstorTest2-update.apk"
            // Önce eski dosyaları temizle
            deleteOldAPKFiles()
            val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            
            val request = DownloadManager.Request(Uri.parse(downloadUrl)).apply {
                setTitle("Uygulama Güncelleniyor")
                setDescription("Yeni sürüm indiriliyor...")
                // setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_HIDDEN)
                setAllowedNetworkTypes(DownloadManager.Request.NETWORK_WIFI or DownloadManager.Request.NETWORK_MOBILE)
                setAllowedOverRoaming(true)
                
                // Public Downloads klasörüne indir
                setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, apkFileName)
            }
            
            val downloadId = downloadManager.enqueue(request)
            Log.d("APKUpdateModule", "Download ID: $downloadId")
            Log.d("APKUpdateModule", "APK indirilecek yer: /storage/emulated/0/Downloads/$apkFileName")
            
            downloadReceiver = object : BroadcastReceiver() {
                override fun onReceive(ctx: Context?, intent: Intent?) {
                    Log.d("APKUpdateModule", "BroadcastReceiver tetiklendi")
                    val id = intent?.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)
                    Log.d("APKUpdateModule", "Alınan download ID: $id, beklenen: $downloadId")
                    
                    if (id == downloadId) {
                        Log.d("APKUpdateModule", "Download ID eşleşti, checkDownloadStatusAndInstall çağrılıyor")
                        cleanupReceiver()
                        checkDownloadStatusAndInstall(downloadManager, downloadId)
                    } else {
                        Log.d("APKUpdateModule", "Download ID eşleşmedi")
                    }
                }
            }
            
            val filter = IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE)
            
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                    context.registerReceiver(downloadReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
                    Log.d("APKUpdateModule", "Receiver kaydedildi (Android 14+)")
                } else {
                    context.registerReceiver(downloadReceiver, filter)
                    Log.d("APKUpdateModule", "Receiver kaydedildi (Android <14)")
                }
            } catch (e: Exception) {
                Log.e("APKUpdateModule", "Receiver kaydetme hatası: ${e.message}")
                throw e
            }
            
            // Polling backup ekle
            startDownloadPolling(downloadManager, downloadId, 0)
            
            promise.resolve("İndirme başlatıldı - Downloads klasörüne")
            
        } catch (e: Exception) {
            Log.e("APKUpdateModule", "downloadAndInstallAPK hata: ${e.message}")
            cleanupReceiver()
            promise.reject("ERROR", e.message)
        }
    }

    private fun checkDownloadStatusAndInstall(dm: DownloadManager, downloadId: Long) {
        Log.d("APKUpdateModule", "checkDownloadStatusAndInstall başladı")
        try {
            val cursor = dm.query(DownloadManager.Query().setFilterById(downloadId))
            if (cursor != null && cursor.moveToFirst()) {
                val statusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS)
                val reasonIndex = cursor.getColumnIndex(DownloadManager.COLUMN_REASON)
                val localUriIndex = cursor.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI)
                
                if (statusIndex == -1) {
                    Log.e("APKUpdateModule", "STATUS column not found")
                    cursor.close()
                    sendEvent("APKDownloadComplete", "error: Unable to check download status")
                    return
                }
                
                val status = cursor.getInt(statusIndex)
                val reason = if (reasonIndex != -1) cursor.getInt(reasonIndex) else -1
                val localUri = if (localUriIndex != -1) cursor.getString(localUriIndex) else null
                
                Log.d("APKUpdateModule", "Download status: $status, reason: $reason, localUri: $localUri")
                cursor.close()

                when (status) {
                    DownloadManager.STATUS_SUCCESSFUL -> {
                        Log.d("APKUpdateModule", "APK başarıyla indirildi")
                        sendEvent("APKDownloadComplete", "success")
                        
                        // İndirilen dosyayı bul
                        val apkFile = getDownloadedFile(dm, downloadId, localUri)
                        if (apkFile != null && apkFile.exists() && apkFile.length() > 0) {
                            Log.d("APKUpdateModule", "APK dosyası bulundu ve doğrulandı: ${apkFile.absolutePath}")
                            Log.d("APKUpdateModule", "Dosya boyutu: ${apkFile.length()} bytes")
                            
                            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                                installAPK(apkFile)
                            }, 500)
                        } else {
                            Log.e("APKUpdateModule", "İndirilen APK dosyası bulunamadı veya boş")
                            sendEvent("APKDownloadComplete", "error: Downloaded file is empty or missing")
                        }
                    }
                    DownloadManager.STATUS_FAILED -> {
                        Log.e("APKUpdateModule", "APK indirilemedi, reason: $reason")
                        sendEvent("APKDownloadComplete", "failed: Download failed (reason: $reason)")
                    }
                    DownloadManager.STATUS_PENDING -> {
                        Log.d("APKUpdateModule", "APK indirme bekleniyor...")
                        sendEvent("APKDownloadComplete", "pending")
                    }
                    DownloadManager.STATUS_RUNNING -> {
                        Log.d("APKUpdateModule", "APK hala indiriliyor...")
                        sendEvent("APKDownloadComplete", "running")
                    }
                    DownloadManager.STATUS_PAUSED -> {
                        Log.d("APKUpdateModule", "APK indirme duraklatıldı...")
                        sendEvent("APKDownloadComplete", "paused")
                    }
                    else -> {
                        Log.e("APKUpdateModule", "Bilinmeyen indirme durumu: $status")
                        sendEvent("APKDownloadComplete", "failed: Unknown status ($status)")
                    }
                }
            } else {
                Log.e("APKUpdateModule", "Download cursor is null or empty")
                sendEvent("APKDownloadComplete", "failed: No download info")
            }
        } catch (e: Exception) {
            Log.e("APKUpdateModule", "checkDownloadStatusAndInstall hata: ${e.message}")
            sendEvent("APKDownloadComplete", "error: ${e.message}")
        }
    }

    private fun getDownloadedFile(dm: DownloadManager, downloadId: Long, localUri: String?): File? {
        return try {
            Log.d("APKUpdateModule", "getDownloadedFile çağrıldı, localUri: $localUri")
            
            if (localUri != null) {
                when {
                    localUri.startsWith("file://") -> {
                        val filePath = Uri.parse(localUri).path
                        if (filePath != null) {
                            Log.d("APKUpdateModule", "File URI'den alınan yol: $filePath")
                            File(filePath)
                        } else {
                            findAPKInDownloads()
                        }
                    }
                    localUri.startsWith("content://") -> {
                        Log.d("APKUpdateModule", "Content URI tespit edildi, gerçek yolu bulunuyor...")
                        getFileFromContentUri(localUri) ?: findAPKInDownloads()
                    }
                    else -> {
                        Log.d("APKUpdateModule", "Bilinmeyen URI formatı, Downloads klasöründe aranıyor...")
                        findAPKInDownloads()
                    }
                }
            } else {
                Log.d("APKUpdateModule", "localUri null, Downloads klasöründe aranıyor...")
                findAPKInDownloads()
            }
        } catch (e: Exception) {
            Log.e("APKUpdateModule", "getDownloadedFile error: ${e.message}")
            findAPKInDownloads()
        }
    }

    private fun getFileFromContentUri(contentUri: String): File? {
        return try {
            val context = reactApplicationContext
            val uri = Uri.parse(contentUri)
            
            Log.d("APKUpdateModule", "Content URI çözümleniyor: $contentUri")
            
            val cursor = context.contentResolver.query(uri, null, null, null, null)
            if (cursor != null && cursor.moveToFirst()) {
                val dataIndex = cursor.getColumnIndex("_data")
                if (dataIndex != -1) {
                    val filePath = cursor.getString(dataIndex)
                    cursor.close()
                    if (filePath != null) {
                        Log.d("APKUpdateModule", "Content URI'den alınan gerçek yol: $filePath")
                        return File(filePath)
                    }
                }
                cursor.close()
            }
            
            Log.d("APKUpdateModule", "Content URI çözümlenemedi, Downloads klasöründe aranıyor...")
            findAPKInDownloads()
            
        } catch (e: Exception) {
            Log.e("APKUpdateModule", "getFileFromContentUri error: ${e.message}")
            findAPKInDownloads()
        }
    }

    private fun findAPKInDownloads(): File? {
        return try {
            val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            val apkFile = File(downloadsDir, "AstorTest2-update.apk")
            
            Log.d("APKUpdateModule", "Downloads klasöründe aranan dosya: ${apkFile.absolutePath}")
            Log.d("APKUpdateModule", "Dosya var mı: ${apkFile.exists()}")
            
            if (apkFile.exists()) {
                Log.d("APKUpdateModule", "APK dosyası Downloads klasöründe bulundu: ${apkFile.length()} bytes")
                apkFile
            } else {
                Log.e("APKUpdateModule", "APK dosyası Downloads klasöründe bulunamadı")
                
                // Downloads klasöründeki tüm APK dosyalarını listele
                val apkFiles = downloadsDir.listFiles { _, name -> name.endsWith(".apk") }
                if (apkFiles != null && apkFiles.isNotEmpty()) {
                    Log.d("APKUpdateModule", "Downloads klasöründeki APK dosyaları:")
                    apkFiles.forEach { file ->
                        Log.d("APKUpdateModule", "  - ${file.name} (${file.length()} bytes)")
                    }
                }
                
                null
            }
        } catch (e: Exception) {
            Log.e("APKUpdateModule", "findAPKInDownloads error: ${e.message}")
            null
        }
    }

    private fun startDownloadPolling(dm: DownloadManager, downloadId: Long, attempt: Int) {
        if (attempt > 60) {
            Log.e("APKUpdateModule", "Download timeout after 5 minutes")
            sendEvent("APKDownloadComplete", "error: Download timeout")
            return
        }
        
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            try {
                val cursor = dm.query(DownloadManager.Query().setFilterById(downloadId))
                if (cursor != null && cursor.moveToFirst()) {
                    val statusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS)
                    if (statusIndex != -1) {
                        val status = cursor.getInt(statusIndex)
                        Log.d("APKUpdateModule", "Polling - Download status: $status, attempt: $attempt")
                        
                        when (status) {
                            DownloadManager.STATUS_SUCCESSFUL -> {
                                cursor.close()
                                Log.d("APKUpdateModule", "Polling başarılı - checkDownloadStatusAndInstall çağrılıyor")
                                checkDownloadStatusAndInstall(dm, downloadId)
                                return@postDelayed
                            }
                            DownloadManager.STATUS_FAILED -> {
                                cursor.close()
                                Log.e("APKUpdateModule", "Polling - Download failed")
                                sendEvent("APKDownloadComplete", "failed: Download failed")
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
                Log.e("APKUpdateModule", "Polling error: ${e.message}")
                startDownloadPolling(dm, downloadId, attempt + 1)
            }
        }, 5000)
    }

    private fun installAPK(apkFile: File) {
        Log.d("APKUpdateModule", "installAPK çağrıldı: ${apkFile.absolutePath}")
        try {
            if (!apkFile.exists()) {
                Log.e("APKUpdateModule", "APK file not found: ${apkFile.absolutePath}")
                sendEvent("APKInstallResult", "error: APK file not found")
                return
            }

            val fileSize = apkFile.length()
            Log.d("APKUpdateModule", "APK file size: $fileSize bytes")
            if (fileSize < 1000) {
                Log.e("APKUpdateModule", "APK file too small: $fileSize bytes")
                sendEvent("APKInstallResult", "error: Downloaded file is too small or corrupted")
                return
            }

            val context = reactApplicationContext

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!context.packageManager.canRequestPackageInstalls()) {
                    Log.e("APKUpdateModule", "Install permission not granted")
                    sendEvent("APKInstallResult", "error: Install permission required")
                    requestInstallPermission()
                    return
                }
            }

            val intent = Intent(Intent.ACTION_VIEW).apply {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    try {
                        val apkUri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", apkFile)
                        Log.d("APKUpdateModule", "FileProvider URI: $apkUri")
                        
                        setDataAndType(apkUri, "application/vnd.android.package-archive")
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
                    } catch (e: Exception) {
                        Log.e("APKUpdateModule", "FileProvider error: ${e.message}")
                        sendEvent("APKInstallResult", "error: FileProvider configuration error: ${e.message}")
                        return
                    }
                } else {
                    val fileUri = Uri.fromFile(apkFile)
                    Log.d("APKUpdateModule", "File URI (old Android): $fileUri")
                    setDataAndType(fileUri, "application/vnd.android.package-archive")
                }
                
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
            }

            val resolveInfo = context.packageManager.resolveActivity(intent, 0)
            if (resolveInfo != null) {
                Log.d("APKUpdateModule", "Starting install activity...")
                context.startActivity(intent)
                sendEvent("APKInstallResult", "install_started")
            } else {
                Log.e("APKUpdateModule", "No activity found to handle install intent")
                sendEvent("APKInstallResult", "error: No app can handle APK installation")
            }

        } catch (e: Exception) {
            Log.e("APKUpdateModule", "installAPK error: ${e.message}")
            e.printStackTrace()
            sendEvent("APKInstallResult", "error: ${e.message}")
        }
    }

    @ReactMethod
    fun checkInstallPermission(promise: Promise) {
        try {
            val canInstall = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) reactApplicationContext.packageManager.canRequestPackageInstalls() else true
            promise.resolve(canInstall)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
fun requestInstallPermission() {
    val activity = currentReactActivity
    if (activity != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val intent = Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
            data = Uri.parse("package:${reactApplicationContext.packageName}")
        }
        activity.startActivity(intent)
    } else {
        Log.e("APKUpdateModule", "Current activity is null, cannot request install permission")
    }
}

    private fun sendEvent(name: String, data: String) {
        try {
            reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(name, data)
        } catch (_: Exception) {}
    }

    private fun cleanupReceiver() {
        downloadReceiver?.let {
            try { reactApplicationContext.unregisterReceiver(it) } catch (_: Exception) {}
            downloadReceiver = null
        }
    }

        private fun deleteOldAPKFiles() {
        try {
            Log.d("APKUpdateModule", "Eski APK dosyaları temizleniyor...")
            
            val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            if (!downloadsDir.exists()) {
                Log.d("APKUpdateModule", "Downloads klasörü bulunamadı")
                return
            }
            
            // Belirli dosya ismini sil
            val targetFile = File(downloadsDir, "AstorTest2-update.apk")
            if (targetFile.exists()) {
                val deleted = targetFile.delete()
                Log.d("APKUpdateModule", "Eski AstorTest2-update.apk dosyası silindi: $deleted")
            }
            
            // Uygulamanızla ilgili tüm APK dosyalarını sil (isteğe bağlı)
            val apkFiles = downloadsDir.listFiles { _, name -> 
                name.contains("AstorTest2") && name.endsWith(".apk")
            }
            
            if (apkFiles != null && apkFiles.isNotEmpty()) {
                Log.d("APKUpdateModule", "Bulunan eski APK dosyaları: ${apkFiles.size}")
                apkFiles.forEach { file ->
                    try {
                        val deleted = file.delete()
                        Log.d("APKUpdateModule", "  - ${file.name} silindi: $deleted")
                    } catch (e: Exception) {
                        Log.e("APKUpdateModule", "  - ${file.name} silinirken hata: ${e.message}")
                    }
                }
            } else {
                Log.d("APKUpdateModule", "Silinecek eski APK dosyası bulunamadı")
            }
            
        } catch (e: Exception) {
            Log.e("APKUpdateModule", "deleteOldAPKFiles hata: ${e.message}")
        }
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        cleanupReceiver()
    }
}