// Alternatif çözüm - Bottom sheet'i gizlemeden
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	Keyboard,
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

import DirencHesabi from "./DirencHesabi";
import History from "./History";
import I0hesap from "./I0hesap";
import NewProject from "./newProject";
import OtaUpdate from "./OtaUpdate";
import TrafoKayip from "./TrafoKayip";
import UkHesap from "./Ukhesap";

export default function TabLayout() {
	const bottomSheetRef = useRef(null);
	const [sheetIndex, setSheetIndex] = useState(0);
	const [selectedScreen, setSelectedScreen] = useState("TrafoKayip");
	const [keyboardHeight, setKeyboardHeight] = useState(0);

	// Klavye yüksekliğine göre dinamik snap points
	const snapPoints = useMemo(() => {
		const baseSnapPoint = keyboardHeight > 0 ? "3%" : "5%";
		const expandedSnapPoint = keyboardHeight > 0 ? "30%" : "50%";
		return [baseSnapPoint, expandedSnapPoint];
	}, [keyboardHeight]);

	// Klavye event listeners
	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
			(event) => {
				setKeyboardHeight(event.endCoordinates.height);
				// Bottom sheet'i küçük konuma getir
				if (sheetIndex > 0) {
					bottomSheetRef.current?.snapToIndex(0);
				}
			}
		);

		const keyboardDidHideListener = Keyboard.addListener(
			Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
			() => {
				setKeyboardHeight(0);
				// Klavye kapandığında snap points yeniden ayarlanacak
				setTimeout(() => {
					bottomSheetRef.current?.snapToIndex(0);
				}, 100);
			}
		);

		return () => {
			keyboardDidShowListener?.remove();
			keyboardDidHideListener?.remove();
		};
	}, [sheetIndex]);

	// Snap points değiştiğinde bottom sheet'i güncelle
	useEffect(() => {
		if (bottomSheetRef.current) {
			bottomSheetRef.current.snapToIndex(0);
		}
	}, [snapPoints]);

	// Menü öğeleri
	const menuItems = [
		{ id: "1", label: "Trafo Kayıp", key: "TrafoKayip" },
		{ id: "2", label: "UK", key: "Ukhesap" },
		{ id: "3", label: "I0", key: "I0hesap" },
		{ id: "4", label: "Yeni Proje", key: "NewProject" },
		{ id: "5", label: "Kabul Direnç Hesabı", key: "DirencHesabi" },
		{ id: "7", label: "Güncelleme", key: "OtaUpdate" },
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
			case "OtaUpdate":
				return <OtaUpdate />;
			case "History":
				return <History />;
			default:
				return <TrafoKayip />;
		}
	};

	const handleMenuSelect = (key) => {
		setSelectedScreen(key);
		bottomSheetRef.current?.snapToIndex(0);
	};

	const toggleSheet = () => {
		if (sheetIndex > 0) {
			bottomSheetRef.current?.snapToIndex(0);
		} else {
			bottomSheetRef.current?.expand();
		}
	};

	return (
		<SafeAreaView
			edges={["right", "bottom", "left", "top"]}
			className="flex-1 bg-background">
			<StatusBar
				barStyle="light-content"
				backgroundColor="#fff"
				translucent={false}
			/>
			<GestureHandlerRootView style={styles.container}>
				{/* Ekran - KeyboardAvoidingView içinde */}
				<KeyboardAvoidingView
					style={styles.screenContainer}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					keyboardVerticalOffset={0}>
					<View style={styles.contentContainer}>
						{renderScreen()}
					</View>
				</KeyboardAvoidingView>

				{/* Menü - Sabit konumda */}
				<BottomSheet
					ref={bottomSheetRef}
					index={0}
					snapPoints={snapPoints}
					handleIndicatorStyle={{ height: 0 }}
					onChange={(index) => setSheetIndex(index)}
					handleComponent={() => (
						<SheetHandle
							sheetIndex={sheetIndex}
							onPress={toggleSheet}
						/>
					)}
					enablePanDownToClose={false}
					android_keyboardInputMode="adjustResize"
					keyboardBehavior="interactive"
					keyboardBlurBehavior="restore">
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
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	screenContainer: {
		flex: 1,
	},
	contentContainer: {
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
