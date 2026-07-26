import { registerWebModule, NativeModule } from 'expo';

// ExpoApkUpdateModule is not available on the web platform.
class ExpoApkUpdateModule extends NativeModule<{}> {}

export default registerWebModule(ExpoApkUpdateModule, 'ExpoApkUpdateModule');
