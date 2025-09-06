import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Platform, ScrollView, Text, View } from "react-native";

const FontDebugComponent = () => {
	const [fontTest, setFontTest] = useState({});

	useEffect(() => {
		// Font yükleme testi
		const testFonts = async () => {
			try {
				console.log("🔤 Font test başlıyor...");
				console.log("📱 Platform:", Platform.OS);
				console.log("🏗️ Build type:", __DEV__ ? "Debug" : "Release");

				setFontTest({
					platform: Platform.OS,
					buildType: __DEV__ ? "Debug" : "Release",
					timestamp: new Date().toISOString(),
				});
			} catch (error) {
				console.error("❌ Font test hatası:", error);
			}
		};

		testFonts();
	}, []);

	return (
		<ScrollView style={{ flex: 1, padding: 20, backgroundColor: "white" }}>
			<Text
				style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
				🔍 APK İkon Debug Test
			</Text>

			<Text style={{ fontSize: 16, marginBottom: 10 }}>
				Platform: {Platform.OS} | Build: {__DEV__ ? "Debug" : "Release"}
			</Text>

			{/* Test 1: Farklı ikon setleri */}
			<View style={{ marginBottom: 30 }}>
				<Text
					style={{
						fontSize: 18,
						fontWeight: "bold",
						marginBottom: 10,
					}}>
					Test 1: Ağır İkonlar
				</Text>
				<View
					style={{
						flexDirection: "row",
						gap: 15,
						alignItems: "center",
					}}>
					<View style={{ alignItems: "center" }}>
						<Ionicons name="home" size={40} color="blue" />
						<Text>Ionicons</Text>
						<Text style={{ fontSize: 10 }}>home</Text>
					</View>
					<View style={{ alignItems: "center" }}>
						<MaterialIcons name="home" size={40} color="green" />
						<Text>Material</Text>
						<Text style={{ fontSize: 10 }}>home</Text>
					</View>
					<View style={{ alignItems: "center" }}>
						<AntDesign name="home" size={40} color="red" />
						<Text>AntDesign</Text>
						<Text style={{ fontSize: 10 }}>home</Text>
					</View>
				</View>
			</View>

			{/* Test 2: Fallback karakterler */}
			<View style={{ marginBottom: 30 }}>
				<Text
					style={{
						fontSize: 18,
						fontWeight: "bold",
						marginBottom: 10,
					}}>
					Test 2: Fallback Test
				</Text>
				<Text style={{ fontSize: 16 }}>
					Bu karakterleri görüyor musunuz?
				</Text>
				<View style={{ flexDirection: "row", gap: 20, marginTop: 10 }}>
					<Text style={{ fontSize: 30 }}>⚡</Text>
					<Text style={{ fontSize: 30 }}>🏠</Text>
					<Text style={{ fontSize: 30 }}>⚙️</Text>
					<Text style={{ fontSize: 30 }}>📊</Text>
				</View>
			</View>

			{/* Test 3: Font family kontrol */}
			<View style={{ marginBottom: 30 }}>
				<Text
					style={{
						fontSize: 18,
						fontWeight: "bold",
						marginBottom: 10,
					}}>
					Test 3: Font Family Test
				</Text>
				<Text style={{ fontFamily: "Ionicons", fontSize: 30 }}>
					&#xf384;
				</Text>
				<Text>Yukarıda ev ikonu görmelisiniz</Text>
			</View>

			{/* Test 4: Koşullu render */}
			<View style={{ marginBottom: 30 }}>
				<Text
					style={{
						fontSize: 18,
						fontWeight: "bold",
						marginBottom: 10,
					}}>
					Test 4: Koşullu Render
				</Text>
				{Platform.OS === "android" && (
					<View>
						<Ionicons name="android" size={40} color="green" />
						<Text>Android İkonu</Text>
					</View>
				)}
			</View>
		</ScrollView>
	);
};

export default FontDebugComponent;
