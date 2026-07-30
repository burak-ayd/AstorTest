# Expo APK Update Module

GitHub releases üzerinden APK güncellemelerini otomatik olarak kontrol eden ve yükleyen Expo module.

## Özellikler

- ✅ GitHub Releases API ile otomatik güncelleme kontrolü
- ✅ Sürüm karşılaştırması (semantic versioning)
- ✅ APK indirme ve kurulum
- ✅ İzin yönetimi (Android 8.0+)
- ✅ Event-driven mimari
- ✅ TypeScript desteği
- ✅ Progress tracking

## Kurulum

Module zaten projeye dahil. Kullanıma hazır.

## Kullanım

### Temel Kullanım

```typescript
import APKUpdateManager from './modules/expo-apk-update/src/APKUpdateManager';

const updateManager = new APKUpdateManager({
  onStatusChange: (status) => console.log('Status:', status),
  onUpdateAvailable: (version, size, notes) => {
    console.log(`Yeni sürüm: ${version} (${size}MB)`);
  },
  onUpdateComplete: () => console.log('Güncelleme tamamlandı'),
  onError: (error) => console.error('Hata:', error),
  onNoUpdate: () => console.log('Güncelleme yok'),
});

// Güncelleme kontrolü
await updateManager.checkForUpdates();

// Cleanup (component unmount)
updateManager.cleanup();
```

### React Hook ile Kullanım

```typescript
import { useEffect, useRef, useState } from 'react';
import APKUpdateManager from './modules/expo-apk-update/src/APKUpdateManager';

function App() {
  const [status, setStatus] = useState('Kontrol ediliyor...');
  const updateManagerRef = useRef(null);

  useEffect(() => {
    const manager = new APKUpdateManager({
      onStatusChange: setStatus,
      onUpdateComplete: () => {
        // Uygulamaya devam et
      },
    });

    updateManagerRef.current = manager;
    manager.checkForUpdates();

    return () => {
      manager.cleanup();
    };
  }, []);

  return <Text>{status}</Text>;
}
```

## API

### APKUpdateManager

#### Constructor

```typescript
new APKUpdateManager(callbacks?: UpdateCallbacks)
```

#### Callbacks

```typescript
type UpdateCallbacks = {
  onStatusChange?: (status: string) => void;
  onUpdateAvailable?: (version: string, size: number, notes: string) => void;
  onUpdateStarted?: () => void;
  onUpdateComplete?: () => void;
  onError?: (error: string) => void;
  onNoUpdate?: () => void;
};
```

#### Methods

- `checkForUpdates(): Promise<boolean>` - GitHub'dan güncelleme kontrolü yapar
- `cleanup(): void` - Event listener'ları temizler

### ExpoApkUpdateModule (Native)

Direkt native module kullanımı (genellikle gerekli değil):

```typescript
import ExpoApkUpdateModule from './modules/expo-apk-update/src/ExpoApkUpdateModule';

// Mevcut sürümü al
const version = await ExpoApkUpdateModule.getCurrentVersion();
// { versionName: "1.0.0", versionCode: 1 }

// İzin kontrolü
const hasPermission = await ExpoApkUpdateModule.checkInstallPermission();

// İzin iste
ExpoApkUpdateModule.requestInstallPermission();

// APK indir ve yükle
await ExpoApkUpdateModule.downloadAndInstallAPK(downloadUrl);
```

## Events

Module iki event gönderir:

### APKDownloadComplete

İndirme tamamlandığında:
```typescript
{
  status: "success" | "failed: reason" | "error: message"
}
```

### APKInstallResult

Kurulum başlatıldığında:
```typescript
{
  status: "install_started" | "error: message"
}
```

## GitHub Release Formatı

Release'iniz şu formatta olmalı:

```yaml
Tag: v1.0.1
Assets:
  - app-release.apk (veya *-release.apk)
Body: |
  ## Yeni Özellikler
  - Özellik 1
  - Özellik 2
  
  ## Düzeltmeler
  - Hata düzeltme 1
```

## Notlar

- ⚠️ Sadece Android'de çalışır
- ⚠️ Android 8.0+ için "Bilinmeyen kaynaklardan yükleme" izni gerekir
- ⚠️ FileProvider yapılandırması gerekir (AndroidManifest.xml)
- ⚠️ GitHub API rate limit: 60 req/hour (authenticated olmadan)

## Sorun Giderme

### "FileProvider configuration error"

`android/app/src/main/AndroidManifest.xml` içinde FileProvider eklenmiş olmalı:

```xml
<provider
    android:name="androidx.core.content.FileProvider"
    android:authorities="${applicationId}.fileprovider"
    android:exported="false"
    android:grantUriPermissions="true">
    <meta-data
        android:name="android.support.FILE_PROVIDER_PATHS"
        android:resource="@xml/file_paths" />
</provider>
```

### "Install permission required"

Uygulama otomatik olarak izin ekranını açar. Kullanıcı izin vermezse güncelleme yapılamaz.

## Lisans

MIT
