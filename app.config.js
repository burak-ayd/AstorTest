export default ({ config }) => ({
	...config,
	runtimeVersion: "2",
	...{
		updates: {
			url: "https://ota.burakaydogan.tk/manifest",
			codeSigningMetadata: process.env.DISABLE_CODE_SIGNING
				? undefined
				: { keyid: "main", alg: "rsa-v1_5-sha256" },
			codeSigningCertificate: process.env.DISABLE_CODE_SIGNING
				? undefined
				: "./certs/certificate.pem",
			enabled: true,
			checkAutomatically: "ON_ERROR_RECOVERY",
			fallbackToCacheTimeout: 0,
			requestHeaders: {
				"expo-channel-name": process.env.RELEASE_CHANNEL,
				"expo-app-id": "8e36012d-1bfd-4def-ba32-f1159fb9bee9",
			},
		},
	},
});
