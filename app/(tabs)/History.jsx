import I0Item from "@/components/history/I0Item";
import TkItem from "@/components/history/TkItem";
import UkItem from "@/components/history/UkItem";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import "moment/locale/tr"; // Bu satırın eklendiğinden emin olun
import { useCallback, useEffect, useState } from "react";
import {
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function History() {
	const [history, setHistory] = useState([]);
	const [selectedHistory, setSelectedHistory] = useState("Uk"); // tk=trafokayıp uk=uk ı0=I0

	const [refreshing, setRefreshing] = useState(false);

	const [searchHistory, setSearchHistory] = useState("UkHistory"); // 🔑 state yaptık

	const [date, setDate] = useState(new Date());
	const [open, setOpen] = useState(false);

	// selectedHistory değiştiğinde searchHistory'yi güncelle
	useEffect(() => {
		setSearchHistory(selectedHistory + "History");
	}, [selectedHistory]);

	const loadHistory = async () => {
		try {
			console.log(
				selectedHistory ? searchHistory : "UkHistory",
				"Yenilendi-3",
				selectedHistory,
				searchHistory
			);
			const stored = await AsyncStorage.getItem(searchHistory);
			const parsed = stored ? JSON.parse(stored) : [];

			const now = Date.now();
			const fiveDays = 5 * 24 * 60 * 60 * 1000;

			const filtered = parsed.filter(
				(item) => now - item.timestampMs < fiveDays
			);

			setHistory(filtered);
			await AsyncStorage.setItem(searchHistory, JSON.stringify(filtered));
		} catch (e) {
			console.error("Error loading history:", e);
		}
	};

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadHistory();
		setRefreshing(false);
	}, [searchHistory]);

	useFocusEffect(
		useCallback(() => {
			onRefresh();
		}, [onRefresh])
	);

	useEffect(() => {
		loadHistory();
	}, [searchHistory]);

	// Tek bir girdiyi sil
	const handleDeleteItem = async (id) => {
		const filtered = history.filter((item) => item.id !== id);
		setHistory(filtered);
		try {
			await AsyncStorage.setItem(searchHistory, JSON.stringify(filtered));
		} catch (e) {
			console.error("Error deleting item:", e);
		}
	};

	const clearHistory = async () => {
		try {
			await AsyncStorage.removeItem(searchHistory);
			setHistory([]);
		} catch (e) {
			console.error("Error clearing history:", e);
		}
	};

	const EmptyList = () => (
		<Text style={styles.emptyListText}>
			Kayıt bulunamadı. Lütfen yeni bir hesaplama yapın.
		</Text>
	);

	function SelectedHistory(typeOfHistory) {
		setSelectedHistory(typeOfHistory);
	}

	const tarihlerEsitMi = (tarih1, tarih2) => {
		// Tarih objesi değilse yeni Date objesine dönüştürürüz
		const d1 = tarih1 instanceof Date ? tarih1 : new Date(tarih1);
		const d2 = tarih2 instanceof Date ? tarih2 : new Date(tarih2);

		return (
			d1.getDate() === d2.getDate() && // Günleri kıyasla
			d1.getMonth() === d2.getMonth() && // Ayları kıyasla (aylar 0'dan başlar)
			d1.getFullYear() === d2.getFullYear() // Yılları kıyasla
		);
	};

	// Şimdi bu fonksiyonu yukarıdaki bileşende nasıl kullanabileceğinize bakalım
	// Örneğin, 25 Aralık 2025 tarihine eşit olup olmadığını kontrol edelim
	const hedefTarih = new Date(2025, 11, 25); // Ay 11'dir (Aralık) çünkü aylar 0'dan başlar

	// ... Tarih seçici bileşeni içinde ...
	if (tarihlerEsitMi(date, hedefTarih)) {
		console.log("Seçilen tarih, 25 Aralık 2025 tarihine eşittir!");
	} else {
		console.log("Seçilen tarih, 25 Aralık 2025 tarihine eşit değil.");
	}

	useEffect(() => {
		tarihlerEsitMi(date, "2025.11.25");
	}, [date]);

	// 🔑 switch-case ile component seçimi
	let content;
	switch (selectedHistory) {
		case "Uk":
			content = (
				<UkItem
					refreshing={refreshing}
					onRefresh={onRefresh}
					handleDeleteItem={handleDeleteItem}
					EmptyList={EmptyList}
					history={history}
				/>
			);
			break;
		case "Tk":
			content = (
				<TkItem
					refreshing={refreshing}
					onRefresh={onRefresh}
					handleDeleteItem={handleDeleteItem}
					EmptyList={EmptyList}
					history={history}
				/>
			);
			break;
		case "I0":
			content = (
				<I0Item
					refreshing={refreshing}
					onRefresh={onRefresh}
					handleDeleteItem={handleDeleteItem}
					EmptyList={EmptyList}
					history={history}
				/>
			);
			break;
		default:
			content = (
				<Text style={styles.emptyListText}>
					Geçerli bir geçmiş tipi seçilmedi.
				</Text>
			);
	}

	return (
		<SafeAreaView
			edges={["right", "bottom", "left", "top"]}
			className="flex-1 bg-[#161e36] flex-col">
			<StatusBar
				barStyle="light-content"
				backgroundColor="#f3f4f6"
				translucent={true}
			/>
			<View
				style={{
					flexDirection: "row",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					// gap: 16,
					marginHorizontal: 12,
					marginBottom: 8,
					paddingHorizontal: 16,
					paddingVertical: 8,
					backgroundColor: "#081230",
					borderWidth: 1,
					borderColor: "rgba(255, 255, 255, 0.1)",
					borderRadius: 24,
				}}>
				<Text style={styles.title}>
					{selectedHistory ? selectedHistory : "Uk"} Hesaplama Geçmişi
				</Text>
				{/* <Button title="Tarih Seç" onPress={() => setOpen(true)} />
				<DatePicker
					modal
					open={open}
					date={date}
					mode="date" // Sadece tarih seçimi için "date" modunu kullanın
					locale="tr"
					onConfirm={(selectedDate) => {
						setOpen(false);
						setDate(selectedDate);
						console.log("Seçilen tarih:", selectedDate);
					}}
					onCancel={() => {
						setOpen(false);
					}}
				/> */}
				<TouchableOpacity
					style={[
						styles.allDeleteButton,
						history.length <= 0 && styles.allDeleteButtonDisabled, // disabled ise ek stil
					]}
					onPress={clearHistory}
					disabled={history.length <= 0}>
					<Text style={styles.deleteButtonText}>Tüm Geçmişi Sil</Text>
				</TouchableOpacity>
			</View>

			{content}

			<View className="flex flex-row bottom-16 justify-between px-4">
				<TouchableOpacity
					style={styles.Button}
					onPress={() => SelectedHistory("Tk")}>
					<Text style={styles.deleteButtonText}>
						Trafo Kayıp Geçmişi
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.Button}
					onPress={() => SelectedHistory("Uk")}>
					<Text style={styles.deleteButtonText}>Uk Geçmişi</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.Button}
					onPress={() => SelectedHistory("I0")}>
					<Text style={styles.deleteButtonText}>I0 Geçmişi</Text>
				</TouchableOpacity>
			</View>

			{/* Alt Panel */}
			{/* <GestureHandlerRootView>
				<BottomSheet
					snapPoints={snapPoints}
					backgroundStyle={{ backgroundColor: "#2d3347" }}
					handleIndicatorStyle={{ backgroundColor: "#fff" }}>
					<BottomSheetView style={styles.contentContainer}>
						<TouchableOpacity
							style={styles.allDeleteButton}
							onPress={() => SelectedHistory("Tk")}>
							<Text style={styles.deleteButtonText}>
								Trafo Kayıp Geçmişi
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.allDeleteButton}
							onPress={() => SelectedHistory("Uk")}>
							<Text style={styles.deleteButtonText}>
								Uk Geçmişi
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.allDeleteButton}
							onPress={() => SelectedHistory("I0")}>
							<Text style={styles.deleteButtonText}>
								I0 Geçmişi
							</Text>
						</TouchableOpacity>
					</BottomSheetView>
				</BottomSheet>
			</GestureHandlerRootView> */}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	contentContainer: {
		padding: 12,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	card: {
		paddingHorizontal: 12,
		flex: 1,
		marginBottom: 60,
		// display: "flex",
		// flexDirection: "column",
		// gap: 1,
		// maxHeight: 420,
		// overflowY: "auto",
		// backgroundColor: "#fff",
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#fff",
		alignSelf: "center",
	},
	firstRow: {
		// alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
		display: "flex",
	},
	historyItem: {
		backgroundColor: "rgba(255, 255, 255, 0.05)",
		borderWidth: 1,
		borderColor: "rgba(255, 255, 255, 0.1)",
		borderRadius: 12,
		marginBottom: 4,
		padding: 12,
		transitionDuration: 0.2,
		transitionProperty: "backgroundColor",
		transitionTimingFunction: "ease",
	},
	historyItemText: {
		color: "#fff",
		fontWeight: "medium",
	},
	timestamp: {
		color: "#4da3ff",
		fontWeight: "medium",
		fontSize: 18,
	},
	deleteButton: {
		marginTop: 5,
		alignSelf: "flex-start",
		backgroundColor: "#ff4d4d",
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 5,
	},
	allDeleteButton: {
		// marginTop: 5,
		backgroundColor: "rgba(255, 107, 107, 0.25)",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
		borderWidth: 1,
		fontWeight: 700,
		borderColor: "rgba(255, 107, 107, 0.4)",
		color: "#ffbaba",
	},
	allDeleteButtonDisabled: {
		backgroundColor: "rgba(200, 200, 200, 0.25)", // disabled arkaplan rengi
		borderColor: "rgba(200, 200, 200, 0.4)",
		fontWeight: 200,
	},
	Button: {
		// marginTop: 5,
		backgroundColor: "rgba(255, 107, 107, 0.25)",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
		borderWidth: 1,
		fontWeight: 700,
		borderColor: "rgba(255, 107, 107, 0.4)",
		color: "#ffbaba",
	},
	deleteButtonText: {
		color: "#fff",
		fontWeight: "bold",
		padding: 4,
	},
	emptyListText: {
		color: "#fff",
		textAlign: "center",
		marginTop: 20,
		fontSize: 16,
		fontWeight: "normal",
	},
});
