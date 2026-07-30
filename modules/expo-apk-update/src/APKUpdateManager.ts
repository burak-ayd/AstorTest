import { Alert, Platform } from 'react-native';
import ExpoApkUpdateModule from './ExpoApkUpdateModule';
import type { GitHubRelease, UpdateEventPayload, DownloadProgressPayload } from './ExpoApkUpdate.types';

const GITHUB_API_URL = 'https://api.github.com/repos/burak-ayd/AstorTest/releases/latest';

export type UpdateCallbacks = {
  onStatusChange?: (status: string) => void;
  onProgressChange?: (progress: number) => void;
  onUpdateAvailable?: (version: string, size: number, notes: string) => void;
  onUpdateStarted?: () => void;
  onUpdateComplete?: () => void;
  onError?: (error: string) => void;
  onNoUpdate?: () => void;
};

function formatReleaseNotes(body: string): string {
  if (typeof body !== 'string' || body.trim().length === 0) {
    return 'Bilgi yok.';
  }
  
  let text = body.replace(/\r\n/g, '\n');
  text = text.replace(/#+\s*/g, '');
  text = text.replace(/\*\*/g, '');
  text = text.replace(/^\s*[-*]\s+/gm, '• ');
  text = text.replace(/[\t ]+/g, ' ');
  
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
    
  return lines.slice(0, 12).join('\n');
}

function compareVersions(v1: string, v2: string): number {
  const v1parts = v1.replace(/^v/, '').split('.').map(Number);
  const v2parts = v2.replace(/^v/, '').split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (v1parts[i] > v2parts[i]) return 1; // v1 daha yeni
    if (v1parts[i] < v2parts[i]) return -1; // v1 daha eski
  }
  return 0; // eşit
}

export class APKUpdateManager {
  private downloadCompleteListener: any = null;
  private downloadProgressListener: any = null;
  private installResultListener: any = null;
  private callbacks: UpdateCallbacks = {};

  constructor(callbacks?: UpdateCallbacks) {
    this.callbacks = callbacks || {};
  }

  private setupEventListeners() {
    console.log('[APKUpdateManager] Setting up event listeners...');
    
    // APK indirme progress listener
    this.downloadProgressListener = ExpoApkUpdateModule.addListener(
      'APKDownloadProgress',
      (event: DownloadProgressPayload) => {
        console.log('[APKUpdateManager] İndirme progress:', event.progress + '%');
        
        // Progress callback'i çağır
        if (event.progress >= 0 && event.progress <= 100) {
          this.callbacks.onProgressChange?.(event.progress);
        }
        
        // Bytes bilgisini de callback ile gönderebiliriz (opsiyonel)
        if (event.bytesTotal > 0) {
          const downloaded = (event.bytesDownloaded / (1024 * 1024)).toFixed(2);
          const total = (event.bytesTotal / (1024 * 1024)).toFixed(2);
          this.callbacks.onStatusChange?.(`İndiriliyor: ${downloaded}MB / ${total}MB`);
        }
      }
    );
    
    // APK indirme event listener
    this.downloadCompleteListener = ExpoApkUpdateModule.addListener(
      'APKDownloadComplete',
      (event: UpdateEventPayload) => {
        console.log('[APKUpdateManager] APK indirme event alındı:', event);
        const status = event.status;

        if (status === 'success') {
          console.log('[APKUpdateManager] İndirme başarılı, yükleme başlıyor...');
          this.callbacks.onStatusChange?.('APK yükleniyor...');
          // Progress zaten 100'de olmalı (downloadProgressListener'dan)
        } else if (status.startsWith('failed:') || status.startsWith('error:')) {
          const errorMsg = status.replace(/^(failed:|error:)\s*/, '');
          console.error('[APKUpdateManager] İndirme hatası:', errorMsg);
          this.callbacks.onStatusChange?.(`İndirme hatası: ${errorMsg}`);
          this.callbacks.onError?.(errorMsg);
          
          Alert.alert('İndirme Hatası', errorMsg, [
            { 
              text: 'Tamam', 
              onPress: () => this.callbacks.onUpdateComplete?.() 
            },
          ]);
        }
      }
    );

    // APK yükleme event listener
    this.installResultListener = ExpoApkUpdateModule.addListener(
      'APKInstallResult',
      (event: UpdateEventPayload) => {
        console.log('[APKUpdateManager] APK yükleme event alındı:', event);
        const status = event.status;

        if (status === 'install_started') {
          console.log('[APKUpdateManager] Yükleyici açılıyor...');
          this.callbacks.onStatusChange?.('APK yükleyici açılıyor...');
          this.callbacks.onProgressChange?.(95);
          // APK yükleyici açıldığında işlem tamamlandı sayılır
          setTimeout(() => {
            this.callbacks.onProgressChange?.(100);
            this.callbacks.onUpdateComplete?.();
          }, 2000);
        } else if (status.startsWith('error:')) {
          const errorMsg = status.replace(/^error:\s*/, '');
          console.error('[APKUpdateManager] Yükleme hatası:', errorMsg);
          this.callbacks.onStatusChange?.(`Yükleme hatası: ${errorMsg}`);
          this.callbacks.onError?.(errorMsg);
          
          Alert.alert('Yükleme Hatası', errorMsg, [
            { 
              text: 'Tamam', 
              onPress: () => this.callbacks.onUpdateComplete?.() 
            },
          ]);
        }
      }
    );
    
    console.log('[APKUpdateManager] Event listeners kuruldu');
  }

