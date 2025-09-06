// app/_layout.jsx
import { Stack } from "expo-router";

export default function RootLayout() {
<<<<<<< HEAD
=======
	const [fontsLoaded] = useFonts({
		...AntDesign.font, // paket ile uyumlu font mapping
	});

	// if (!fontsLoaded) {
	// 	return null; // font yüklenene kadar boş render
	// }

>>>>>>> a4d85c089036a7f0f2387bdd049249470d26c793
	return (
		<Stack
			screenOptions={{
				headerShown: false, // 🔴 tüm ekranlarda header’ı kaldırır
			}}>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
		</Stack>
	);
}
