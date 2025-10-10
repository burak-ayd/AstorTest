import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
// Kök 3 sabitini önceden hesaplayalım
const SQRT3 = Math.sqrt(3);

export default function UkHesap({ showToast }) {
	// State'ler ve mantık kodları neredeyse hiç değişmeden kalır
	const [cikilanGerilim, setCikilanGerilim] = useState("");
	const [kademeAkimi, setKademeAkimi] = useState("");
	const [kademeGerilimi, setKademeGerilimi] = useState("");
	const [cikilanAkim, setCikilanAkim] = useState("");
	const [params, setParams] = useState({
		cg: "",
		na: "",
		kg: "",
		ca: "",
		uk: "",
	});

	const [kv, setKv] = useState(true); // Bu state şu an kullanılmıyor ama mantıkta var, korundu.

	const [error, setError] = useState(false);
	const [result, setResult] = useState(null);
	const [history, setHistory] = useState([]);

	// State değiştikçe otomatik hesaplama (Aynı kalır)
	useEffect(() => {
		if (cikilanGerilim || kademeAkimi || kademeGerilimi || cikilanAkim) {
			hesapla();
		}
	}, [cikilanGerilim, kademeAkimi, kademeGerilimi, cikilanAkim]);

	// --- YARDIMCI FONKSİYONLAR ---
	// Bu fonksiyonlar saf JavaScript olduğu için aynen kalır
	function parseNum(v) {
		if (typeof v !== "string") return NaN;
		return Number(v.trim().replace(/,/g, "."));
	}
	const formatPct = (x) =>
		!isFinite(x)
			? "—"
			: `${x.toLocaleString("tr-TR", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
			  })} %`;
	const formatVoltAmp = (x) =>
		!isFinite(x)
			? "—"
			: x.toLocaleString("tr-TR", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
			  });

	// --- ANA FONKSİYONLAR ---
	async function gecmisKaydet() {
		if (
			!params.uk ||
			!params.cg ||
			!params.na ||
			!params.kg ||
			!params.ca
		) {
			setError(true);
			return;
		}
		setError(false);
		const now = new Date();
		const newEntry = {
			id: Date.now().toString(), // FlatList için string id daha iyidir
			timestamp: now.toLocaleString("tr-TR"),
			timestampMs: now.getTime(),
			uk: params.uk,
			cg: params.cg,
			na: params.na,
			kg: params.kg,
			ca: params.ca,
		};

		const newHistory = [newEntry, ...history];
		setHistory(newHistory);

		try {
			await AsyncStorage.setItem("UkHistory", JSON.stringify(newHistory));
			console.log("Geçmiş kaydedildi.");
			// showToast("Başarıyla kaydedildi!");
			showToast && showToast("Başarıyla kaydedildi!", "bottom");
		} catch (e) {
			console.error("Geçmiş kaydedilirken hata:", e);
		}
		temizle();
		// Keyboard.dismiss(); // Kaydettikten sonra klavyeyi kapat
		console.log("Yeni Eklenen: ", newHistory.length);
	}

	// const showToast = () => {
	// 	console.log("Toast gösteriliyor...");
	// 	Toast.show({
	// 		position: "bottom",
	// 		type: "success",
	// 		text1: "Başarıyla kaydedildi!",
	// 		hideOnPress: true,
	// 		bottomOffset: 70,
	// 		keyboardOffset: 70,
	// 	});
	// };

	useEffect(() => {
		async function get() {
			const stored = await AsyncStorage.getItem("UkHistory");
			const parsed = stored ? JSON.parse(stored) : [];
			setHistory(parsed);
		}
		get();
	}, [history]);

	function hesapla() {
		const cg = parseNum(cikilanGerilim);
		const na = parseNum(kademeAkimi);
		const kg = parseNum(kademeGerilimi);
		const ca = parseNum(cikilanAkim);

		const valid = [cg, na, kg, ca].every((n) => isFinite(n) && n > 0);
		if (!valid) {
			setError(
				!!(
					cikilanGerilim ||
					cikilanAkim ||
					kademeGerilimi ||
					kademeAkimi
				)
			);
			setResult(null);
			return;
		}

		setError(false);
		const cgScaled = kv ? cg * SQRT3 * 1000 : cg * SQRT3;
		const olcek = cgScaled * 100;
		const kgScaled = kv ? kg * 1000 : kg;
		const uk = (olcek * na) / (kgScaled * ca);
		const formattedResult = formatPct(uk);
		setResult(formattedResult);

		setParams({
			cg: `${formatVoltAmp(cg)} kV`,
			na: na,
			kg: `${formatVoltAmp(kg)} kV`,
			ca: ca,
			uk: formattedResult,
		});
	}

	function temizle() {
		setCikilanGerilim("");
		setKademeAkimi("");
		setKademeGerilimi("");
		setCikilanAkim("");
		setError(false);
		setResult(null);
		setParams({ cg: "", na: "", kg: "", ca: "", uk: "" });
		setHistory([]);
	}

	async function clearHistory() {
		setHistory([]);
		try {
			await AsyncStorage.removeItem("UkHistory");
		} catch (e) {
			console.error("Geçmiş silinirken hata:", e);
		}
	}

	return (
		<View>
			{/* Başlık ve Formül */}
			<View style={styles.header}>
				<Text style={styles.title}>Trafo Uk (%) Hesaplayıcı</Text>
				<Text style={styles.formulaText}>
					Uk(%) = (Uçıkılan · √3 · 100 · Ikademe) / (Ukademe ·
					Içıkılan)
				</Text>
			</View>

			{/* Hesaplama Kartı */}
			<View style={styles.card}>
				<View style={styles.grid}>
					<InputGroup
						label="Çıkılan Gerilim"
						unit="kV"
						value={cikilanGerilim}
						onChangeText={setCikilanGerilim}
						placeholder="ör. 0,4"
					/>
					<InputGroup
						label="Çıkılan Akım"
						unit="A"
						value={cikilanAkim}
						onChangeText={setCikilanAkim}
						placeholder="ör. 180"
					/>
					<InputGroup
						label="Kademe Gerilimi"
						unit="kV"
						value={kademeGerilimi}
						onChangeText={setKademeGerilimi}
						placeholder="ör. 33"
					/>
					<InputGroup
						label="Kademe Akımı"
						unit="A"
						value={kademeAkimi}
						onChangeText={setKademeAkimi}
						placeholder="ör. 210"
					/>
				</View>

				<View style={styles.actions}>
					<TouchableOpacity
						style={styles.button}
						onPress={gecmisKaydet}>
						<Text style={styles.buttonText}>Kaydet</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.button, styles.secondaryButton]}
						onPress={temizle}>
						<Text
							style={[
								styles.buttonText,
								styles.secondaryButtonText,
							]}>
							Temizle
						</Text>
					</TouchableOpacity>
				</View>

				{error && (
					<Text style={styles.errorText}>
						Lütfen tüm alanlara geçerli sayılar girin.
					</Text>
				)}

				{result && (
					<View style={styles.resultContainer}>
						<View>
							<Text style={styles.resultLabel}>Uk Değeri</Text>
							<Text style={styles.resultHint}>
								Kısa devre gerilimi (%)
							</Text>
						</View>
						<Text style={styles.resultValue}>{result}</Text>
					</View>
				)}
			</View>
		</View>
	);
}

