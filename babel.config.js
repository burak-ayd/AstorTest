module.exports = function (api) {
	api.cache(true);
	return {
		presets: [
			["babel-preset-expo", { jsxImportSource: "nativewind" }],
			"nativewind/babel",
		],
		plugins: [
			[
				"module-resolver",
				{
					root: ["./"],
					alias: {
						"@": "./", // @ artık proje kökünü gösteriyor
						"@components": "./components", // root/components
						"@scripts": "./scripts",
						"@assets": "./assets",
					},
					extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
				},
			],
		],
	};
};
