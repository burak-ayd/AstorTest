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
					root: ["./"], // proje kökü
					alias: {
						"@components": "./components", // components klasörü kök dizinde
						"@scripts": "./scripts",
						"@assets": "./assets",
						"@app": "./app",
					},
					extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
				},
			],
		],
	};
};
