const { withAppBuildGradle } = require("@expo/config-plugins");

module.exports = function withCustomApkName(config) {
	const slug = config.slug || "app";
	const version = config.version || "1.0.0";

	return withAppBuildGradle(config, (config) => {
		if (config.modResults.language === "groovy") {
			const renamingScript = `
// --- Expo Custom APK Naming Plugin Başlangıcı ---
android.applicationVariants.all { variant ->
    variant.outputs.all { output ->
        def appSlug = "${slug}"
        def appVersion = "${version}"
        def buildTypeName = variant.buildType.name 
        
        // Doğru sabit ismi (OutputFile.ABI) kullanıldı
        def abiName = output.getFilter(com.android.build.OutputFile.ABI)
        if (abiName == null) {
            abiName = "universal"
        }

        output.outputFileName = "\${appSlug}-\${appVersion}-\${buildTypeName}-\${abiName}.apk"
    }
}
// --- Expo Custom APK Naming Plugin Sonu ---
`;

			// Eğer daha önce eklenmemişse betiği ekle
			if (
				!config.modResults.contents.includes(
					"Expo Custom APK Naming Plugin",
				)
			) {
				config.modResults.contents += `\n${renamingScript}`;
			}
		}
		return config;
	});
};
