import Input from "@/components/input";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function I0Hesap() {
	const [guc, setGuc] = useState("");
	const [agGerilimi, setAgGerilimi] = useState("");
	const [kademeAkimi, setKademeAkimi] = useState("");
	const [result, setResult] = useState(null);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (guc && agGerilimi && kademeAkimi) {
			hesapla();
		}
	}, [guc, agGerilimi, kademeAkimi]);

	function parseNum(v) {
		if (typeof v !== "string") return NaN;
		v = v.trim().replace(/\s+/g, "").replace(/\./g, "").replace(/,/g, ".");
		return Number(v);
	}

	const formatPct = (x) =>
		!isFinite(x)
			? "—"
			: x.toLocaleString("tr-TR", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				}) + " %";

	function hesapla() {
		const gucValue = parseNum(guc);
		const agGerilimiValue = parseNum(agGerilimi);
		const kademeAkimiValue = parseNum(kademeAkimi);

		const agAkimi = gucValue / (agGerilimiValue * Math.sqrt(3));
		const i0 = (kademeAkimiValue / agAkimi) * 100;

		const formattedResult = formatPct(i0);
		setResult(formattedResult);
	}

	const expression = `I_0(\\%) = \\frac{\\text{AG Akımı}}{\\frac{\\text{Güç}}{\\text{AG Gerilimi} \\times \\surd{3}}}\\times100`;

	return (
		<View>
			{/* Başlık ve Formül */}

			<View style={styles.header}>
				<Text style={styles.title}>Trafo I0 (%) Hesaplayıcı</Text>
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
						<Text className="text-text">AG Gerilimi (kV)</Text>
						<Input
							value={agGerilimi}
							onChangeText={setAgGerilimi}
							placeholder="0,4 kV"
						/>
					</View>

					{/* Boşta Çıkılan Akım */}
					<View className="">
						<Text className="text-text">
							Boşta Çıkılan Akım (A)
						</Text>
						<Input
							value={kademeAkimi}
							onChangeText={setKademeAkimi}
							placeholder="10 A"
						/>
					</View>
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
});
