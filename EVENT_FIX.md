# APK Update Event Listener Fix

## 🐛 Sorun
APK indirme tamamlandıktan sonra yükleme aşamasına geçmiyordu. Event listener'lar düzgün çalışmıyordu.

## 🔍 Kök Sebep
- **DeviceEventEmitter** kullanılıyordu (React Native native module yapısı)
- Oysa Expo modülleri kendi event sistemini kullanır: **ExpoApkUpdateModule.addListener()**
- Kotlin tarafı doğru event gönderiyor ama JS tarafı yanlış yerde dinliyordu

## ✅ Düzeltmeler

### 1. TypeScript Tarafı (APKUpdateManager.ts)

**Değişiklik:**
```typescript
// ❌ ÖNCE (Yanlış)
import { DeviceEventEmitter } from 'react-native';
this.downloadCompleteListener = DeviceEventEmitter.addListener(...)

// ✅ SONRA (Doğru)
import ExpoApkUpdateModule from './ExpoApkUpdateModule';
this.downloadCompleteListener = ExpoApkUpdateModule.addListener(...)
```

**Eklenen Log'lar:**
```typescript
console.log('[APKUpdateManager] Setting up event listeners...');
console.log('[APKUpdateManager] APK indirme event alındı:', event);
console.log('[APKUpdateManager] İndirme başarılı, yükleme başlıyor...');
console.log('[APKUpdateManager] Event listeners kuruldu');
```

### 2. Kotlin Tarafı (ExpoApkUpdateModule.kt)

**Eklenen Detaylı Log'lar:**

```kotlin
// emitEvent fonksiyonunda
Log.d("APKUpdateModule", "Event gönderiliyor: $eventName = $data")
Log.d("APKUpdateModule", "Event gönderildi: $eventName")

// checkDownloadStatusAndInstall fonksiyonunda
Log.d("APKUpdateModule", "checkDownloadStatusAndInstall başladı, downloadId: $downloadId")
Log.d("APKUpdateModule", "Download status: $status, reason: $reason, localUri: $localUri")
Log.d("APKUpdateModule", "İndirme başarılı! Event gönderiliyor...")
Log.d("APKUpdateModule", "APKDownloadComplete event gönderildi")
Log.d("APKUpdateModule", "APK dosyası bulundu: ${apkFile.absolutePath}, boyut: ${apkFile.length()}")
Log.d("APKUpdateModule", "installAPK çağrılıyor...")

// installAPK fonksiyonunda
Log.d("APKUpdateModule", "installAPK başladı, dosya: ${apkFile.absolutePath}")
Log.d("APKUpdateModule", "Intent oluşturuluyor...")
Log.d("APKUpdateModule", "FileProvider ile URI oluşturuluyor...")
Log.d("APKUpdateModule", "APK URI: $apkUri")
Log.d("APKUpdateModule", "Yükleyici başlatılıyor...")
Log.d("APKUpdateModule", "Yükleyici başlatıldı! Event gönderiliyor...")
Log.d("APKUpdateModule", "APKInstallResult event gönderildi")
```

## 📊 Event Akışı

```
1. Kullanıcı "İndir ve Yükle" tuşuna basar
   └─> [APKUpdateManager] Kullanıcı indirmeyi onayladı
   └─> [APKUpdateManager] downloadAndInstallAPK çağrılıyor
   └─> [APKUpdateManager] Setting up event listeners...
   └─> [APKUpdateManager] Event listeners kuruldu

2. Kotlin: İndirme başlar
   └─> [APKUpdateModule] downloadAndInstallAPK başladı
   └─> [APKUpdateModule] İndirme kuyruğa alındı

3. Kotlin: İndirme tamamlanır
   └─> [APKUpdateModule] checkDownloadStatusAndInstall başladı
   └─> [APKUpdateModule] Download status: 8 (SUCCESSFUL)
   └─> [APKUpdateModule] İndirme başarılı! Event gönderiliyor...
   └─> [APKUpdateModule] Event gönderiliyor: APKDownloadComplete = success
   └─> [APKUpdateModule] Event gönderildi: APKDownloadComplete

4. JS: Event alınır
   └─> [APKUpdateManager] APK indirme event alındı: {status: "success"}
   └─> [APKUpdateManager] İndirme başarılı, yükleme başlıyor...

5. Kotlin: Yükleme başlar
   └─> [APKUpdateModule] installAPK başladı
   └─> [APKUpdateModule] FileProvider ile URI oluşturuluyor...
   └─> [APKUpdateModule] Yükleyici başlatılıyor...
   └─> [APKUpdateModule] Event gönderiliyor: APKInstallResult = install_started
   └─> [APKUpdateModule] Event gönderildi: APKInstallResult

6. JS: Event alınır
   └─> [APKUpdateManager] APK yükleme event alındı: {status: "install_started"}
   └─> [APKUpdateManager] Yükleyici açılıyor...
   └─> Android Package Installer açılır ✅
```

## 🧪 Test Etmek İçin

```bash
cd D:\Projeler\ReactNative\AstorTest2
npx expo run:android
```

**Logcat filtreleme:**
```bash
adb logcat | grep -E "APKUpdateModule|APKUpdateManager"
```

## ✅ Beklenen Sonuç

1. "İndir ve Yükle" butonuna basılınca
2. "APK indiriliyor..." yazısı görünür
3. İndirme tamamlanınca "APK yükleniyor..." yazısı görünür
4. Hemen ardından "APK yükleyici açılıyor..." yazısı görünür
5. Android Package Installer açılır
6. Uygulama ana ekrana geçer

## 🔧 Değiştirilen Dosyalar

- ✅ `modules/expo-apk-update/src/APKUpdateManager.ts` - DeviceEventEmitter → ExpoApkUpdateModule.addListener
- ✅ `modules/expo-apk-update/android/.../ExpoApkUpdateModule.kt` - Detaylı log'lar eklendi

---

**Sonuç:** Event listener sorunu çözüldü. Expo module'ün kendi event sistemini kullanmak gerekiyordu. 🎉
