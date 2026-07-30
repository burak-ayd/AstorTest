import { NativeModule, requireNativeModule } from 'expo';
import { EventSubscription } from 'expo-modules-core';

// Kotlin tarafından gönderilen (event.status) verisinin tipi
export type UpdateEventPayload = {
  status: string;
};

// İndirme progress event'i
export type DownloadProgressPayload = {
  progress: number;
  bytesDownloaded: number;
  bytesTotal: number;
};

// Kotlin'de yazdığımız fonksiyonların TypeScript tanımlamaları
declare class ExpoApkUpdateModule extends NativeModule {
  getCurrentVersion(): Promise<{ versionName: string; versionCode: number }>;
  downloadAndInstallAPK(downloadUrl: string): Promise<string>;
  checkInstallPermission(): Promise<boolean>;
  requestInstallPermission(): void;
  
  // Expo'nun yeni mimarisinde event dinleyiciler doğrudan modül üzerinden çağrılır
  addListener(
    eventName: 'APKDownloadComplete' | 'APKInstallResult', 
    listener: (event: UpdateEventPayload) => void
  ): EventSubscription;
  
  addListener(
    eventName: 'APKDownloadProgress', 
    listener: (event: DownloadProgressPayload) => void
  ): EventSubscription;
}

export default requireNativeModule<ExpoApkUpdateModule>('ExpoApkUpdate');