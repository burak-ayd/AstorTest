import Button from "@components/button";
import Input from "@components/input";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
export default function TrafoKayip() {
	const [error, setError] = useState(false);
	const [errorPac, setErrorPAC] = useState(false);
	const [guc, setGuc] = useState("");
	const [kademeGerilimi, setKademeGerilimi] = useState("");
	const [agGerilimi, setAgGerilimi] = useState("");
	const [refTemp, setRefTemp] = useState("75");
	const [direncTemp, setDirencTemp] = useState("");
	const [yukteTemp, setYukteTemp] = useState("");
	const [sargiTipi, setSargiTipi] = useState("al");
	const [direncAB, setDirencAB] = useState("");
	const [direncBC, setDirencBC] = useState("");
	const [direncCA, setDirencCA] = useState("");
	const [direncab, setDirencab] = useState("");
	const [direncbc, setDirencbc] = useState("");
	const [direncca, setDirencca] = useState("");
	const [cikilanAkim, setCikilanAkim] = useState("");
	const [kayip, setKayip] = useState("");
	const [cikilanGerilim, setCikilanGerilim] = useState("");

	const [pdc, setPdc] = useState(null);
	const [pac, setPac] = useState(null);
	const [pdcCorrected, setPdcCorrected] = useState(null);
	const [pacCorrected, setPacCorrected] = useState(null);
	const [ptoplam, setPtoplam] = useState(null);
	const [pdc75, setPdc75] = useState(null);
	const [pac75, setPac75] = useState(null);
	const [pk75, setPk75] = useState(null);

	const [ukCorrected, setUkCorrected] = useState(null);
	const [ux, setUX] = useState(null);
	const [ur, setUr] = useState(null);
	const [uk, setUk] = useState(null);
	const [ur75, setUr75] = useState(null);
	const [ux75, setUx75] = useState(null);
	const [uk75, setUk75] = useState(null);

	const [history, setHistory] = useState([]);

	function parseNum(v) {
		if (typeof v !== "string") return NaN;
		v = v.trim().replace(/\s+/g, "").replace(/\./g, "").replace(/,/g, ".");
		return Number(v);
	}

	function Temizle() {
		setGuc("");
		setKademeGerilimi("");
		setAgGerilimi("");
		setRefTemp("75");
		setDirencTemp("");
		setYukteTemp("");
		setSargiTipi("al");
		setDirencAB("");
		setDirencBC("");
		setDirencCA("");
		setDirencab("");
		setDirencbc("");
		setDirencca("");
		setCikilanAkim("");
		setKayip("");
		setCikilanGerilim("");
		setError(false);
		setErrorPAC(false);
		setPdc(null);
		setPac(null);
		setPdcCorrected(null);
		setPacCorrected(null);
		setPtoplam(null);
		setPdc75(null);
		setPac75(null);
		setPk75(null);
		setUkCorrected(null);
		setUX(null);
		setUr(null);
		setUk(null);
		setUr75(null);
		setUx75(null);
		setUk75(null);
	}

	const Pdc = useCallback(() => {
		setErrorPAC(false);

		const gucValue = parseNum(guc);
		const kademeGerilimiValue = parseNum(kademeGerilimi);
		const agGerilimiValue = parseNum(agGerilimi);
		const direncTempValue = parseNum(direncTemp);
		const yukteTempValue = parseNum(yukteTemp);
		const cikilanAkimValue = parseNum(cikilanAkim);
		const direncABValue = parseNum(direncAB);
		const direncBCValue = parseNum(direncBC);
		const direncCAValue = parseNum(direncCA);
		const direncabValue = parseNum(direncab);
		const direncbcValue = parseNum(direncbc);
		const direnccaValue = parseNum(direncca);
		const sargiTipiValue = sargiTipi === "al" ? 225 : 235;
		const kayipValue = parseNum(kayip);

		const YGDirençOrt = (direncABValue + direncBCValue + direncCAValue) / 3;
		const AGDirençOrt = (direncabValue + direncbcValue + direnccaValue) / 3;

		const Rhv =
			YGDirençOrt *
			((yukteTempValue + sargiTipiValue) /
				(direncTempValue + sargiTipiValue));

		const Rlv =
			AGDirençOrt *
			((yukteTempValue + sargiTipiValue) /
				(direncTempValue + sargiTipiValue));

		const Iygnominal = gucValue / kademeGerilimiValue / Math.sqrt(3);
		const Iagnominal = gucValue / agGerilimiValue / Math.sqrt(3);

		const Iprim = cikilanAkimValue;
		const Isec = (cikilanAkimValue / Iygnominal) * Iagnominal;

		const PdcValue = 1.5 * (Rhv * Iprim ** 2 + (Rlv * Isec ** 2) / 1000);
		const PacValue = kayipValue - PdcValue;

		if (PacValue < 0) {
			setErrorPAC(true);
		}

		setPdc(PdcValue);
		setPac(PacValue);
	}, [
		guc,
		kademeGerilimi,
		agGerilimi,
		direncTemp,
		yukteTemp,
		cikilanAkim,
		direncAB,
		direncBC,
		direncCA,
		direncab,
		direncbc,
		direncca,
		sargiTipi,
		kayip,
	]);

	// 🔹 CorrectionToNominalCurrent
	const CorrectionToNominalCurrent = useCallback(() => {
		const gucValue = parseNum(guc);
		const kademeGerilimiValue = parseNum(kademeGerilimi);
		const cikilanAkimValue = parseNum(cikilanAkim);

		const Iygnominal = gucValue / kademeGerilimiValue / Math.sqrt(3);

		const Pdccorrected = pdc * (Iygnominal / cikilanAkimValue) ** 2;
		const Paccorrected = pac * (Iygnominal / cikilanAkimValue) ** 2;
		const Ptoplam = Pdccorrected + Paccorrected;

		setPdcCorrected(Pdccorrected);
		setPacCorrected(Paccorrected);
		setPtoplam(Ptoplam);
	}, [guc, kademeGerilimi, cikilanAkim, pdc, pac]);

	// 🔹 CorrectionToRefTemp
	const CorrectionToRefTemp = useCallback(() => {
		const refTempValue = parseNum(refTemp);
		const yukteTempValue = parseNum(yukteTemp);
		const sargiTipiValue = sargiTipi === "al" ? 225 : 235;

		const Pdc75 =
			pdcCorrected *
			((refTempValue + sargiTipiValue) /
				(yukteTempValue + sargiTipiValue));

		const Pac75 =
			pacCorrected *
			((yukteTempValue + sargiTipiValue) /
				(refTempValue + sargiTipiValue));

		const Pk75 = Pdc75 + Pac75;

		setPdc75(Pdc75);
		setPac75(Pac75);
		setPk75(Pk75);
	}, [refTemp, yukteTemp, sargiTipi, pdcCorrected, pacCorrected]);

	// 🔹 Uk
	const Uk = useCallback(() => {
		const cikilanGerilimValue = parseNum(cikilanGerilim);
		const gucValue = parseNum(guc);
		const kademeGerilimiValue = parseNum(kademeGerilimi);
		const cikilanAkimValue = parseNum(cikilanAkim);

		const Iygnominal = gucValue / kademeGerilimiValue / Math.sqrt(3);

		const Ukcorrected =
			cikilanGerilimValue *
			Math.sqrt(3) *
			(Iygnominal / cikilanAkimValue);

		const UkValue = Ukcorrected / (kademeGerilimiValue * 1000);
		const Ur = ptoplam / gucValue / 1000;
		const Ux = Math.sqrt(UkValue ** 2 - Ur ** 2);

		setUkCorrected(Ukcorrected);
		setUk(UkValue);
		setUr(Ur);
		setUX(Ux);

		const Ur75 = pk75 / gucValue / 1000;
		const Ux75 = Ux;
		const Uk75 = Math.sqrt(Ur75 ** 2 + Ux75 ** 2);

		setUr75(Ur75);
		setUx75(Ux75);
		setUk75(Uk75);
	}, [cikilanGerilim, guc, kademeGerilimi, cikilanAkim, ptoplam, pk75]);

	// 🔹 Hesapla
	const Hesapla = useCallback(() => {
		Pdc();
		CorrectionToNominalCurrent();
		CorrectionToRefTemp();
		Uk();
	}, [Pdc, CorrectionToNominalCurrent, CorrectionToRefTemp, Uk]);

	useEffect(() => {
		if (
			!guc ||
			!kademeGerilimi ||
			!agGerilimi ||
			!refTemp ||
			!direncTemp ||
			!yukteTemp ||
			!sargiTipi ||
			!direncAB ||
			!direncBC ||
			!direncCA ||
			!direncab ||
			!direncbc ||
			!direncca ||
			!cikilanAkim ||
			!kayip ||
			!cikilanGerilim
		) {
			setError(true);
			return;
		}
		setError(false);
		Hesapla();
	}, [
		guc,
		kademeGerilimi,
		agGerilimi,
		refTemp,
		direncTemp,
		yukteTemp,
		sargiTipi,
		direncAB,
		direncBC,
		direncCA,
		direncab,
		direncbc,
		direncca,
		cikilanAkim,
		kayip,
		cikilanGerilim,
		Hesapla,
	]);

	async function gecmisKaydet() {
		const gucValue = parseNum(guc);
		const kademeGerilimiValue = parseNum(kademeGerilimi);
		const agGerilimiValue = parseNum(agGerilimi);
		const direncTempValue = parseNum(direncTemp);
		const yukteTempValue = parseNum(yukteTemp);
		const direncABValue = parseNum(direncAB);
		const direncBCValue = parseNum(direncBC);
		const direncCAValue = parseNum(direncCA);
		const direncabValue = parseNum(direncab);
		const direncbcValue = parseNum(direncbc);
		const direnccaValue = parseNum(direncca);
		const sargiTipiValue = sargiTipi === "al" ? "Alüminyum" : "Bakır";
		const kayipValue = parseNum(kayip);
		const cikilanAkimValue = parseNum(cikilanAkim);
		const cikilanGerilimValue = parseNum(cikilanGerilim);
		const refTempValue = parseNum(refTemp);
		const ukValue = uk75 ? (uk75 * 100).toFixed(4) : 0.0;
		const pkValue = pk75 ? pk75.toFixed(1) : 0.0;
		const pacValue = pac ? pac.toFixed(2) : 0.0;

		const now = new Date();
		const newEntry = {
			id: Date.now().toString(), // FlatList için string id daha iyidir
			timestamp: now.toLocaleString("tr-TR"),
			timestampMs: now.getTime(),
			guc: gucValue,
			kademeGerilimi: kademeGerilimiValue,
			agGerilimi: agGerilimiValue,
			sargiTipi: sargiTipiValue,
			refTemp: refTempValue,
			direncTemp: direncTempValue,
			yukteTemp: yukteTempValue,
			direncAB: direncABValue,
			direncBC: direncBCValue,
			direncCA: direncCAValue,
			direncab: direncabValue,
			direncbc: direncbcValue,
			direncca: direnccaValue,
			kayip: kayipValue,
			cikilanAkim: cikilanAkimValue,
			cikilanGerilim: cikilanGerilimValue,
			uk: ukValue,
			pk: pkValue,
			pac: pacValue,
		};

		const newHistory = [newEntry, ...history];
		setHistory(newHistory);

		try {
			await AsyncStorage.setItem("TkHistory", JSON.stringify(newHistory));
		} catch (e) {
			console.error("Geçmiş kaydedilirken hata:", e);
		}
	}

	useEffect(() => {
		async function get() {
			const stored = await AsyncStorage.getItem("TkHistory");
			const parsed = stored ? JSON.parse(stored) : [];
			setHistory(parsed);
		}
		get();
	}, [history]);

	return (
		<ScrollView
			contentContainerStyle={{
				paddingHorizontal: 16,
				paddingTop: 8,
			}}
			keyboardShouldPersistTaps="handled"
			className="h-full bg-card">
			<Text className="text-xl font-bold text-center mb-2 text-text">
				Trafo Yükte Kayıp Hesaplayıcı
			</Text>

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

				<View className="flex-1">
					{/* Kademe Gerilimi */}
					<Text className="text-text">Kdm. Gerilimi (kV)</Text>
					<Input
						value={kademeGerilimi}
						onChangeText={setKademeGerilimi}
						placeholder="33 kV"
					/>
				</View>

				{/* AG Gerilimi */}
				<View className="flex-1">
					<Text className="text-text">AG Gerilimi (kV)</Text>
					<Input
						value={agGerilimi}
						onChangeText={setAgGerilimi}
						placeholder="0,4 kV"
					/>
				</View>
			</View>

			<View className="flex-row justify-between gap-6 mb-2">
				<View className="flex-1">
					{/* Sargı Tipi */}
					<Text className="text-text">Sargı Tipi</Text>
					<View className="border border-border rounded-xl p-[1px]">
						<Picker
							selectedValue={sargiTipi}
							onValueChange={setSargiTipi}
							style={{
								color: "#eaf0ff",
								placeholderTextColor: "#eaf0ff",
							}}>
							<Picker.Item label="Alüminyum" value="al" />
							<Picker.Item label="Bakır" value="cu" />
						</Picker>
					</View>
				</View>
				<View className="flex-1"></View>
			</View>

			<View className="flex-row justify-between gap-4 mb-2">
				<View className="flex-1 flex-col">
					<View className=" flex-col md:flex-row">
						<Text className="text-text">Referans Sıcaklık </Text>
						<Text className="text-text">(°C)</Text>
					</View>
					<Input
						id="refTemp"
						value={refTemp}
						onChangeText={setRefTemp}
						placeholder="75 °C"
					/>
				</View>
				<View className="flex-1 flex-col">
					<View className=" flex-col md:flex-row">
						<Text className="text-text">Direnç Ölçüm </Text>
						<Text className="text-text">Sıcaklığı (°C)</Text>
					</View>
					<Input
						id="dirençTemp"
						value={direncTemp}
						onChangeText={setDirencTemp}
						placeholder="25 °C"
					/>
				</View>
				<View className="flex-1 flex-col">
					<View className=" flex-col md:flex-row">
						<Text className="text-text">Yükte Ölçüm </Text>
						<Text className="text-text">Sıcaklığı (°C)</Text>
					</View>
					<Input
						id="yükteTemp"
						value={yukteTemp}
						onChangeText={setYukteTemp}
						placeholder="25 °C"
					/>
				</View>
			</View>

			<View className="flex justify-center mb-2 mx-auto">
				<View className="title">
					<Text className="text-text text-xl">YG Direnç</Text>
				</View>
			</View>
			<View className="flex-row justify-between gap-4 mb-2">
				<View className="flex-1 flex-col">
					<Text className="text-text">1U-1V (Ω)</Text>
					<Input
						id="dirençAB"
						value={direncAB}
						onChangeText={setDirencAB}
						placeholder="1,5 Ω"
					/>

					{/* <View className="hint">Yükte Ölçüm Sıcaklığı.</View> */}
				</View>
				<View className="flex-1 flex-col">
					<Text className="text-text">1V-1W (Ω)</Text>
					<Input
						id="dirençBC"
						value={direncBC}
						onChangeText={setDirencBC}
						placeholder="1,5 Ω"
					/>
					{/* <View className="hint">Yükte Ölçüm Sıcaklığı.</View> */}
				</View>
				<View className="flex-1 flex-col">
					<Text className="text-text">1W-1U (Ω)</Text>
					<Input
						id="dirençBC"
						value={direncCA}
						onChangeText={setDirencCA}
						placeholder="1,5 Ω"
					/>
					{/* <View className="hint">Yükte Ölçüm Sıcaklığı.</View> */}
				</View>
			</View>

			<View className="flex justify-center mb-2 mx-auto">
				<View className="title">
					<Text className="text-text text-xl">AG Direnç</Text>
				</View>
			</View>
			<View className="flex-row justify-between gap-4 mb-2">
				<View className="flex-1 flex-col">
					<Text className="text-text">2u-2v (mΩ)</Text>
					<Input
						id="dirençab"
						value={direncab}
						onChangeText={setDirencab}
						placeholder="1,5 mΩ"
					/>
					{/* <View className="hint">Yükte Ölçüm Sıcaklığı.</View> */}
				</View>
				<View className="flex-1 flex-col">
					<Text className="text-text">2v-2w (mΩ)</Text>
					<Input
						id="dirençbc"
						value={direncbc}
						onChangeText={setDirencbc}
						placeholder="1,5 mΩ"
					/>
					{/* <View className="hint">Yükte Ölçüm Sıcaklığı.</View> */}
				</View>
				<View className="flex-1 flex-col">
					<Text className="text-text">2w-2u (mΩ)</Text>
					<Input
						id="dirençca"
						value={direncca}
						onChangeText={setDirencca}
						placeholder="1,5 mΩ"
					/>
					{/* <View className="hint">Yükte Ölçüm Sıcaklığı.</View> */}
				</View>
			</View>

			<View className="flex justify-center mb-2 mx-auto">
				<View className="title">
					<Text className="text-text text-xl">Ölçüm Değerleri</Text>
				</View>
			</View>
			<View className="flex-row justify-between gap-4 mb-2">
				<View className="flex-1 flex-col">
					<Text className="text-text">Çıkılan Akım (A)</Text>
					<Input
						id="cikilanAkim"
						value={cikilanAkim}
						onChangeText={setCikilanAkim}
						placeholder="115 A"
					/>
					{/* <View className="hint">Yükte Ölçüm Sıcaklığı.</View> */}
				</View>
				<View className="flex-1 flex-col">
					<Text className="text-text">Ölçülen Kayıp (W)</Text>
					<Input
						id="kayip"
						value={kayip}
						onChangeText={setKayip}
						placeholder="2000 W"
					/>
					{/* <View className="hint">Yükte Ölçüm Sıcaklığı.</View> */}
				</View>
				<View className="flex-1 flex-col">
					<Text className="text-text">Ölçülen Gerilim (V)</Text>
					<Input
						id="cikilanGerilim"
						value={cikilanGerilim}
						onChangeText={setCikilanGerilim}
						placeholder="850 V"
					/>
					{/* <View className="hint">Yükte Ölçüm Sıcaklığı.</View> */}
				</View>
			</View>

			{/* Butonlar */}
			<View className="flex-row flex flex-1 gap-2 mt-2 flex-wrap">
				<Button func={Hesapla} text={"Hesapla"} />
				<Button func={Temizle} text={"Temizle"} secondary={true} />
				<Button func={gecmisKaydet} text={"Kaydet"} secondary={true} />
			</View>

			{/* Hata */}
			{error && (
				<Text
					className="block mt-5  p-3 border border-solid border-[#ff6b6b73] 
						bg-[#ff6b6b1f] rounded-xl color-[#ffd5d5] font-semibold">
					Lütfen tüm alanlara geçerli sayılar girin.
				</Text>
			)}

			{errorPac && (
				<View
					className="flex flex-row gap-4 justify-between mt-5 p-3 border border-solid border-[#ff6b6b73] 
						bg-[#d420204f] rounded-xl color-[#ffd5d5] font-semibold">
					<Text className="text-text text-xl font-extrabold">
						Pac Negatif
					</Text>
					<Text className="text-text text-xl font-extrabold">
						Pac= {pac ? pac.toFixed(2) : 0.0} W
					</Text>
				</View>
			)}

			{/* Sonuç */}
			{pk75 ? (
				<View className="flex flex-col md:flex-row gap-4 justify-end mt-4">
					<View
						className="flex-1 flex flex-row items-start justify-center gap-4
							p-4  border border-solid border-[#7bd38959] 
							bg-[#7bd3891f] rounded-xl">
						<View className="flex-1">
							<Text className="text-text text-3xl font-extrabold">
								Uk (%):{" "}
							</Text>
							<Text className="text-sm mt-1 color-[#9fb1d1]">
								Kısa devre gerilimi (%)
							</Text>
						</View>
						<Text className="text-text text-3xl font-extrabold">
							{uk75 ? (uk75 * 100).toFixed(4) : 0.0}
						</Text>
					</View>
					<View //result
						className="flex-1 flex flex-row items-start justify-center gap-4
							p-4 border border-solid border-[#7bd38959] 
							bg-[#7bd3891f] rounded-xl">
						<View className="flex-1">
							<Text className="text-text text-3xl font-extrabold">
								Hesaplanan Pk (W):{" "}
							</Text>
							<Text className="text-sm mt-1 color-[#9fb1d1]">
								Toplam İcralı Kayıp (W)
							</Text>
						</View>
						<Text className="text-text text-3xl font-extrabold">
							{pk75 ? pk75.toFixed(1) : 0.0}
						</Text>
					</View>
				</View>
			) : (
				<View></View>
			)}
		</ScrollView>
	);
}
