import Button from "@components/button";
import Input from "@components/input";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

// Kök 3 sabitini önceden hesaplayalım
const SQRT3 = Math.sqrt(3);

export default function NewProject() {
	const [guc, setGuc] = useState("");
	const [ilkKademe, setIlkKademe] = useState("");
	const [nominalKademe, setNominalKademe] = useState("");
	const [sonKademe, setSonKademe] = useState("");
	const [agGerilimi, setAgGerilimi] = useState("");

	const [error, setError] = useState(false);
	const [result, setResult] = useState(null);

	// State değiştikçe otomatik hesaplama (Aynı kalır)
	useEffect(() => {
		if (guc || ilkKademe || nominalKademe || sonKademe || agGerilimi) {
			hesapla();
		}
	}, [guc, ilkKademe, nominalKademe, sonKademe, agGerilimi]);

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
	const formatVoltAmp = (x, digit = 2) =>
		!isFinite(x)
			? "—"
			: x.toLocaleString("tr-TR", {
					minimumFractionDigits: digit,
					maximumFractionDigits: digit,
			  });
	function hesapla() {
		const gucValue = parseNum(guc);
		const ilkKademeValue = parseNum(ilkKademe);
		const nominalKademeValue = parseNum(nominalKademe);
		const sonKademeValue = parseNum(sonKademe);
		const AgValue = parseNum(agGerilimi);

		// const valid = [
		// 	gucValue,
		// 	ilkKademeValue,
		// 	nominalKademeValue,
		// 	sonKademeValue,
		// 	AgValue,
		// ].every((n) => isFinite(n) && n > 0);
		// if (!valid) {
		// 	setError(
		// 		!!(guc || ilkKademe || nominalKademe || sonKademe || agGerilimi)
		// 	);
		// 	setResult(null);
		// 	return;
		// }

		setError(false);

		// Yükte Akımları

		const ilkKademeAkımı = gucValue / ilkKademeValue / SQRT3;
		const nominalKademeAkımı = gucValue / nominalKademeValue / SQRT3;
		const sonKademeAkımı = gucValue / sonKademeValue / SQRT3;

		// Boşta Gerilimleri

		const Umean_90 = (AgValue / SQRT3 / 1.11) * 0.9;
		const Umean_100 = (AgValue / SQRT3 / 1.11) * 1.0;
		const Umean_110 = (AgValue / SQRT3 / 1.11) * 1.1;
		const Urms = AgValue / SQRT3;

		setResult([
			{
				ilk: formatVoltAmp(ilkKademeAkımı),
				nom: formatVoltAmp(nominalKademeAkımı),
				son: formatVoltAmp(sonKademeAkımı),
				U90: formatVoltAmp(Umean_90),
				U100: formatVoltAmp(Umean_100),
				U110: formatVoltAmp(Umean_110),
				Urms: formatVoltAmp(Urms),
			},
		]);
		// const cgScaled = kv ? cg * SQRT3 * 1000 : cg * SQRT3;
		// const olcek = cgScaled * 100;
		// const kgScaled = kv ? kg * 1000 : kg;
		// const uk = (olcek * na) / (kgScaled * ca);
		// const formattedResult = formatPct(uk);
		// setResult(formattedResult);

		// setParams({
		// 	cg: `${formatVoltAmp(cg)} kV`,
		// 	na: na,
		// 	kg: `${formatVoltAmp(kg)} kV`,
		// 	ca: ca,
		// 	uk: formattedResult,
		// });
	}

	const renderItem = ({ item }) => {
		const fields = [
			{ label: "İlk Kademe", value: item.ilk + " A" },
			{ label: "Nominal Kademe", value: item.nom + " A" },
			{ label: "Son Kademe", value: item.son + " A" },
			{ label: "%90", value: item.U90 + " V" },
			{ label: "%100", value: item.U100 + " V" },
			{ label: "%110", value: item.U110 + " V" },
			{ label: "Urms", value: item.Urms + " V" },
		];

		return (
			<View className="bg-card mb-1 p-2 rounded-lg elevation">
				<View className="flex-row flex-wrap">
					{fields.map((f, index) => (
						<View
							key={index}
							// style={styles.cell}
							className="w-[33.333%] p-1 border border-border items-center justify-center">
							<Text className="font-bold text-text/85 text-sm">
								{f.label}
							</Text>

							<Text className="text-text text-sm">{f.value}</Text>
						</View>
					))}
				</View>
			</View>
		);
	};

	function Temizle() {
		setGuc("");
		setAgGerilimi("");
		setIlkKademe("");
		setSonKademe("");
		setNominalKademe("");
		setError(false);
		setResult(null);
		// setHistory([]);
	}

	return (
		<View className="mx-4">
			{/* Başlık ve Formül */}
			<View style={styles.header}>
				<Text style={styles.title}>Yeni Proje Hesaplama</Text>
			</View>

			{/* Hesaplama Kartı */}
			<View className="p-4 mx-auto w-full flex elevation rounded-xl bg-card border focus:border-borderFocus border-border">
				<View className="flex-row justify-between gap-6 mb-2">
					{/* Güç */}
					<View className="flex-1">
						<Text className="text-text">Güç (kVA)</Text>
						<Input
							value={guc}
							onChangeText={setGuc}
							placeholder="2500 kVA"
						/>
					</View>

					{/* AG Gerilimi */}
					<View className="flex-1">
						<Text className="text-text">AG Gerilimi (V)</Text>
						<Input
							value={agGerilimi}
							onChangeText={setAgGerilimi}
							placeholder="400 V"
						/>
					</View>
				</View>
				<View className="flex-row justify-between gap-6 mb-2">
					{/* İlk Kademe Gerilimi */}
					<View className="flex-1">
						<Text className="text-text">
							İlk Kademe Gerilimi (kV)
						</Text>
						<Input
							value={ilkKademe}
							onChangeText={setIlkKademe}
							placeholder="28,5 kV"
						/>
					</View>

					<View className="flex-1">
						{/* Nominal Kademe Gerilimi */}
						<Text className="text-text">
							Nominal Kademe Gerilimi (kV)
						</Text>
						<Input
							value={nominalKademe}
							onChangeText={setNominalKademe}
							placeholder="33 kV"
						/>
					</View>

					{/* Son Kademe Gerilimi */}
					<View className="flex-1">
						<Text className="text-text">
							Son Kademe Gerilimi (kV)
						</Text>
						<Input
							value={sonKademe}
							onChangeText={setSonKademe}
							placeholder="36 kV"
						/>
					</View>
				</View>

				{/* Butonlar */}
				<View className="flex-row flex gap-2 mt-2 flex-wrap">
					{/* <Button func={Hesapla} text={"Hesapla"} /> */}
					<Button func={Temizle} text={"Temizle"} secondary={true} />
					{/* <Button
                                                func={gecmisKaydet}
                                                text={"Kaydet"}
                                                secondary={true}
                                            /> */}
				</View>

				{error && (
					<Text style={styles.errorText}>
						Lütfen tüm alanlara geçerli sayılar girin.
					</Text>
				)}

				{result && (
					<View className="flex flex-col md:flex-row gap-4 justify-end mt-4">
						<FlatList
							contentContainerStyle={{ alignSelf: "stretch" }}
							data={result}
							renderItem={renderItem}
							keyExtractor={(item, index) => index.toString()}
						/>
					</View>
				)}
			</View>
		</View>
	);
}

// --- STİLLER (CSS yerine StyleSheet) ---
const styles = StyleSheet.create({
	header: { alignItems: "center", marginBottom: 20 },
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#FFF",
		marginBottom: 10,
	},
	errorText: {
		color: "#FF6B6B",
		marginTop: 15,
		textAlign: "center",
		fontWeight: "bold",
	},
	card2: {
		backgroundColor: "#fff",
		marginBottom: 4,
		padding: 10,
		borderRadius: 10,
		elevation: 3,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	cell: {
		width: "33.33%", // 3 sütun
		padding: 4,
		borderWidth: 0.5,
		borderColor: "#ccc",
		alignItems: "center",
		justifyContent: "center",
	},
	label: {
		fontWeight: "bold",
		fontSize: 12,
		color: "#0b1020",
	},
	value: {
		fontSize: 12,
		color: "#333",
	},
	contentContainer: {
		padding: 12,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
	},

	card: {
		paddingHorizontal: 12,
		// flex: 1,
		marginBottom: 0,
		// display: "flex",
		// flexDirection: "column",
		// gap: 1,
		// maxHeight: 420,
		// overflowY: "auto",
		// backgroundColor: "#fff",
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
		backgroundColor: "#ff4d4d",
		padding: 4,
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
