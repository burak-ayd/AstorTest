// Re-export the module
export { default as ExpoApkUpdateModule } from './ExpoApkUpdateModule';

// Re-export the manager
export { default as APKUpdateManager } from './APKUpdateManager';
export type { UpdateCallbacks } from './APKUpdateManager';

// Re-export types
export type { 
  UpdateEventPayload, 
  VersionInfo, 
  ReleaseAsset, 
  GitHubRelease 
} from './ExpoApkUpdate.types';
