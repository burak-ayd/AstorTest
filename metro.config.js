const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
	"@components": path.resolve(__dirname, "components"),
	"@scripts": path.resolve(__dirname, "scripts"),
	"@assets": path.resolve(__dirname, "assets"),
	"@app": path.resolve(__dirname, "app"),
};

config.watchFolders = [
	path.resolve(__dirname), // proje kökünü izliyor
];

module.exports = withNativeWind(config, { input: "./global.css" });
