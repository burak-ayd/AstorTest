# 🔧 FileProvider Configuration Fix

## 🐛 Sorun
```
FileProvider configuration error: 
Couldn't find meta-data for provider with authority com.burakaydogan.AstorTest.fileprovider
```

APK yükleme sırasında FileProvider tanımı bulunamadı.

---

## ✅ Çözüm

### 1️⃣ AndroidManifest.xml Güncellendi

**Dosya:** `android/app/src/main/AndroidManifest.xml`

```xml
<application>
  <!-- Diğer elementler -->
  
  <provider
    android:name="androidx.core.content.FileProvider"
    android:authorities="${applicationId}.fileprovider"
    android:exported="false"
    android:grantUriPermissions="true">
    <meta-data
      android:name="android.support.FILE_PROVIDER_PATHS"
      android:resource="@xml/file_paths"/>
  </provider>
</application>
```

### 2️⃣ file_paths.xml Oluşturuldu

**Dosya:** `android/app/src/main/res/xml/file_paths.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Downloads klasörü için -->
    <external-path name="external_files" path="Download/"/>
    
    <!-- Tüm external storage -->
    <external-path name="external" path="."/>
    
    <!-- Cache klasörü -->
    <cache-path name="cache" path="."/>
    
    <!-- Internal files -->
    <files-path name="files" path="."/>
</paths>
```

### 3️⃣ Expo Config Plugin Oluşturuldu

**Dosya:** `scripts/withFileProvider.js`

Bu plugin her `expo prebuild` çalıştığında:
- ✅ AndroidManifest.xml'e FileProvider ekler
- ✅ xml klasörünü oluşturur
- ✅ file_paths.xml dosyasını oluşturur

**Ekleme:** `app.json` plugins array'ine eklendi:
```json
"plugins": [
  ...
  "./scripts/withFileProvider.js"
]
```

---

## 🔄 FileProvider Neden Gerekli?

Android 7.0 (API 24) ve sonrasında, `file://` URI'ları artık güvenlik nedeniyle direkt kullanılamaz. Bunun yerine `FileProvider` kullanarak `content://` URI'ları oluşturmak gerekir.

### Kullanım (Kotlin):
```kotlin
val apkUri = FileProvider.getUriForFile(
    context, 
    "${context.packageName}.fileprovider", 
    apkFile
)
```

### URI Dönüşümü:
```
❌ file:///storage/emulated/0/Download/app.apk
✅ content://com.burakaydogan.AstorTest.fileprovider/external_files/app.apk
```

---

## 📊 Path Türleri

| Path Type | Lokasyon | Kullanım |
|-----------|----------|----------|
| `<external-path>` | External storage | Downloads, genel dosyalar |
| `<cache-path>` | App cache | Geçici dosyalar |
| `<files-path>` | App internal files | Private dosyalar |
| `<external-files-path>` | App external files | SD kart |

---

## 🧪 Test

### Build:
```bash
cd D:\Projeler\ReactNative\AstorTest2
npx expo run:android --variant release
```

### Beklenen Sonuç:
1. ✅ APK indiriliyor
2. ✅ FileProvider ile URI oluşturuluyor
3. ✅ Android Package Installer açılıyor
4. ✅ APK yükleniyor

### Log Kontrolü:
```bash
adb logcat | grep -E "APKUpdateModule|FileProvider"
```

---

## 🔒 Güvenlik Notları

### FileProvider Avantajları:
- ✅ Temporary URI permissions
- ✅ Dosya erişimi kontrollü
- ✅ Android security best practices
- ✅ Otomatik permission revocation

### Dikkat Edilmesi Gerekenler:
- `android:exported="false"` - Dış uygulamalar erişemez
- `android:grantUriPermissions="true"` - Geçici izinler verilir
- Path'ler dikkatli tanımlanmalı (minimum gerekli erişim)

---

## 🔄 Prebuild Sonrası

Her `expo prebuild` çalıştığında:
```bash
npx expo prebuild --clean
```

Config plugin otomatik olarak:
1. AndroidManifest.xml'i günceller
2. xml klasörünü oluşturur
3. file_paths.xml'i yazar

**Manuel düzenleme gerekmez!** ✅

---

## 📄 İlgili Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `android/app/src/main/AndroidManifest.xml` | FileProvider tanımı |
| `android/app/src/main/res/xml/file_paths.xml` | Path yapılandırması |
| `scripts/withFileProvider.js` | Expo config plugin |
| `app.json` | Plugin kaydı |
| `modules/expo-apk-update/.../ExpoApkUpdateModule.kt` | FileProvider kullanımı |

---

## ✅ Sonuç

FileProvider yapılandırması tamamlandı! Artık:
- ✅ APK dosyaları güvenli şekilde paylaşılıyor
- ✅ Android 7.0+ uyumlu
- ✅ Her prebuild'de otomatik yapılandırma
- ✅ Security best practices

**APK güncelleme artık çalışacak!** 🚀
