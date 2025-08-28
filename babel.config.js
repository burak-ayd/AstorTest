module.exports = function (api) {
	api.cache(true);
	return {
		presets: [
			["babel-preset-expo", { jsxImportSource: "nativewind" }],
			"nativewind/babel",
		],
		// plugins: [
		// 	[
		// 		"module-resolver",
		// 		{
		// 			root: ["./"],
		// 			alias: {
		// 				"@": "./", // @ = proje kökü
		// 				"@components": "./components", // örnek
		// 				"@screens": "./screens",
		// 				"@assets": "./assets",
		// 			},
		// 		},
		// 	],
		// ],
	};
};
