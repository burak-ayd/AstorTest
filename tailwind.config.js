/** @type {import('tailwindcss').Config} */
module.exports = {
	// NOTE: Update this to include the paths to all files that contain Nativewind classes.
	content: [
		"./App.{js,jsx,ts,tsx}",
		"./index.{js,jsx,ts,tsx}",
		"./components/**/*.{js,jsx,ts,tsx}",
		"./app/**/*.{js,jsx,ts,tsx}",
	],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				background: "#222831",
				card: "#31363F",
				text: "#EEEEEE",
				border: "#76ABAE",
				borderFocus: "#76ABAE99",
				primary: "#4da3ff",
				secondary: "#ffffff14",
			},
		},
	},
	plugins: [],
};