  private cleanupEventListeners() {
    console.log('[APKUpdateManager] Cleaning up event listeners...');
    if (this.downloadProgressListener) {
      this.downloadProgressListener.remove();
      this.downloadProgressListener = null;
    }
    if (this.downloadCompleteListener) {
      this.downloadCompleteListener.remove();
      this.downloadCompleteListener = null;
    }
    if (this.installResultListener) {
      this.installResultListener.remove();
      this.installResultListener = null;
    }
    console.log('[APKUpdateManager] Event listeners cleaned up');
  }

  async checkForUpdates(): Promise<boolean> {
    // Android dışında çalışma
    if (Platform.OS !== 'android') {
      console.log('APK update sadece Android için geçerli');
      this.callbacks.onNoUpdate?.();
      return false;
    }

    // Module kontrolü
    if (!ExpoApkUpdateModule || typeof ExpoApkUpdateModule.getCurrentVersion !== 'function') {
      console.log('ExpoApkUpdateModule kullanılamıyor');
      this.callbacks.onNoUpdate?.();
      return false;
    }

    try {
      this.callbacks.onStatusChange?.('GitHub releases kontrol ediliyor...');
      this.callbacks.onProgressChange?.(10);

      // GitHub API çağrısı
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const releaseResponse = await fetch(GITHUB_API_URL, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'AstorTest2-App',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (releaseResponse.status !== 200) {
        console.log('GitHub API erişilemedi:', releaseResponse.status);
        this.callbacks.onNoUpdate?.();
        return false;
      }

      const releaseData: GitHubRelease = await releaseResponse.json();
      const latestVersion = releaseData.tag_name;
      
      this.callbacks.onProgressChange?.(15);

      // Mevcut sürümü al
      const currentVersionInfo = await ExpoApkUpdateModule.getCurrentVersion();
      const currentVersion = 'v' + currentVersionInfo.versionName;

      console.log('Mevcut sürüm:', currentVersion);
      console.log('En son sürüm:', latestVersion);
      
      this.callbacks.onProgressChange?.(20);

      // Sürüm karşılaştırması
      if (compareVersions(latestVersion, currentVersion) <= 0) {
        console.log('APK güncel');
        this.callbacks.onNoUpdate?.();
        return false;
      }

      // APK dosyasını release'de ara
      const apkAsset = releaseData.assets.find(
        (asset) => asset.name.includes('.apk') && asset.name.includes('release')
      );

      if (!apkAsset) {
        console.log('APK asset bulunamadı');
        this.callbacks.onNoUpdate?.();
        return false;
      }

      this.callbacks.onStatusChange?.('Yeni sürüm bulundu!');
      this.callbacks.onProgressChange?.(25);

      // İzin kontrolü
      const hasPermission = await ExpoApkUpdateModule.checkInstallPermission();

      if (!hasPermission) {
        Alert.alert(
          'İzin Gerekli',
          'APK güncellemesi için bilinmeyen kaynaklardan yükleme izni gerekiyor.',
          [
            {
              text: 'İzin Ver',
              onPress: () => {
                ExpoApkUpdateModule.requestInstallPermission();
                // İzin verildikten sonra kullanıcı geri dönerse devam et
                setTimeout(() => this.callbacks.onUpdateComplete?.(), 3000);
              },
            },
            {
              text: 'İptal',
              style: 'cancel',
              onPress: () => this.callbacks.onUpdateComplete?.(),
            },
          ]
        );
        return false;
      }

      // Kullanıcıya güncelleme sorgusu
      return new Promise((resolve) => {
        const formattedNotes = formatReleaseNotes(releaseData.body);
        const sizeInMB = Math.round(apkAsset.size / (1024 * 1024));

        this.callbacks.onUpdateAvailable?.(latestVersion, sizeInMB, formattedNotes);

        Alert.alert(
          'Yeni Sürüm Mevcut!',
          `Yeni Özellikler:\n${formattedNotes}\n\nSürüm ${latestVersion} indirilsin mi?\n\nBoyut: ${sizeInMB}MB`,
          [
            {
              text: 'İndir ve Yükle',
              onPress: async () => {
                console.log('[APKUpdateManager] Kullanıcı indirmeyi onayladı');
                this.callbacks.onUpdateStarted?.();
                this.setupEventListeners();
                
                this.callbacks.onStatusChange?.('APK indiriliyor...');
                
                try {
                  console.log('[APKUpdateManager] downloadAndInstallAPK çağrılıyor:', apkAsset.browser_download_url);
                  const result = await ExpoApkUpdateModule.downloadAndInstallAPK(
                    apkAsset.browser_download_url
                  );
                  console.log('[APKUpdateManager] Download başlatıldı, sonuç:', result);
                  resolve(true);
                } catch (e: any) {
                  console.error('[APKUpdateManager] APK indirme hatası:', e);
                  this.cleanupEventListeners();
                  
                  Alert.alert('Hata', 'APK indirme hatası: ' + e.message, [
                    {
                      text: 'Tamam',
                      onPress: () => this.callbacks.onUpdateComplete?.(),
                    },
                  ]);
                  resolve(false);
                }
              },
            },
            {
              text: 'Şimdi Değil',
              style: 'cancel',
              onPress: () => {
                this.callbacks.onUpdateComplete?.();
                resolve(false);
              },
            },
          ]
        );
      });
    } catch (error: any) {
      console.log('APK update kontrol hatası:', error);
      
      if (error.name === 'AbortError') {
        console.log('GitHub API timeout');
      }
      
      this.callbacks.onError?.(error.message || 'Bilinmeyen hata');
      this.callbacks.onNoUpdate?.();
      return false;
    }
  }

  cleanup() {
    this.cleanupEventListeners();
  }
}

export default APKUpdateManager;
