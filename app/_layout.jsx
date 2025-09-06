// app/_layout.jsx
import AntDesign from "@expo/vector-icons/AntDesign";
import { useFonts } from "expo-font";

import { Stack } from "expo-router";
export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		...AntDesign.font, // paket ile uyumlu font mapping
	});

	// if (!fontsLoaded) {
	// 	return null; // font yüklenene kadar boş render
	// }

	return (
		<Stack
			screenOptions={{
				headerShown: false, // 🔴 tüm ekranlarda header’ı kaldırır
			}}>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
		</Stack>
	);
}
