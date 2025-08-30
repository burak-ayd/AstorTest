// app/(tabs)/_layout.jsx
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useMemo, useRef, useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Sayfa importları
import SheetHandle from "@/components/sheetHandle";
import { SafeAreaView } from "react-native-safe-area-context";

import History from "./History";
import I0hesap from "./I0hesap";
import TrafoKayip from "./TrafoKayip";
import UkHesap from "./Ukhesap";
import NewProject from "./newProject";

export default function TabLayout() {
	const bottomSheetRef = useRef(null);
	const snapPoints = useMemo(() => ["5%", "50%"], []);
	const [sheetIndex, setSheetIndex] = useState(0);
	// 👉 Varsayılan ekran: TrafoKayıp
	const [selectedScreen, setSelectedScreen] = useState("TrafoKayip");

	// Menü öğeleri
	const menuItems = [
		{ id: "1", label: "Trafo Kayıp", key: "TrafoKayip" },
		{ id: "2", label: "UK", key: "Ukhesap" },
		{ id: "3", label: "I0", key: "I0hesap" },
		{ id: "4", label: "Yeni Proje", key: "NewProject" },
		{ id: "5", label: "Geçmiş", key: "History" },
	];

	// seçilen ekrana göre render
	const renderScreen = () => {
		switch (selectedScreen) {
			case "TrafoKayip":
				return <TrafoKayip />;
			case "Ukhesap":
				return <UkHesap />;
			case "I0hesap":
				return <I0hesap />;
			case "NewProject":
				return <NewProject />;
			case "History":
				return <History />;

			default:
				return <TrafoKayip />;
		}
	};

	const handleMenuSelect = (key) => {
		setSelectedScreen(key);
		bottomSheetRef.current?.snapToIndex(0);
		// bottomSheetRef.current?.close(); // 👉 seçim sonrası otomatik kapanır
	};

	const toggleSheet = () => {
		if (sheetIndex > 0) {
			bottomSheetRef.current?.snapToIndex(0);
		} else {
			bottomSheetRef.current?.expand(); // veya snapToIndex(1)
		}
	};

	return (
		<SafeAreaView
			// style={{
			// 	// flex: 1,
			// 	paddingTop:
			// 		Platform.OS === "android" ? StatusBar.currentHeight : 0,
			// 	// backgroundColor: "#f3f4f6", // Tailwind bg-gray-100
			// }}
			edges={["right", "bottom", "left", "top"]}
			className="flex-1 bg-background">
			<StatusBar
				barStyle="light-content"
				backgroundColor="#fff"
				translucent={false}
			/>
			<KeyboardAvoidingView
				style={{
					flex: 1,
				}}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
				<GestureHandlerRootView style={styles.container}>
					{/* Ekran */}

					<View style={{ flex: 1 }}>{renderScreen()}</View>

					{/* Menü */}
					<BottomSheet
						ref={bottomSheetRef}
						index={0}
						snapPoints={snapPoints}
						// Tutamak çizgisini gizler
						handleIndicatorStyle={{ height: 0 }}
						// Özel tutamak bileşenini kullanır
						onChange={(index) => setSheetIndex(index)}
						handleComponent={() => (
							<SheetHandle
								sheetIndex={sheetIndex}
								onPress={toggleSheet}
							/>
						)}
						enablePanDownToClose={false}>
						<BottomSheetView style={styles.menuContainer}>
							{menuItems.map((item) => (
								<TouchableOpacity
									key={item.id}
									style={[
										styles.menuItem,
										selectedScreen === item.key &&
											styles.activeItem,
									]}
									onPress={() => handleMenuSelect(item.key)}>
									<Text
										style={[
											styles.menuText,
											selectedScreen === item.key &&
												styles.activeText,
										]}>
										{item.label}
									</Text>
								</TouchableOpacity>
							))}
						</BottomSheetView>
					</BottomSheet>
				</GestureHandlerRootView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	menuContainer: {
		flex: 1,
		padding: 20,
	},
	menuItem: {
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
	},
	menuText: {
		fontSize: 18,
		fontWeight: "500",
	},
	activeItem: {
		backgroundColor: "#1e90ff22",
	},
	activeText: {
		color: "#1e90ff",
		fontWeight: "bold",
	},
});

