import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
	ScrollView,
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

	const [guc, setGuc] = useState("");

	const [ilkKademeCikilanGerilim, setIlkKademeCikilanGerilim] = useState("");
	const [ilkKademeCikilanAkim, setIlkKademeCikilanAkim] = useState("");

	const [nomCikilanGerilim, setNomCikilanGerilim] = useState("");
	const [nomCikilanAkim, setNomCikilanAkim] = useState("");

	const [sonKademeCikilanGerilim, setSonKademeCikilanGerilim] = useState("");
	const [sonKademeCikilanAkim, setSonKademeCikilanAkim] = useState("");

	const [ilkKademeGerilim, setIlkKademeGerilim] = useState("");
	const [nomKademeGerilim, setNomKademeGerilim] = useState("");
	const [sonKademeGerilim, setSonKademeGerilim] = useState("");

	const [params, setParams] = useState({
		guc: "",
		ilkKademeCikilanGerilim: "",
		ilkKademeCikilanAkim: "",
		sonKademeCikilanGerilim: "",
		sonKademeCikilanAkim: "",
		nomCikilanGerilim: "",
		nomCikilanAkim: "",
		ilkKademeGerilim: "",
		sonKademeGerilim: "",
		nomKademeGerilim: "",
	});

	const [kv, setKv] = useState(true); // Bu state şu an kullanılmıyor ama mantıkta var, korundu.

	const [error, setError] = useState("");
	const [resultNomKademeUk, setResultNomKademeUk] = useState(null);
	const [resultIlkKademeUk, setResultIlkKademeUk] = useState(null);
	const [resultSonKademeUk, setResultSonKademeUk] = useState(null);
	const [history, setHistory] = useState([]);

	// State değiştikçe otomatik hesaplama (Aynı kalır)
	useEffect(() => {
		hesapla();
	}, [
		nomCikilanGerilim,
		guc,
		nomCikilanAkim,
		nomKademeGerilim,
		ilkKademeCikilanGerilim,
		ilkKademeCikilanAkim,
		sonKademeCikilanGerilim,
		sonKademeCikilanAkim,
		ilkKademeGerilim,
		sonKademeGerilim,
	]);

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
		// Güç her zaman gerekli
		if (!params.guc) {
			setError("Lütfen güç değerini girin.");
			return;
		}

		// Her kademe için ayrı kontrol
		const ilkKademeActive =
			ilkKademeGerilim && ilkKademeGerilim.trim() !== "";
		const nomKademeActive =
			nomKademeGerilim && nomKademeGerilim.trim() !== "";
		const sonKademeActive =
			sonKademeGerilim && sonKademeGerilim.trim() !== "";

		// En az bir kademe dolu olmalı
		if (!ilkKademeActive && !nomKademeActive && !sonKademeActive) {
			setError("Lütfen en az bir kademe gerilimi girin.");
			return;
		}

		// İlk kademe kontrolü
		if (ilkKademeActive) {
			if (
				!params.ilkKademeGerilim ||
				!params.ilkKademeCikilanGerilim ||
				!params.ilkKademeCikilanAkim
			) {
				setError(
					"İlk kademe için tüm alanları doldurun (Çıkılan Gerilim, Çıkılan Akım).",
				);
				return;
			}
		}

		// Nom kademe kontrolü
		if (nomKademeActive) {
			if (
				!params.nomKademeGerilim ||
				!params.nomCikilanGerilim ||
				!params.nomCikilanAkim
			) {
				setError(
					"Nom kademe için tüm alanları doldurun (Çıkılan Gerilim, Çıkılan Akım).",
				);
				return;
			}
		}

		// Son kademe kontrolü
		if (sonKademeActive) {
			if (
				!params.sonKademeGerilim ||
				!params.sonKademeCikilanGerilim ||
				!params.sonKademeCikilanAkim
			) {
				setError(
					"Son kademe için tüm alanları doldurun (Çıkılan Gerilim, Çıkılan Akım).",
				);
				return;
			}
		}

		setError("");
		const now = new Date();
		const newEntry = {
			id: Date.now().toString(), // FlatList için string id daha iyidir
			timestamp: now.toLocaleString("tr-TR"),
			timestampMs: now.getTime(),
			guc: params.guc,
			ilkKademeCikilanGerilim: params.ilkKademeCikilanGerilim,
			ilkKademeCikilanAkim: params.ilkKademeCikilanAkim,
			sonKademeCikilanGerilim: params.sonKademeCikilanGerilim,
			sonKademeCikilanAkim: params.sonKademeCikilanAkim,
			ilkKademeGerilim: params.ilkKademeGerilim,
			sonKademeGerilim: params.sonKademeGerilim,
			nomCikilanGerilim: params.nomCikilanGerilim,
			nomCikilanAkim: params.nomCikilanAkim,
			nomKademeGerilim: params.nomKademeGerilim,
			resultIlkKademeUk: resultIlkKademeUk,
			resultNomKademeUk: resultNomKademeUk,
			resultSonKademeUk: resultSonKademeUk,
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
			showToast &&
				showToast("Geçmiş Kaydedilirken Hata!", "bottom", "error");
		}
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
		// Parse state values - use different variable names to avoid shadowing
		const gucVal = parseNum(guc);
		const ilkKademeCikilanGerilimVal = parseNum(ilkKademeCikilanGerilim);
		const ilkKademeCikilanAkimVal = parseNum(ilkKademeCikilanAkim);
		const sonKademeCikilanGerilimVal = parseNum(sonKademeCikilanGerilim);
		const sonKademeCikilanAkimVal = parseNum(sonKademeCikilanAkim);
		const ilkKademeGerilimVal = parseNum(ilkKademeGerilim);
		const sonKademeGerilimVal = parseNum(sonKademeGerilim);
		const nomCikilanGerilimVal = parseNum(nomCikilanGerilim);
		const nomCikilanAkimVal = parseNum(nomCikilanAkim);
		const nomKademeGerilimVal = parseNum(nomKademeGerilim);

		// Calculate derived values - these are already numbers, no need for parseNum
		const ilkKademeAkimVal = gucVal / ilkKademeGerilimVal / SQRT3;
		const sonKademeAkimVal = gucVal / sonKademeGerilimVal / SQRT3;
		const nomKademeAkimVal = gucVal / nomKademeGerilimVal / SQRT3;

		console.log("Değerler:", {
			ilkKademeAkimVal,
			sonKademeAkimVal,
			nomKademeAkimVal,
		});

		// Güç her zaman gerekli
		if (!isFinite(gucVal) || gucVal <= 0) {
			setError(
				guc
					? "Lütfen geçerli bir güç değeri girin."
					: "Lütfen güç değerini girin.",
			);
			setResultNomKademeUk(null);
			setResultIlkKademeUk(null);
			setResultSonKademeUk(null);
			return;
		}

		// Her kademe için ayrı validasyon
		const ilkKademeActive =
			ilkKademeGerilim && ilkKademeGerilim.trim() !== "";
		const nomKademeActive =
			nomKademeGerilim && nomKademeGerilim.trim() !== "";
		const sonKademeActive =
			sonKademeGerilim && sonKademeGerilim.trim() !== "";

		// En az bir kademe dolu olmalı
		if (!ilkKademeActive && !nomKademeActive && !sonKademeActive) {
			setError("Lütfen en az bir kademe gerilimi girin.");
			setResultNomKademeUk(null);
			setResultIlkKademeUk(null);
			setResultSonKademeUk(null);
			return;
		}

		// Validasyon hatası mesajları
		const errorMessages = [];

		// İlk kademe validasyonu
		if (ilkKademeActive) {
			const ilkKademeValid = [
				ilkKademeGerilimVal,
				ilkKademeCikilanGerilimVal,
				ilkKademeCikilanAkimVal,
			].every((n) => isFinite(n) && n > 0);

			if (!ilkKademeValid) {
				errorMessages.push(
					"İlk kademe için tüm alanları doldurun (Çıkılan Gerilim, Çıkılan Akım).",
				);
				setResultIlkKademeUk(null);
			}
		} else {
			setResultIlkKademeUk(null);
		}

		// Nom kademe validasyonu
		if (nomKademeActive) {
			const nomKademeValid = [
				nomKademeGerilimVal,
				nomCikilanGerilimVal,
				nomCikilanAkimVal,
			].every((n) => isFinite(n) && n > 0);

			if (!nomKademeValid) {
				errorMessages.push(
					"Nom kademe için tüm alanları doldurun (Çıkılan Gerilim, Çıkılan Akım).",
				);
				setResultNomKademeUk(null);
			}
		} else {
			setResultNomKademeUk(null);
		}

		// Son kademe validasyonu
		if (sonKademeActive) {
			const sonKademeValid = [
				sonKademeGerilimVal,
				sonKademeCikilanGerilimVal,
				sonKademeCikilanAkimVal,
			].every((n) => isFinite(n) && n > 0);

			if (!sonKademeValid) {
				errorMessages.push(
					"Son kademe için tüm alanları doldurun (Çıkılan Gerilim, Çıkılan Akım).",
				);
				setResultSonKademeUk(null);
			}
		} else {
			setResultSonKademeUk(null);
		}

		// Eğer herhangi bir validasyon hatası varsa, işlemi durdur
		if (errorMessages.length > 0) {
			setError(errorMessages.join(" "));
			return;
		}

		setError("");

		// İlk Kademe UK - sadece ilk kademe aktifse hesapla
		if (ilkKademeActive) {
			const ilkKademeCgScaled = kv
				? ilkKademeCikilanGerilimVal * SQRT3 * 1000
				: ilkKademeCikilanGerilimVal * SQRT3;
			console.log("ilkKademeCgScaled: ", ilkKademeCgScaled);
			const ilkKademeOlcek = ilkKademeCgScaled * 100;
			console.log("ilkKademeOlcek: ", ilkKademeOlcek);
			const ilkKademeKgScaled = kv
				? ilkKademeGerilimVal * 1000
				: ilkKademeGerilimVal;
			console.log("ilkKademeKgScaled: ", ilkKademeKgScaled);
			const ilkKademeUk =
				(ilkKademeOlcek * ilkKademeAkimVal) /
				(ilkKademeKgScaled * ilkKademeCikilanAkimVal);

			const formattedResultIlkKademeUk = formatPct(ilkKademeUk);
			console.log("ilkKademeUk: ", formattedResultIlkKademeUk);
			setResultIlkKademeUk(formattedResultIlkKademeUk);
		}

		// Nom Kademe UK - sadece nom kademe aktifse hesapla
		if (nomKademeActive) {
			const cgScaled = kv
				? nomCikilanGerilimVal * SQRT3 * 1000
				: nomCikilanGerilimVal * SQRT3;
			console.log("cgScaled: ", cgScaled);
			const olcek = cgScaled * 100;
			console.log("olcek: ", olcek);
			const kgScaled = kv
				? nomKademeGerilimVal * 1000
				: nomKademeGerilimVal;
			console.log("kgScaled: ", kgScaled);
			const uk =
				(olcek * nomKademeAkimVal) / (kgScaled * nomCikilanAkimVal);
			console.log("uk: ", uk);
			const formattedResult = formatPct(uk);
			setResultNomKademeUk(formattedResult);
		}

		// Son Kademe UK - sadece son kademe aktifse hesapla
		if (sonKademeActive) {
			const sonKademeCgScaled = kv
				? sonKademeCikilanGerilimVal * SQRT3 * 1000
				: sonKademeCikilanGerilimVal * SQRT3;
			console.log("sonKademeCgScaled: ", sonKademeCgScaled);
			const sonKademeOlcek = sonKademeCgScaled * 100;
			console.log("sonKademeOlcek: ", sonKademeOlcek);
			const sonKademeKgScaled = kv
				? sonKademeGerilimVal * 1000
				: sonKademeGerilimVal;
			console.log("sonKademeKgScaled: ", sonKademeKgScaled);
			const sonKademeUk =
				(sonKademeOlcek * sonKademeAkimVal) /
				(sonKademeKgScaled * sonKademeCikilanAkimVal);

			const formattedResultSonKademeUk = formatPct(sonKademeUk);
			console.log("sonKademeUk: ", formattedResultSonKademeUk);
			setResultSonKademeUk(formattedResultSonKademeUk);
		}

		setParams({
			guc: gucVal,
			nomCikilanGerilim: nomCikilanGerilimVal,
			nomCikilanAkim: nomCikilanAkimVal,
			nomKademeGerilim: nomKademeGerilimVal,
			ilkKademeCikilanGerilim: ilkKademeCikilanGerilimVal,
			ilkKademeCikilanAkim: ilkKademeCikilanAkimVal,
			sonKademeCikilanGerilim: sonKademeCikilanGerilimVal,
			sonKademeCikilanAkim: sonKademeCikilanAkimVal,
			ilkKademeGerilim: ilkKademeGerilimVal,
			ilkKademeAkim: ilkKademeAkimVal,
			sonKademeGerilim: sonKademeGerilimVal,
			sonKademeAkim: sonKademeAkimVal,
		});
	}

	function temizle() {
		setNomCikilanGerilim("");
		setNomCikilanAkim("");
		setNomKademeGerilim("");
		setGuc("");
		setIlkKademeCikilanGerilim("");
		setIlkKademeCikilanAkim("");
		setSonKademeCikilanGerilim("");
		setSonKademeCikilanAkim("");
		setIlkKademeGerilim("");
		setSonKademeGerilim("");
		setError("");
		setResultNomKademeUk(null);
		setResultIlkKademeUk(null);
		setResultSonKademeUk(null);
		setParams({
			guc: "",
			nomCikilanGerilim: "",
			nomCikilanAkim: "",
			nomKademeGerilim: "",
			ilkKademeCikilanGerilim: "",
			ilkKademeCikilanAkim: "",
			sonKademeCikilanGerilim: "",
			sonKademeCikilanAkim: "",
			ilkKademeGerilim: "",
			sonKademeGerilim: "",
			nomCikilanGerilim: "",
			nomCikilanAkim: "",
			nomKademeGerilim: "",
		});
		setHistory([]);
		showToast && showToast("Temizlendi!", "bottom", "info");
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
		<ScrollView
			contentContainerStyle={{
				paddingHorizontal: 4,
				marginTop: 2,
			}}
			keyboardShouldPersistTaps="handled"
			className="h-full bg-card">
			<View>
				{/* Hesaplama Kartı */}
				<View style={styles.card}>
					<View style={styles.grid}>
						<InputGroup
							label="Güç"
							unit="kW"
							value={guc}
							onChangeText={setGuc}
							placeholder="ör. 100"
						/>
						<InputGroup
							label="İlk Kademe Gerilim"
							unit="kV"
							value={ilkKademeGerilim}
							onChangeText={setIlkKademeGerilim}
							placeholder="ör. 0,4"
						/>
						<InputGroup
							label="Nom.Kademe Gerilim"
							unit="kV"
							value={nomKademeGerilim}
							onChangeText={setNomKademeGerilim}
							placeholder="ör. 0,4"
						/>
						<InputGroup
							label="Son Kademe Gerilim"
							unit="kV"
							value={sonKademeGerilim}
							onChangeText={setSonKademeGerilim}
							placeholder="ör. 0,4"
						/>
					</View>

					<View style={styles.grid}>
						<InputGroup
							label="İlk Kademe Çıkılan Gerilim"
							unit="kV"
							value={ilkKademeCikilanGerilim}
							onChangeText={setIlkKademeCikilanGerilim}
							placeholder="ör. 0,4"
						/>
						<InputGroup
							label="İlk Kademe Çıkılan Akım"
							unit="A"
							value={ilkKademeCikilanAkim}
							onChangeText={setIlkKademeCikilanAkim}
							placeholder="ör. 24"
						/>
					</View>

					<View style={styles.grid}>
						<InputGroup
							label="Nom.Kademe Çıkılan Gerilim"
							unit="kV"
							value={nomCikilanGerilim}
							onChangeText={setNomCikilanGerilim}
							placeholder="ör. 0,4"
						/>
						<InputGroup
							label="Nom.Kademe Çıkılan Akım"
							unit="A"
							value={nomCikilanAkim}
							onChangeText={setNomCikilanAkim}
							placeholder="ör. 24"
						/>
					</View>

					<View style={styles.grid}>
						<InputGroup
							label="Son Kademe Çıkılan Gerilim"
							unit="kV"
							value={sonKademeCikilanGerilim}
							onChangeText={setSonKademeCikilanGerilim}
							placeholder="ör. 0,4"
						/>
						<InputGroup
							label="Son Kademe Çıkılan Akım"
							unit="A"
							value={sonKademeCikilanAkim}
							onChangeText={setSonKademeCikilanAkim}
							placeholder="ör. 24"
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

					{error && <Text style={styles.errorText}>{error}</Text>}

					{resultIlkKademeUk && (
						<View style={styles.resultContainer}>
							<View>
								<Text style={styles.resultLabel}>
									İlk Kademe Uk Değeri
								</Text>
								<Text style={styles.resultHint}>
									Kısa devre gerilimi (%)
								</Text>
							</View>
							<Text style={styles.resultValue}>
								{resultIlkKademeUk}
							</Text>
						</View>
					)}
					{resultNomKademeUk && (
						<View style={styles.resultContainer}>
							<View>
								<Text style={styles.resultLabel}>
									Nom.Kademe Uk Değeri
								</Text>
								<Text style={styles.resultHint}>
									Kısa devre gerilimi (%)
								</Text>
							</View>
							<Text style={styles.resultValue}>
								{resultNomKademeUk}
							</Text>
						</View>
					)}
					{resultSonKademeUk && (
						<View style={styles.resultContainer}>
							<View>
								<Text style={styles.resultLabel}>
									Son Kademe Uk Değeri
								</Text>
								<Text style={styles.resultHint}>
									Kısa devre gerilimi (%)
								</Text>
							</View>
							<Text style={styles.resultValue}>
								{resultSonKademeUk}
							</Text>
						</View>
					)}
				</View>
			</View>
		</ScrollView>
	);
}

// Tekrarlanan Input yapısını bir bileşene dönüştürmek kodu temizler
const InputGroup = ({ label, unit, value, onChangeText, placeholder }) => (
	<View style={styles.inputGroup}>
		<Text numberOfLines={2} style={styles.label}>
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
	container: { padding: 4 },
	card: {
		backgroundColor: "#1E1E1E",
		borderRadius: 12,
		paddingVertical: 4,
		paddingHorizontal: 8,
		// marginBottom: 10,
		// marginHorizontal: 8,
		elevation: 3,
		shadowColor: "#000",
		shadowOpacity: 0.5,
		shadowRadius: 5,
	},
	cardTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	inputGroup: {
		flex: 1,
		minWidth: "22%",
		marginBottom: 8,
	},
	label: {
		color: "#DDD",
		marginBottom: 6,
		fontSize: 12,
		height: 32,
		lineHeight: 16,
	},
	unit: { color: "#888", fontSize: 12 },
	input: {
		backgroundColor: "#333",
		color: "#FFF",
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 8,
		fontSize: 14,
		height: 40,
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
