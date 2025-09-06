const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Font resolver ekleme
config.resolver.assetExts.push("ttf", "otf", "woff", "woff2");

module.exports = withNativeWind(config, { input: "./global.css" });
