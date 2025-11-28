import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useState } from "react";
import {
	Modal,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
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
	const insets = useSafeAreaInsets();

	const [selectedScreen, setSelectedScreen] = useState("TrafoKayip");
	const [menuVisible, setMenuVisible] = useState(false);

	const menuItems = [
		{ id: "1", label: "Trafo Kayıp", key: "TrafoKayip" },
		{ id: "2", label: "UK", key: "Ukhesap" },
		{ id: "3", label: "I0", key: "I0hesap" },
		{ id: "4", label: "Yeni Proje", key: "NewProject" },
		{ id: "5", label: "Kabul Direnci", key: "DirencHesabi" },
		{ id: "6", label: "Sıfır Bileşeni", key: "SıfırBileşen" },
		{ id: "98", label: "Güncelleme", key: "OtaUpdate" },
		{ id: "99", label: "Geçmiş", key: "History" },
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
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#000" />

			{/* HEADER */}
			<View style={[styles.header, { paddingTop: insets.top }]}>
				<TouchableOpacity
					onPress={() => setMenuVisible(true)}
					style={styles.menuButton}>
					<MaterialIcons name="menu" size={32} color="#fff" />
				</TouchableOpacity>
			</View>

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
									setSelectedScreen(item.key);
									setMenuVisible(false);
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
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#222831",
	},
	header: {
		height: 30,
		paddingHorizontal: 2,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#111",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#fff",
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
