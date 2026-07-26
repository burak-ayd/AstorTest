import Input from "@components/input";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function DirencHesabi({ showToast }) {
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

	function temizle() {
		setOlculenKayip("");
		setIstenenKayip("");
		setKademeAkimi("");
		setError(false);
		setResult(null);
		showToast && showToast("Temizlendi!", "bottom", "info");
	}

	return (
		<View className="flex-1 p-4">
			{/* Modern Card Container */}
			<View className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
				{/* Header with gradient accent */}
				{/* <View className="px-6 pt-6 pb-4 border-b border-border/50">
					<Text className="text-text text-2xl font-bold mb-1">
						Direnç Hesaplayıcı
					</Text>
					<Text className="text-textSecondary text-sm">
						Kabul direnci hesaplama aracı
					</Text>
				</View> */}

				{/* Input Section */}
				<View className="p-6 gap-5">
					{/* Ölçülen Kayıp */}
					<View className="gap-2">
						<View className="flex-row items-center gap-2">
							<View className="w-1 h-5 bg-primary rounded-full" />
							<Text className="text-text font-semibold text-base">
								Ölçülen Kayıp
							</Text>
						</View>
						<Input
							value={olculenKayip}
							onChangeText={setOlculenKayip}
							placeholder="Örn: 2000 W"
							className="bg-background"
						/>
					</View>

					{/* İstenen Kayıp */}
					<View className="gap-2">
						<View className="flex-row items-center gap-2">
							<View className="w-1 h-5 bg-primary rounded-full" />
							<Text className="text-text font-semibold text-base">
								İstenen Kayıp
							</Text>
						</View>
						<Input
							value={istenenKayip}
							onChangeText={setIstenenKayip}
							placeholder="Örn: 1500 W"
							className="bg-background"
						/>
					</View>

					{/* Çıkılacak Akım */}
					<View className="gap-2">
						<View className="flex-row items-center gap-2">
							<View className="w-1 h-5 bg-primary rounded-full" />
							<Text className="text-text font-semibold text-base">
								Çıkılacak Akım
							</Text>
						</View>
						<Input
							value={kademeAkimi}
							onChangeText={setKademeAkimi}
							placeholder="Örn: 10 A"
							className="bg-background"
						/>
					</View>

					{/* Error Message */}
					{error && (
						<View className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
							<Text className="text-red-400 text-center font-medium">
								⚠️ Lütfen tüm alanlara geçerli sayılar girin
							</Text>
						</View>
					)}

					{/* Result Card */}
					{result && (
						<View className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-5 mt-2">
							<View className="flex-row justify-between items-center mb-3">
								<View className="flex-1">
									<Text className="text-green-400 text-lg font-bold mb-1">
										Sonuç Hazır
									</Text>
									<Text className="text-textSecondary text-xs">
										Girilmesi gereken direnç değeri
									</Text>
								</View>
								<View className="bg-green-500/20 px-4 py-2 rounded-full">
									<Text className="text-green-300 text-xs font-semibold">
										✓ HESAPLANDI
									</Text>
								</View>
							</View>
							<View className="border-t border-green-500/20 pt-4">
								<Text className="text-green-400 text-4xl font-bold text-center tracking-wider">
									{result}
								</Text>
							</View>
						</View>
					)}

					{/* Action Button */}
					<TouchableOpacity
						onPress={temizle}
						className="bg-textSecondary/20 active:bg-textSecondary/30 rounded-xl p-4 mt-2 border border-border"
						activeOpacity={0.7}>
						<Text className="text-text text-center font-semibold text-base">
							🗑️ Temizle
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}
