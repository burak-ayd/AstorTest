module.exports = function (api) {
	api.cache(true);

	return {
		presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
		plugins: [
			[
				"module-resolver",
				{
					root: ["./"],
					alias: {
						"@components": "./components",
						"@scripts": "./scripts",
						"@assets": "./assets",
						"@app": "./app",
					},
				},
			],
			"react-native-worklets/plugin",
		],
	};
};
