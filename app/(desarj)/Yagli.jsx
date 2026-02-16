import { useToast } from "@/context/ToastContext";
import Button from "@components/button";
import Input from "@components/input";
import { useEffect, useState } from "react";
import { FlatList, StatusBar, StyleSheet, Text, View } from "react-native";

// Kök 3 sabitini önceden hesaplayalım
const SQRT3 = Math.sqrt(3);

export default function Yagli() {
	const { showToast } = useToast();
	const [gerilim, setGerilim] = useState("");

	const [error, setError] = useState(false);
	const [result, setResult] = useState(null);

	// State değiştikçe otomatik hesaplama (Aynı kalır)
	useEffect(() => {
		if (gerilim) {
			hesapla();
		}
	}, [gerilim]);

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
					minimumFractionDigits: 1,
					maximumFractionDigits: 1,
				})} %`;
	const formatVoltAmp = (x, digit = 1) =>
		!isFinite(x)
			? "—"
			: x.toLocaleString("tr-TR", {
					minimumFractionDigits: digit,
					maximumFractionDigits: digit,
				});
	function hesapla() {
		const gerilimValue = parseNum(gerilim);

		setError(false);

		// Yükte Akımları
		const ZeroPointFour = (0.4 * gerilimValue) / SQRT3;
		const OnePointTwo = (1.2 * gerilimValue) / SQRT3;
		const OnePointFiftyEight = (1.58 * gerilimValue) / SQRT3;
		const TwoPointZero = (2.0 * gerilimValue) / SQRT3;

		setResult([
			{
				zeropointfour: formatVoltAmp(ZeroPointFour),
				onepointtwo: formatVoltAmp(OnePointTwo),
				onepointfiftyeight: formatVoltAmp(OnePointFiftyEight),
				twopointzero: formatVoltAmp(TwoPointZero),
			},
		]);
	}

	const renderItem = ({ item }) => {
		const fields = [
			{ label: "0.4", value: item.zeropointfour + " V" },
			{ label: "1.2", value: item.onepointtwo + " V" },
			{ label: "1.58", value: item.onepointfiftyeight + " V" },
			{ label: "2.0", value: item.twopointzero + " V" },
		];

		return (
			<View className="bg-card mb-1 p-2 rounded-lg elevation">
				<View className="flex-row flex-wrap">
					{fields.map((f, index) => (
						<View
							key={index}
							// style={styles.cell}
							className="w-full p-1 border border-border items-center justify-center">
							<Text className="font-bold text-green-300/90 text-sm">
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
		setGerilim("");
		setError(false);
		setResult(null);
		// setHistory([]);
		showToast && showToast("Temizlendi!", "bottom", "info");
	}

	return (
		<View className="flex-1 bg-[#222831]">
			<StatusBar barStyle="light-content" backgroundColor="#000" />
			<View className="m-4">
				{/* Başlık ve Formül */}
				{/* <View style={styles.header}>
				<Text style={styles.title}>Yeni Proje Hesaplama</Text>
			</View> */}

				{/* Hesaplama Kartı */}
				<View className="p-4 mx-auto w-full flex elevation rounded-xl bg-card border focus:border-borderFocus border-border">
					<View className="flex-row justify-between gap-6 mb-2">
						{/* Güç */}
						<View className="flex-1">
							<View className="flex-row flex gap-2 my-2 justify-center items-center mx-auto flex-wrap">
								<Button
									className="w-28 justify-center items-center"
									func={() => {
										setGerilim("33");
									}}
									text={"33 kV"}
								/>
								<Button
									className="w-28 justify-center items-center"
									func={() => {
										setGerilim("20");
									}}
									text={"20 kV"}
								/>
								<Button
									className="w-28 justify-center items-center"
									func={() => {
										setGerilim("15");
									}}
									text={"15 kV"}
								/>
							</View>
							<View className="flex-row flex gap-2 my-2 justify-center items-center mx-auto flex-wrap">
								<Button
									className="w-28 justify-center items-center"
									func={() => {
										setGerilim("400");
									}}
									text={"400 V"}
								/>
								<Button
									className="w-28 justify-center items-center"
									func={() => {
										setGerilim("420");
									}}
									text={"420 V"}
								/>
								<Button
									className="w-28 justify-center items-center"
									func={() => {
										setGerilim("416");
									}}
									text={"416 V"}
								/>
							</View>
							<Text className="text-text">Gerilim (kV)</Text>
							<Input
								value={gerilim}
								onChangeText={setGerilim}
								placeholder="2500 kV"
							/>
						</View>
					</View>

					{/* Butonlar */}
					<View className="flex-row flex gap-2 mt-2 flex-wrap">
						{/* <Button func={Hesapla} text={"Hesapla"} /> */}
						<Button
							func={Temizle}
							text={"Temizle"}
							secondary={true}
						/>
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
