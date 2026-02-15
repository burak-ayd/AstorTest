import AppHeader from "@components/AppHeader";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
	Modal,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import DirencHesabi from "./DirencHesabi";
import History from "./History";
import I0hesap from "./I0hesap";
import NewProject from "./newProject";
import OtaUpdate from "./OtaUpdate";
import TrafoKayip from "./TrafoKayip";
import UkHesap from "./Ukhesap";
import SıfırBileşenHesabı from "./Zo";

export default function TabLayout() {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const [selectedScreen, setSelectedScreen] = useState("TrafoKayip");
	const [menuVisible, setMenuVisible] = useState(false);

	const menuItems = [
		{
			id: "1",
			label: "Trafo Kayıp",
			key: "TrafoKayip",
			title: "Trafo Yükte Kayıp Hesaplayıcı",
		},
		{
			id: "2",
			label: "UK Hesap",
			key: "Ukhesap",
			title: "Trafo Uk (%) Hesaplayıcı",
		},
		{
			id: "3",
			label: "I0 Hesap",
			key: "I0hesap",
			title: "I0 (%) Hesaplayıcı",
		},
		{
			id: "4",
			label: "Yeni Proje Hesaplama",
			key: "NewProject",
			title: "Yeni Proje Hesaplama",
		},
		{
			id: "5",
			label: "Kabul Direnc Hesabı",
			key: "DirencHesabi",
			title: "Kabul Direnci Hesabı",
		},
		{
			id: "6",
			label: "Sıfır Bileşen Hesabı",
			key: "SıfırBileşen",
			title: "Sıfır Bileşen Hesabı",
		},
		{
			id: "7",
			label: "Kısmi Deşarj Hesabı",
			key: "Desarj",
			title: "Kısmi Deşarj Hesabı",
		},
		{
			id: "98",
			label: "Güncelleme",
			key: "OtaUpdate",
			title: "Güncelleme",
		},
		{ id: "99", label: "Geçmiş", key: "History", title: "Geçmiş" },
	];

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
			case "DirencHesabi":
				return <DirencHesabi />;
			case "SıfırBileşen":
				return <SıfırBileşenHesabı />;

			case "OtaUpdate":
				return <OtaUpdate />;
			case "History":
				return <History />;
			default:
				return <TrafoKayip />;
		}
	};

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaView style={styles.container}>
				<StatusBar barStyle="light-content" backgroundColor="#000" />

				{/* HEADER - Component kullan */}
				<AppHeader
					title={
						menuItems.find((item) => item.key === selectedScreen)
							?.title || ""
					}
					onMenuPress={() => setMenuVisible(true)}
				/>

				{/* ACTIVE SCREEN */}
				<View style={styles.screenContent}>{renderScreen()}</View>

				{/* MODAL MENU */}
				<Modal
					animationType="fade"
					transparent={true}
					visible={menuVisible}
					onRequestClose={() => setMenuVisible(false)}>
					<View style={styles.menuOverlay}>
						<View
							style={[
								styles.menuContainer,
								{ paddingBottom: insets.bottom },
							]}>
							{menuItems.map((item) => (
								<TouchableOpacity
									key={item.id}
									style={styles.menuItem}
									onPress={() => {
										if (item.key === "Desarj") {
											setMenuVisible(false);
											router.push("/(desarj)/Kuru");
										} else {
											setSelectedScreen(item.key);
											setMenuVisible(false);
										}
									}}>
									<Text style={styles.menuText}>
										{item.label}
									</Text>
								</TouchableOpacity>
							))}
						</View>

						{/* Menü dışına tıklayınca kapansın */}
						<TouchableOpacity
							style={styles.transparentArea}
							onPress={() => setMenuVisible(false)}
						/>
					</View>
				</Modal>
			</SafeAreaView>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#222831",
	},
	header: {
		height: 50,
		paddingHorizontal: 2,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#111",
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#fff",
		flex: 1,
		textAlign: "center",
		marginRight: 42, // Offset for menu button to center the title
	},
	menuButton: {
		paddingHorizontal: 10,
	},
	menuIcon: {
		fontSize: 26,
		color: "white",
		fontWeight: "bold",
	},
	screenContent: {
		flex: 1,
	},
	menuOverlay: {
		flex: 1,
		flexDirection: "row",
	},
	transparentArea: {
		flex: 1,
	},
	menuContainer: {
		width: 260,
		backgroundColor: "#1A1A1A",
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	menuItem: {
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#333",
	},
	menuText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "500",
	},
});
