import Input from "@components/input";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SıfırBileşenHesabı({ showToast }) {
	const [guc, setGuc] = useState("");
	const [yildizGerilimi, setYildizGerilimi] = useState("");
	const [çıkılanAkım, setÇıkılanAkım] = useState("");
	const [çıkılanGerilim, setÇıkılanGerilim] = useState("");
	const [resultI0, setResultI0] = useState(null);
	const [resultz0, setResultz0] = useState(null);
	const [resultZ0, setResultZ0] = useState(null);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (guc && yildizGerilimi) {
			hesaplaI0();
		}
		if (çıkılanAkım && çıkılanGerilim) {
			hesaplaz0();
		}
		if (çıkılanAkım && çıkılanGerilim && guc && yildizGerilimi) {
			hesaplaZ0();
		}
	}, [guc, yildizGerilimi, çıkılanAkım, çıkılanGerilim]);

	function parseNum(v) {
		if (typeof v !== "string") return NaN;
		v = v.trim().replace(/\s+/g, "").replace(/\./g, "").replace(/,/g, ".");
		return Number(v);
	}

	const formatPct = (x) =>
		!isFinite(x)
			? "—"
			: x.toLocaleString("tr-TR", {
					minimumFractionDigits: 4,
					maximumFractionDigits: 4,
			  });

	function hesaplaI0() {
		const gucValue = parseNum(guc);
		const yildizGerilimiValue = parseNum(yildizGerilimi);

		const I0 = gucValue / yildizGerilimiValue / Math.sqrt(3) / 3;

		const formattedResult = formatPct(I0);
		setResultI0(formattedResult);
	}

	function hesaplaz0() {
		const çıkılanGerilimValue = parseNum(çıkılanGerilim);
		const çıkılanAkımValue = parseNum(çıkılanAkım);

		const z0 = (çıkılanGerilimValue * 3) / çıkılanAkımValue;

		const formattedResult = formatPct(z0);
		setResultz0(formattedResult);
	}

	function hesaplaZ0() {
		const gucValue = parseNum(guc);
		const yildizGerilimiValue = parseNum(yildizGerilimi);

		const Inominal = gucValue / yildizGerilimiValue / Math.sqrt(3);

		const Z0 =
			(parseNum(resultz0) * Inominal * 100) /
			((yildizGerilimiValue * 1000) / Math.sqrt(3));

		const formattedResult = formatPct(Z0);

		setResultZ0(formattedResult);
	}

	function temizle() {
		setGuc("");
		setYildizGerilimi("");
		setÇıkılanAkım("");
		setÇıkılanGerilim("");
		setError(false);
		setResultI0(null);
		setResultz0(null);
		setResultZ0(null);
		showToast && showToast("Temizlendi!", "bottom", "info");
	}

	return (
		<View>
			{/* Başlık ve Formül */}

			<View style={styles.header}>
				<Text style={styles.title}>Trafo Z0 (%) Hesaplayıcı</Text>
			</View>
			<View className="flex p-4 w-[400px] mx-auto elevation rounded-xl gap-2 bg-card border focus:border-borderFocus border-border ">
				<View className="flex-col justify-between gap-6">
					{/* Güç */}
					<View className="">
						<Text className="text-text">Güç (kVA)</Text>
						<Input
							value={guc}
							onChangeText={setGuc}
							placeholder="2500 kVA"
						/>
					</View>

					<View className="">
						{/* AG Gerilimi */}
						<Text className="text-text">
							Yıldız Noktası Gerilimi (kV)
						</Text>
						<Input
							value={yildizGerilimi}
							onChangeText={setYildizGerilimi}
							placeholder="0,4 V"
						/>
					</View>

					{/* Çıkılan Gerilim */}
					<View className="">
						<Text className="text-text">Çıkılan Gerilim (V)</Text>
						<Input
							value={çıkılanGerilim}
							onChangeText={setÇıkılanGerilim}
							placeholder="0,4 V"
						/>
					</View>

					{/* Çıkılan Akım */}
					<View className="">
						<Text className="text-text">Çıkılan Akım (A)</Text>
						<Input
							value={çıkılanAkım}
							onChangeText={setÇıkılanAkım}
							placeholder="10 A"
						/>
					</View>
				</View>

				<View style={styles.actions}>
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

				{resultI0 && (
					<View style={styles.resultContainer}>
						<View>
							<Text style={styles.resultLabel}>
								Çıkılacak Akım Değeri
							</Text>
							<Text style={styles.resultHint}>Akım (A)</Text>
						</View>
						<Text style={styles.resultValue}>{resultI0} A</Text>
					</View>
				)}
				{resultz0 && (
					<View style={styles.resultContainer}>
						<View>
							<Text style={styles.resultLabel}>z0 Değeri</Text>
							<Text style={styles.resultHint}>z0 (%)</Text>
						</View>
						<Text style={styles.resultValue}>{resultz0} %</Text>
					</View>
				)}
				{resultZ0 && (
					<View style={styles.resultContainer}>
						<View>
							<Text style={styles.resultLabel}>Z0 Değeri</Text>
							<Text style={styles.resultHint}>
								Ukya yakın Olmalı - Z0 (%)
							</Text>
						</View>
						<Text style={styles.resultValue}>{resultZ0} %</Text>
					</View>
				)}
			</View>
		</View>
	);
}
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
});
