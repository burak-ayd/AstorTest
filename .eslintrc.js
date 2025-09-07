module.exports = {
	extends: [
		"plugin:import/errors",
		"plugin:import/warnings",
		"eslint:recommended",
	],
	plugins: ["import"],
	settings: {
		"import/resolver": {
			caseSensitive: false,
			node: {
				paths: ["app", "./components", "./assets", "./scripts"],
				extensions: [".js", ".ts", ".d.ts", ".tsx", ".jsx"],
			},
			alias: {
				map: [
					["@", "./"],
					["@components", "./components"],
					["@scripts", "./scripts"],
					["@assets", "./assets"],
				],
				extensions: [".js", ".jsx", ".ts", ".tsx"],
			},
		},
	},
};
