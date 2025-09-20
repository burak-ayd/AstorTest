import Input from "@components/input";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function DirencHesabi() {
	const [olculenKayip, setOlculenKayip] = useState("");
	const [istenenKayip, setIstenenKayip] = useState("");
	const [kademeAkimi, setKademeAkimi] = useState("");
	const [result, setResult] = useState(null);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (olculenKayip && istenenKayip && kademeAkimi) {
			hesapla();
		}
	}, [olculenKayip, istenenKayip, kademeAkimi]);

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
			  }) + " Ω";

	function hesapla() {
		const olculenKayipValue = parseNum(olculenKayip);
		const istenenKayipValue = parseNum(istenenKayip);
		const kademeAkimiValue = parseNum(kademeAkimi);

		const a = (olculenKayipValue - istenenKayipValue) / 3;

		const direncValue = a / kademeAkimiValue ** 2;

		const formattedResult = formatPct(direncValue);
		setResult(formattedResult);
	}

	return (
		<View>
			{/* Başlık ve Formül */}

			<View style={styles.header}>
				<Text style={styles.title}>Kabul Direnç Hesaplayıcı</Text>
			</View>
			<View className="flex p-4 w-[400px] mx-auto elevation rounded-xl gap-2 bg-card border focus:border-borderFocus border-border ">
				<View className="flex-col justify-between gap-6">
					{/* Güç */}
					<View className="">
						<Text className="text-text">Ölçülen Kayıp (W)</Text>
						<Input
							value={olculenKayip}
							onChangeText={setOlculenKayip}
							placeholder="2000 W"
						/>
					</View>

					<View className="">
						{/* AG Gerilimi */}
						<Text className="text-text">İstenen Kayıp (W)</Text>
						<Input
							value={istenenKayip}
							onChangeText={setIstenenKayip}
							placeholder="2000 W"
						/>
					</View>

					{/* Boşta Çıkılan Akım */}
					<View className="">
						<Text className="text-text">Çıkılacak Akım (A)</Text>
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
							<Text style={styles.resultLabel}>
								Girilmesi Gereken Direnç
							</Text>
							<Text style={styles.resultHint}>
								Direnç Değeri (Ω)
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