// export default function TabLayout() {
// 	return (
// 		<Tabs
// 			initialRouteName="TrafoKayip"
// 			screenOptions={({ route }) => ({
// 				headerShown: false,
// 				tabBarActiveTintColor: "#eaf0ff", // aktif sekme rengi
// 				tabBarInactiveTintColor: "#AAAAAA", // pasif sekme rengi
// 				tabBarShowLabel: true,
// 				// tabBarLabelStyle: {
// 				// 	position: "absolute",
// 				// 	fontSize: 18,
// 				// 	fontWeight: "bold",
// 				// 	textAlign: "justify",
// 				// 	marginTop: 15, // yazıları üst kısmına yakınlaştır
// 				// 	marginBottom: 0,
// 				// 	alignSelf: "center",
// 				// },
// 				tabBarStyle: {
// 					position: "absolute",
// 					bottom: 0,
// 					// left: 20,
// 					// right: 20,
// 					height: 50, // yüksekliği azaltıldı
// 					borderRadius: 24,
// 					marginHorizontal: 24,
// 					borderColor: "#131a30",
// 					backgroundColor: "#131a30",
// 				},
// 				// tabBarIcon: ({ color, size }) => {
// 				// 	let iconName;

// 				// 	if (route.name === "Trafo Kayıp") {
// 				// 		return (
// 				// 			<MaterialIcons
// 				// 				name="home"
// 				// 				size={size}
// 				// 				color={color}
// 				// 			/>
// 				// 		);
// 				// 	} else if (route.name === "Uk") {
// 				// 		return (
// 				// 			<MaterialIcons
// 				// 				name="search"
// 				// 				size={size}
// 				// 				color={color}
// 				// 			/>
// 				// 		);
// 				// 	} else if (route.name === "I0") {
// 				// 		return (
// 				// 			<MaterialIcons
// 				// 				name="notifications"
// 				// 				size={size}
// 				// 				color={color}
// 				// 			/>
// 				// 		);
// 				// 	} else if (route.name === "Geçmiş") {
// 				// 		return (
// 				// 			<MaterialIcons
// 				// 				name="history"
// 				// 				size={size}
// 				// 				color={color}
// 				// 			/>
// 				// 		);
// 				// 	}
// 				// },
// 				tabBarIcon: () => null, // ikonları kaldır
// 			})}>
// 			<Tabs.Screen
// 				name="TrafoKayip"
// 				options={{
// 					title: "Trafo Kayıp",
// 					tabBarLabel: ({ focused, color }) => (
// 						<View
// 							style={
// 								focused
// 									? styles.activeLabelContainer
// 									: styles.notActive
// 							}>
// 							<Text
// 								style={{
// 									color: color,
// 									fontSize: 16,
// 									fontWeight: focused ? "bold" : "normal",
// 								}}>
// 								Kayıp
// 							</Text>
// 						</View>
// 					),
// 				}}
// 			/>
// 			<Tabs.Screen
// 				name="Ukhesap"
// 				options={{
// 					tabBarLabel: ({ focused, color }) => (
// 						<View
// 							style={
// 								focused
// 									? styles.activeLabelContainer
// 									: styles.notActive
// 							}>
// 							<Text
// 								style={{
// 									color: color,
// 									fontSize: 16,
// 									fontWeight: focused ? "bold" : "normal",
// 								}}>
// 								Uk
// 							</Text>
// 						</View>
// 					),
// 					title: "Uk",
// 				}}
// 			/>
// 			<Tabs.Screen
// 				name="I0hesap"
// 				options={{
// 					tabBarLabel: ({ focused, color }) => (
// 						<View
// 							style={
// 								focused
// 									? styles.activeLabelContainer
// 									: styles.notActive
// 							}>
// 							<Text
// 								style={{
// 									color: color,
// 									fontSize: 16,
// 									fontWeight: focused ? "bold" : "normal",
// 								}}>
// 								I0
// 							</Text>
// 						</View>
// 					),
// 					title: "I0",
// 				}}
// 			/>
// 			<Tabs.Screen
// 				name="History"
// 				options={{
// 					tabBarLabel: ({ focused, color }) => (
// 						<View
// 							style={
// 								focused
// 									? styles.activeLabelContainer
// 									: styles.notActive
// 							}>
// 							<Text
// 								style={{
// 									color: color,
// 									fontSize: 16,
// 									fontWeight: focused ? "bold" : "normal",
// 								}}>
// 								Geçmiş
// 							</Text>
// 						</View>
// 					),
// 					title: "Geçmiş",
// 				}}
// 			/>
// 		</Tabs>
// 	);
// }
// const styles = StyleSheet.create({
// 	activeLabelContainer: {
// 		borderRadius: 10,
// 		backgroundColor: "rgba(30, 144, 255, 0.2)", // hafif mavi arka plan
// 		paddingHorizontal: 12,
// 		paddingVertical: 8,
// 		position: "absolute",
// 		marginTop: 10, // yazıları üst kısmına yakınlaştır
// 		// marginBottom: 10,
// 		// margin: 10,
// 	},
// 	notActive: {
// 		position: "absolute",
// 		marginTop: 15, // yazıları üst kısmına yakınlaştır
// 		marginBottom: 0,
// 		marginHorizontal: 10,
// 	},
// });