// Tekrarlanan Input yapısını bir bileşene dönüştürmek kodu temizler
const InputGroup = ({ label, unit, value, onChangeText, placeholder }) => (
	<View style={styles.inputGroup}>
		<Text style={styles.label}>
			{label} <Text style={styles.unit}>({unit})</Text>
		</Text>
		<TextInput
			style={styles.input}
			value={value}
			onChangeText={onChangeText}
			placeholder={placeholder}
			keyboardType="decimal-pad"
			placeholderTextColor="#999"
		/>
	</View>
);

// --- STİLLER (CSS yerine StyleSheet) ---
const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: "#121212" },
	container: { padding: 20 },
	header: { alignItems: "center", marginBottom: 20 },
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#FFF",
		marginBottom: 10,
	},
	formulaText: { color: "#AAA", textAlign: "center", fontSize: 14 },
	card: {
		backgroundColor: "#1E1E1E",
		borderRadius: 12,
		padding: 16,
		marginBottom: 20,
		elevation: 3,
		shadowColor: "#000",
		shadowOpacity: 0.5,
		shadowRadius: 5,
	},
	cardTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	inputGroup: { width: "48%", marginBottom: 16 },
	label: { color: "#DDD", marginBottom: 6, fontSize: 14 },
	unit: { color: "#888" },
	input: {
		backgroundColor: "#333",
		color: "#FFF",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 16,
	},
	actions: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginTop: 10,
	},
	button: {
		flex: 1,
		backgroundColor: "#4CAF50",
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: "center",
		marginHorizontal: 5,
	},
	buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
	secondaryButton: { backgroundColor: "#555" },
	secondaryButtonText: { color: "#FFF" },
	errorText: {
		color: "#FF6B6B",
		marginTop: 15,
		textAlign: "center",
		fontWeight: "bold",
	},
	resultContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "rgba(76, 175, 80, 0.2)",
		padding: 16,
		borderRadius: 8,
		marginTop: 20,
	},
	resultLabel: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
	resultHint: { color: "#AAA", fontSize: 12 },
	resultValue: { color: "#4CAF50", fontSize: 28, fontWeight: "bold" },
	historyHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#333",
		paddingBottom: 10,
	},
	clearHistoryText: { color: "#FF6B6B", fontWeight: "bold" },
	historyItem: {
		borderBottomWidth: 1,
		borderBottomColor: "#333",
		paddingVertical: 10,
	},
	historyTimestamp: { color: "#AAA", fontSize: 12, fontWeight: "bold" },
	historyUk: {
		color: "#FFF",
		fontSize: 16,
		fontWeight: "bold",
		marginVertical: 4,
	},
	historyDetails: { color: "#BBB", fontSize: 14 },
});
