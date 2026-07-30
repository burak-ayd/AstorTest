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
				paddingHorizontal: 12,
				paddingVertical: 12,
			}}
			keyboardShouldPersistTaps="handled"
			className="bg-background">
			{/* Modern Card Container */}
			<View className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
				{/* Compact Header Section */}
				{/* <View className="px-4 py-3 border-b border-border/50">
					<Text className="text-text text-lg font-bold">
						Uk Hesaplayıcı
					</Text>
					<Text className="text-textSecondary text-xs">
						Kısa devre gerilimi hesaplama
					</Text>
				</View> */}

				{/* Input Section */}
				<View className="p-4 gap-3">
					{/* Güç ve Kademe Gerilimleri - Horizontal */}
					<View className="gap-2">
						<View className="flex-row items-center gap-1.5">
							<View className="w-0.5 h-4 bg-primary rounded-full" />
							<Text className="text-text font-semibold text-sm">
								Güç ve Kademe Gerilimleri
							</Text>
						</View>
						<View style={styles.grid}>
							<InputGroup
								label="Güç"
								unit="kW"
								value={guc}
								onChangeText={setGuc}
								placeholder="100"
							/>
							<InputGroup
								label="İlk"
								unit="kV"
								value={ilkKademeGerilim}
								onChangeText={setIlkKademeGerilim}
								placeholder="0,4"
							/>
							<InputGroup
								label="Nom"
								unit="kV"
								value={nomKademeGerilim}
								onChangeText={setNomKademeGerilim}
								placeholder="0,4"
							/>
							<InputGroup
								label="Son"
								unit="kV"
								value={sonKademeGerilim}
								onChangeText={setSonKademeGerilim}
								placeholder="0,4"
							/>
						</View>
					</View>

					{/* İlk Kademe Çıkılan - Compact */}
					<View className="gap-2">
						<View className="flex-row items-center gap-1.5">
							<View className="w-0.5 h-4 bg-blue-500 rounded-full" />
							<Text className="text-text font-medium text-xs">
								İlk Kademe Çıkılan
							</Text>
						</View>
						<View style={styles.grid}>
							<InputGroup
								label="Gerilim"
								unit="kV"
								value={ilkKademeCikilanGerilim}
								onChangeText={setIlkKademeCikilanGerilim}
								placeholder="0,4"
							/>
							<InputGroup
								label="Akım"
								unit="A"
								value={ilkKademeCikilanAkim}
								onChangeText={setIlkKademeCikilanAkim}
								placeholder="24"
							/>
						</View>
					</View>

					{/* Nom Kademe Çıkılan - Compact */}
					<View className="gap-2">
						<View className="flex-row items-center gap-1.5">
							<View className="w-0.5 h-4 bg-purple-500 rounded-full" />
							<Text className="text-text font-medium text-xs">
								Nom.Kademe Çıkılan
							</Text>
						</View>
						<View style={styles.grid}>
							<InputGroup
								label="Gerilim"
								unit="kV"
								value={nomCikilanGerilim}
								onChangeText={setNomCikilanGerilim}
								placeholder="0,4"
							/>
							<InputGroup
								label="Akım"
								unit="A"
								value={nomCikilanAkim}
								onChangeText={setNomCikilanAkim}
								placeholder="24"
							/>
						</View>
					</View>

					{/* Son Kademe Çıkılan - Compact */}
					<View className="gap-2">
						<View className="flex-row items-center gap-1.5">
							<View className="w-0.5 h-4 bg-orange-500 rounded-full" />
							<Text className="text-text font-medium text-xs">
								Son Kademe Çıkılan
							</Text>
						</View>
						<View style={styles.grid}>
							<InputGroup
								label="Gerilim"
								unit="kV"
								value={sonKademeCikilanGerilim}
								onChangeText={setSonKademeCikilanGerilim}
								placeholder="0,4"
							/>
							<InputGroup
								label="Akım"
								unit="A"
								value={sonKademeCikilanAkim}
								onChangeText={setSonKademeCikilanAkim}
								placeholder="24"
							/>
						</View>
					</View>

					{/* Error Message - Compact */}
					{error && (
						<View className="bg-red-500/10 border border-red-500/30 rounded-lg p-2.5">
							<Text className="text-red-400 text-center text-xs font-medium">
								⚠️ {error}
							</Text>
						</View>
					)}

					{/* Result Cards - Compact */}
					{resultIlkKademeUk && (
						<View className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
							<View className="flex-row justify-between items-center">
								<View className="flex-1">
									<Text className="text-blue-400 text-sm font-bold">
										İlk Kademe Uk
									</Text>
								</View>
								<Text className="text-blue-400 text-2xl font-bold">
									{resultIlkKademeUk}
								</Text>
							</View>
						</View>
					)}

					{resultNomKademeUk && (
						<View className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
							<View className="flex-row justify-between items-center">
								<View className="flex-1">
									<Text className="text-purple-400 text-sm font-bold">
										Nom.Kademe Uk
									</Text>
								</View>
								<Text className="text-purple-400 text-2xl font-bold">
									{resultNomKademeUk}
								</Text>
							</View>
						</View>
					)}

					{resultSonKademeUk && (
						<View className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3">
							<View className="flex-row justify-between items-center">
								<View className="flex-1">
									<Text className="text-orange-400 text-sm font-bold">
										Son Kademe Uk
									</Text>
								</View>
								<Text className="text-orange-400 text-2xl font-bold">
									{resultSonKademeUk}
								</Text>
							</View>
						</View>
					)}

					{/* Action Buttons - Compact */}
					<View className="flex-row gap-2 mt-1">
						<TouchableOpacity
							onPress={gecmisKaydet}
							className="flex-1 bg-primary active:bg-primary/80 rounded-lg p-3 border border-primary/30"
							activeOpacity={0.7}>
							<Text className="text-white text-center font-semibold text-sm">
								Kaydet
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={temizle}
							className="flex-1 bg-textSecondary/20 active:bg-textSecondary/30 rounded-lg p-3 border border-border"
							activeOpacity={0.7}>
							<Text className="text-text text-center font-semibold text-sm">
								Temizle
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</ScrollView>
	);
}

// Tekrarlanan Input yapısını bir bileşene dönüştürmek kodu temizler
const InputGroup = ({ label, unit, value, onChangeText, placeholder }) => (
	<View style={styles.inputGroup}>
		<Text numberOfLines={1} style={styles.label}>
			{label} <Text style={styles.unit}>({unit})</Text>
		</Text>
		<TextInput
			style={styles.input}
			value={value}
			onChangeText={onChangeText}
			placeholder={placeholder}
			keyboardType="decimal-pad"
			placeholderTextColor="#666"
		/>
	</View>
);

// --- STİLLER (CSS yerine StyleSheet) ---
const styles = StyleSheet.create({
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
	},
	inputGroup: {
		flex: 1,
		minWidth: "22%",
		marginBottom: 2,
	},
	label: {
		color: "#DDD",
		marginBottom: 4,
		fontSize: 11,
		fontWeight: "500",
	},
	unit: {
		color: "#888",
		fontSize: 10,
		fontWeight: "400",
	},
	input: {
		backgroundColor: "#2A2A2A",
		color: "#FFF",
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 8,
		fontSize: 13,
		borderWidth: 1,
		borderColor: "#3A3A3A",
	},
});
