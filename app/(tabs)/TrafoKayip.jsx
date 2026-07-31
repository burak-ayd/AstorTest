import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

// ─────────────────────────────────────────────────────────────────────────────
// Industrial Precision — MD3 tokens (mirrors DESING.md)
// ─────────────────────────────────────────────────────────────────────────────
const colors = {
	background: "#111316",
	surface: "#111316",
	surfaceContainerLow: "#1a1c1f",
	surfaceContainer: "#1e2023",
	surfaceContainerHigh: "#282a2d",
	surfaceContainerHighest: "#333538",
	surfaceBright: "#37393d",
	onSurface: "#e2e2e6",
	onSurfaceVariant: "#b9caca",
	outline: "#849495",
	outlineVariant: "#3a494a",

	primary: "#e9feff",
	onPrimary: "#003739",
	primaryContainer: "#00f5ff",
	onPrimaryContainer: "#006c71",
	primaryFixedDim: "#00dce5",
	primaryFixed: "#63f7ff",

	secondary: "#ffdb9d",
	onSecondary: "#412d00",
	secondaryContainer: "#feb700",
	secondaryFixedDim: "#ffba20",
	secondaryFixed: "#ffdea8",

	tertiary: "#fef8ff",
	tertiaryContainer: "#e5d7ff",
	tertiaryFixedDim: "#d0bcff",

	error: "#ffb4ab",
	errorContainer: "#93000a",
	onErrorContainer: "#ffdad6",
};

const spacing = {
	base: 4,
	xs: 8,
	sm: 12,
	md: 16,
	lg: 24,
	xl: 32,
	marginMobile: 16,
};

// ─────────────────────────────────────────────────────────────────────────────
// Section accent configurations
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_GUC = {
	icon: "bolt",
	accent: colors.primaryFixedDim,
	title: "Güç Bilgileri",
};
const SECTION_SARGI = {
	icon: "thermostat",
	accent: colors.secondaryFixedDim,
	title: "Sargı & Sıcaklık",
};
const SECTION_DIRENC = {
	icon: "electrical-services",
	accent: colors.tertiaryFixedDim,
	title: "Direnç Ölçümleri",
};
const SECTION_OLCUM = {
	icon: "speed",
	accent: colors.primaryFixedDim,
	title: "Ölçüm Değerleri",
};
const SECTION_BUTTON = {
	// icon: "speed",
	// accent: colors.primaryFixedDim,
	// title: "Ölçüm Değerleri",
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function TrafoKayip({ showToast }) {
	// ---- Inputs ----
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

	// ---- Validation / warnings ----
	const [error, setError] = useState(false);
	const [errorPac, setErrorPAC] = useState(false);
	const [ygDirençUyarısı, setYGDirençUyarısı] = useState("");
	const [agDirençUyarısı, setAGDirençUyarısı] = useState("");
	const [ygDirençOran, setYGDirençOran] = useState(0);
	const [agDirençOran, setAGDirençOran] = useState(0);

	// ---- Results ----
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

	// ─────────────────────────────────────────────────────────────────────────
	// Helpers (logic preserved 1:1 from previous version)
	// ─────────────────────────────────────────────────────────────────────────
	function parseNum(v) {
		if (typeof v !== "string") return NaN;
		v = v.trim().replace(/\s+/g, "").replace(/\./g, "").replace(/,/, ".");
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
		showToast && showToast("Temizlendi!", "bottom", "info");
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

		const effDirencTempValue = Number.isNaN(direncTempValue)
			? yukteTempValue
			: direncTempValue;

		const ygValues = [
			{ raw: direncAB, value: direncABValue },
			{ raw: direncBC, value: direncBCValue },
			{ raw: direncCA, value: direncCAValue },
		]
			.filter(({ raw }) =>
				typeof raw === "string" ? raw.trim().length > 0 : Boolean(raw),
			)
			.map(({ value }) => value)
			.filter((value) => Number.isFinite(value));
		const agValues = [
			{ raw: direncab, value: direncabValue },
			{ raw: direncbc, value: direncbcValue },
			{ raw: direncca, value: direnccaValue },
		]
			.filter(({ raw }) =>
				typeof raw === "string" ? raw.trim().length > 0 : Boolean(raw),
			)
			.map(({ value }) => value)
			.filter((value) => Number.isFinite(value));

		const YGDirençOrt = ygValues.length
			? ygValues.reduce((sum, value) => sum + value, 0) / ygValues.length
			: NaN;
		const AGDirençOrt = agValues.length
			? agValues.reduce((sum, value) => sum + value, 0) / agValues.length
			: NaN;

		if (ygValues.length >= 2) {
			const max = Math.max(...ygValues);
			const min = Math.min(...ygValues);
			const ratioPercent = min > 0 ? (max / min - 1) * 100 : 0;
			setYGDirençOran(ratioPercent);
			if (ratioPercent > 5) {
				setYGDirençUyarısı(
					`YG direnç değeri: %${ratioPercent}. %5 farkı aşmaktadır. Ölçüm dengesiz olabilir.`,
				);
			} else {
				setYGDirençUyarısı("");
			}
		} else {
			setYGDirençOran(0);
			setYGDirençUyarısı("");
		}

		if (agValues.length >= 2) {
			const max1 = Math.max(...agValues);
			const min1 = Math.min(...agValues);
			const ratioPercent1 = min1 > 0 ? (max1 / min1 - 1) * 100 : 0;
			setAGDirençOran(ratioPercent1);
			if (ratioPercent1 > 5) {
				setAGDirençUyarısı(
					`AG direnç değeri: %${ratioPercent1}. %5 farkı aşmaktadır. Ölçüm dengesiz olabilir.`,
				);
			} else {
				setAGDirençUyarısı("");
			}
		} else {
			setAGDirençOran(0);
			setAGDirençUyarısı("");
		}

		const Rhv = Number.isNaN(YGDirençOrt)
			? 0
			: YGDirençOrt *
				((yukteTempValue + sargiTipiValue) /
					(effDirencTempValue + sargiTipiValue));

		const Rlv = Number.isNaN(AGDirençOrt)
			? 0
			: AGDirençOrt *
				((yukteTempValue + sargiTipiValue) /
					(effDirencTempValue + sargiTipiValue));

		const Iygnominal = gucValue / kademeGerilimiValue / Math.sqrt(3);
		const Iagnominal = gucValue / agGerilimiValue / Math.sqrt(3);

		const Iprim = cikilanAkimValue;
		const Isec = (cikilanAkimValue / Iygnominal) * Iagnominal;

		const PdcValue = 1.5 * (Rhv * Iprim ** 2 + (Rlv * Isec ** 2) / 1000);
		const PacValue = kayipValue - PdcValue;

		if (PacValue < 0) setErrorPAC(true);

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

	const CorrectionToRefTemp = useCallback(() => {
		const refTempValue = parseNum(refTemp);
		const direncTempValueRaw = parseNum(direncTemp);
		const yukteTempValueRaw = parseNum(yukteTemp);
		const sargiTipiValue = sargiTipi === "al" ? 225 : 235;

		const measuredTemp = Number.isNaN(yukteTempValueRaw)
			? direncTempValueRaw
			: yukteTempValueRaw;

		const Pdc75 =
			pdcCorrected *
			((refTempValue + sargiTipiValue) / (measuredTemp + sargiTipiValue));

		const Pac75 =
			pacCorrected *
			((measuredTemp + sargiTipiValue) / (refTempValue + sargiTipiValue));

		const Pk75 = Pdc75 + Pac75;

		setPdc75(Pdc75);
		setPac75(Pac75);
		setPk75(Pk75);
	}, [refTemp, direncTemp, yukteTemp, sargiTipi, pdcCorrected, pacCorrected]);

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

	const Hesapla = useCallback(() => {
		Pdc();
		CorrectionToNominalCurrent();
		CorrectionToRefTemp();
		Uk();
	}, [Pdc, CorrectionToNominalCurrent, CorrectionToRefTemp, Uk]);

	useEffect(() => {
		const isProvided = (value) => {
			if (typeof value === "string") {
				return value.trim().length > 0;
			}
			return value !== null && value !== undefined;
		};

		const ygInputs = [direncAB, direncBC, direncCA];
		const agInputs = [direncab, direncbc, direncca];
		const hasAnyYG = ygInputs.some(isProvided);
		const hasAnyAG = agInputs.some(isProvided);

		const requiredFieldsFilled = [
			guc,
			kademeGerilimi,
			agGerilimi,
			refTemp,
			sargiTipi,
			cikilanAkim,
			kayip,
			cikilanGerilim,
		].every(isProvided);

		const hasTempEither = isProvided(direncTemp) || isProvided(yukteTemp);

		if (
			!requiredFieldsFilled ||
			(!hasAnyYG && !hasAnyAG) ||
			!hasTempEither
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
		if (error) return;
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
			id: Date.now().toString(),
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
			showToast && showToast("Başarıyla kaydedildi!", "bottom");
		} catch (e) {
			console.error("Geçmiş kaydedilirken hata:", e);
			showToast &&
				showToast("Geçmiş Kaydedilirken Hata!", "bottom", "error");
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

	const formatPct = (x) =>
		!isFinite(x)
			? "—"
			: `${x.toLocaleString("tr-TR", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				})} %`;

	return (
		<KeyboardAvoidingView
			style={styles.root}
			behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.content}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}>
				{/* ═══════════════════════ Güç Bilgileri ═══════════════════════ */}
				<SectionCard config={SECTION_GUC} glow="topRight">
					<View style={styles.row3}>
						<Field
							label="Güç (kVA)"
							value={guc}
							onChangeText={setGuc}
							placeholder="1250"
							ring={colors.primaryFixedDim}
						/>
						<Field
							style={styles.col}
							label="Kdm. Gerilimi (V)"
							value={kademeGerilimi}
							onChangeText={setKademeGerilimi}
							placeholder="33000"
							ring={colors.primaryFixedDim}
						/>
						<Field
							style={styles.col}
							label="AG Gerilimi (V)"
							value={agGerilimi}
							onChangeText={setAgGerilimi}
							placeholder="400"
							ring={colors.primaryFixedDim}
						/>
					</View>
				</SectionCard>

				{/* ═══════════════════════ Sargı & Sıcaklık ═══════════════════════ */}
				<SectionCard config={SECTION_SARGI} glow="bottomLeft">
					<View>
						<Label>Sargı Tipi</Label>
						<Segmented
							value={sargiTipi}
							options={[
								{ label: "Alüminyum", value: "al" },
								{ label: "Bakır", value: "cu" },
							]}
							onChange={setSargiTipi}
							accent={colors.secondaryFixedDim}
						/>
					</View>

					<View style={styles.row3}>
						<Field
							label="Ref. Sıc. (°C)"
							value={refTemp}
							onChangeText={setRefTemp}
							placeholder="75"
							ring={colors.secondaryFixedDim}
						/>
						<Field
							style={styles.col}
							label="D. Sıcaklık (°C)"
							value={direncTemp}
							onChangeText={setDirencTemp}
							placeholder="23"
							ring={colors.secondaryFixedDim}
						/>
						<Field
							style={styles.col}
							label="Yükte  Sıcaklık (°C)"
							value={yukteTemp}
							onChangeText={setYukteTemp}
							placeholder="23"
							ring={colors.secondaryFixedDim}
						/>
					</View>
				</SectionCard>

				{/* ═══════════════════════ Direnç Ölçümleri ═══════════════════════ */}
				<SectionCard config={SECTION_DIRENC} glow="center">
					<DirencGroup
						label="YG DİRENÇ"
						values={[direncAB, direncBC, direncCA]}
						setters={[setDirencAB, setDirencBC, setDirencCA]}
						placeholders={["9548", "9576", "9584"]}
						accent={colors.tertiaryFixedDim}
						ratio={formatPct(ygDirençOran)}
					/>
					<DirencGroup
						label="AG DİRENÇ"
						values={[direncab, direncbc, direncca]}
						setters={[setDirencab, setDirencbc, setDirencca]}
						placeholders={["533", "532", "535"]}
						accent={colors.tertiaryFixedDim}
						ratio={formatPct(agDirençOran)}
					/>
				</SectionCard>

				{/* ═══════════════════════ Ölçüm Değerleri ═══════════════════════ */}
				<SectionCard config={SECTION_OLCUM} glow={null}>
					<View style={styles.row3}>
						<Field
							style={styles.col}
							label="Çıkılan Akım (A)"
							value={cikilanAkim}
							onChangeText={setCikilanAkim}
							placeholder="—"
							ring={colors.primaryFixedDim}
						/>
						<Field
							style={styles.col}
							label="Ölçü. Kayıp (W)"
							value={kayip}
							onChangeText={setKayip}
							placeholder="—"
							ring={colors.primaryFixedDim}
						/>
						<Field
							label="Çıkılan Gerilim (V)"
							value={cikilanGerilim}
							onChangeText={setCikilanGerilim}
							placeholder="1875"
							ring={colors.primaryFixedDim}
						/>
					</View>
				</SectionCard>

				{/* ═══════════════════════ Buttonlar ═══════════════════════ */}

				<SectionCard config={SECTION_BUTTON} glow={null}>
					<View
						style={{
							flex: 1,
							flexDirection: "row",
							justifyContent: "space-between",
							gap: 4,
						}}>
						<PrimaryBtn
							text="Hesapla"
							icon="calculate"
							onPress={Hesapla}
						/>
						{/* Save / Clear secondary buttons (kept as native, themed) */}

						<SecondaryBtn
							text="Temizle"
							icon="refresh"
							onPress={Temizle}
						/>
						<SecondaryBtn
							text="Kaydet"
							icon="save"
							onPress={gecmisKaydet}
						/>
					</View>
				</SectionCard>

				{/* ═══════════════════════ Warnings ═══════════════════════ */}
				{ygDirençUyarısı ? <Warn text={ygDirençUyarısı} /> : null}
				{agDirençUyarısı ? <Warn text={agDirençUyarısı} /> : null}
				{error ? (
					<Warn text="Lütfen tüm alanlara geçerli sayılar girin." />
				) : null}
				{errorPac ? (
					<View
						style={{
							backgroundColor: "#d420204f",
							borderColor: "#ff6b6b73",
							borderWidth: 1,
							borderRadius: 12,
							padding: 12,
							flexDirection: "row",
							justifyContent: "space-between",
						}}>
						<Text style={styles.warnTitle}>Pac Negatif</Text>
						<Text style={styles.warnTitle}>
							Pac = {pac ? pac.toFixed(2) : "0.00"} W
						</Text>
					</View>
				) : null}

				{/* ═══════════════════════ Results ═══════════════════════ */}
				{pk75 ? (
					<View style={styles.resultsWrap}>
						<View style={styles.resultsRow}>
							<ResultCard
								accent={colors.secondaryFixed}
								label="Pac"
								value={pac ? pac.toFixed(0) : "—"}
							/>
							<ResultCard
								accent={colors.primaryFixed}
								label="Uk (%)"
								value={uk75 ? (uk75 * 100).toFixed(2) : "—"}
							/>
						</View>

						<View style={styles.heroResult}>
							<View
								style={[
									styles.heroAccentBar,
									{ backgroundColor: colors.primary },
								]}
							/>
							<View
								style={[
									StyleSheet.absoluteFillObject,
									{
										backgroundColor: `${colors.primary}1A`, // ~10%
									},
								]}
							/>
							<View style={styles.heroInner}>
								<Text style={styles.heroLabel}>
									Hesaplanan Pk (W)
								</Text>
								<Text style={styles.heroValue}>
									{pk75 ? pk75.toFixed(0) : "—"}
								</Text>
							</View>
						</View>
					</View>
				) : null}
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Card (mirrors HTML: bg-surface-container, rounded-xl, p-4, shadow,
// very subtle accent-tinted glow, header row with icon + title)
// ─────────────────────────────────────────────────────────────────────────────
function SectionCard({ config, glow, children }) {
	return (
		<View style={styles.sectionCard}>
			{/* Glow accent */}
			{glow ? <GlowBlob position={glow} color={config.accent} /> : null}
			{config.icon && config.title ? (
				<View style={styles.sectionHeader}>
					<MaterialIcons
						name={config.icon}
						size={20}
						color={config.accent}
					/>
					<Text style={styles.sectionTitle}>{config.title}</Text>
				</View>
			) : null}
			<View style={styles.sectionBody}>{children}</View>
		</View>
	);
}

function GlowBlob({ position, color }) {
	const blobStyle = {
		position: "absolute",
		width: 128,
		height: 128,
		borderRadius: 999,
		backgroundColor: `${color}0D`, // ~5% alpha
		opacity: 0.6,
	};
	if (position === "topRight") {
		blobStyle.top = -64;
		blobStyle.right = -64;
	} else if (position === "bottomLeft") {
		blobStyle.bottom = -48;
		blobStyle.left = -48;
		blobStyle.width = 96;
		blobStyle.height = 96;
	} else if (position === "center") {
		blobStyle.width = 192;
		blobStyle.height = 192;
		blobStyle.top = "50%";
		blobStyle.left = "50%";
		blobStyle.marginTop = -96;
		blobStyle.marginLeft = -96;
		blobStyle.opacity = 0.35;
	}
	return <View pointerEvents="none" style={blobStyle} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Label + Input
// ─────────────────────────────────────────────────────────────────────────────
function Label({ children }) {
	return <Text style={styles.label}>{children}</Text>;
}

function Field({ label, value, onChangeText, placeholder, ring, style }) {
	return (
		<View style={style}>
			{label ? <Label>{label}</Label> : null}
			<TextInput
				style={[
					styles.input,
					{ borderColor: ring ? `${ring}55` : colors.outlineVariant },
				]}
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor="#ffffff66"
				keyboardType="decimal-pad"
				selectionColor={ring || colors.primaryFixedDim}
			/>
		</View>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Segmented control (Sargı Tipi)
// ─────────────────────────────────────────────────────────────────────────────
function SegmentedOption({ option, active, accent, onPress }) {
	const composed = useMemo(() => {
		return (
			StyleSheet.flatten([
				styles.segmentItem,
				active ? { backgroundColor: accent } : null,
			]) || styles.segmentItem
		);
	}, [active, accent]);

	return (
		<Pressable
			onPress={onPress}
			android_ripple={{ color: "#ffffff10" }}
			style={composed}>
			<Text
				style={[
					styles.segmentText,
					{
						color: active
							? colors.onSecondary
							: colors.onSurfaceVariant,
					},
				]}>
				{option.label}
			</Text>
		</Pressable>
	);
}

function Segmented({ value, options, onChange, accent }) {
	return (
		<View style={styles.segmentTrack}>
			{options.map((opt) => (
				<SegmentedOption
					key={opt.value}
					option={opt}
					active={value === opt.value}
					accent={accent}
					onPress={() => onChange(opt.value)}
				/>
			))}
		</View>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Direnç group (YG / AG)
// ─────────────────────────────────────────────────────────────────────────────
function DirencGroup({ label, values, setters, placeholders, accent, ratio }) {
	return (
		<View style={{ gap: 12 }}>
			<View style={styles.direncHeader}>
				<View style={[styles.direncBar, { backgroundColor: accent }]} />
				<Text style={styles.direncLabel}>
					{label} ·{" "}
					<Text style={{ color: colors.onSurface }}>{ratio}</Text>
				</Text>
			</View>
			<View style={styles.row3}>
				{values.map((v, i) => (
					<View key={i} style={styles.col}>
						<TextInput
							style={[
								styles.input,
								{ borderColor: `${accent}55` },
							]}
							value={v}
							onChangeText={setters[i]}
							placeholder={placeholders[i]}
							placeholderTextColor="#ffffff66"
							keyboardType="decimal-pad"
							selectionColor={accent}
						/>
					</View>
				))}
			</View>
		</View>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Result cards
// ─────────────────────────────────────────────────────────────────────────────
function ResultCard({ accent, label, value }) {
	return (
		<View style={styles.resultCard}>
			<View
				style={[styles.resultAccentBar, { backgroundColor: accent }]}
			/>
			<Text style={styles.resultLabel}>{label}</Text>
			<Text style={[styles.resultValue, { color: accent }]}>{value}</Text>
		</View>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Warning pill
// ─────────────────────────────────────────────────────────────────────────────
function Warn({ text }) {
	return (
		<View style={styles.warn}>
			<MaterialIcons name="error-outline" size={18} color="#ffb4ab" />
			<Text style={styles.warnText}>{text}</Text>
		</View>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Primary button (Hesapla)
// ─────────────────────────────────────────────────────────────────────────────
function PrimaryBtn({ text, icon, onPress, disabled = false, style }) {
	const [pressed, setPressed] = useState(false);

	// Compose all variants into a single flat object so the style prop
	// passed to Pressable is a stable, non-array, non-falsy value.
	const composed = useMemo(() => {
		return (
			StyleSheet.flatten([
				styles.primaryBtn,
				disabled ? styles.primaryBtnDisabled : null,
				pressed ? styles.primaryBtnPressed : null,
				style,
			]) || styles.primaryBtn
		);
	}, [disabled, pressed, style]);

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			accessibilityRole="button"
			accessibilityState={{ disabled }}
			style={composed}
			onPressIn={() => setPressed(true)}
			onPressOut={() => setPressed(false)}
			android_ripple={{ color: "#ffffff22" }}>
			<MaterialIcons
				name={icon}
				size={22}
				color={disabled ? "#ffffff80" : colors.onPrimary}
			/>
			<Text
				style={[
					styles.primaryBtnText,
					disabled && styles.primaryBtnTextDisabled,
				]}>
				{text}
			</Text>
		</Pressable>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Secondary buttons (Temizle / Kaydet)
// ─────────────────────────────────────────────────────────────────────────────
function SecondaryBtn({ text, icon, onPress, disabled = false, style }) {
	const [pressed, setPressed] = useState(false);

	const composed = useMemo(() => {
		return (
			StyleSheet.flatten([
				styles.secondaryBtn,
				disabled ? styles.secondaryBtnDisabled : null,
				pressed ? styles.secondaryBtnPressed : null,
				style,
			]) || styles.secondaryBtn
		);
	}, [disabled, pressed, style]);

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			accessibilityRole="button"
			accessibilityState={{ disabled }}
			style={composed}
			onPressIn={() => setPressed(true)}
			onPressOut={() => setPressed(false)}
			android_ripple={{ color: "#ffffff22" }}>
			<MaterialIcons
				name={icon}
				size={18}
				color={disabled ? "#ffffff80" : colors.onSurface}
			/>
			<Text
				style={[
					styles.secondaryBtnText,
					disabled && styles.secondaryBtnTextDisabled,
				]}>
				{text}
			</Text>
		</Pressable>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: colors.background },
	scroll: { backgroundColor: colors.background },
	content: {
		paddingHorizontal: spacing.marginMobile,
		paddingTop: spacing.sm,
		paddingBottom: 96, // bottom safe
		gap: spacing.base,
	},

	// ---------- Section card ----------
	sectionCard: {
		backgroundColor: colors.surfaceContainer,
		borderRadius: 12,
		padding: spacing.md,
		// shadow-sm equivalent
		shadowColor: "#000",
		shadowOpacity: 0.04,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
		overflow: "hidden",
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
		marginBottom: spacing.xs,
	},
	sectionTitle: {
		fontFamily: "Inter",
		fontSize: 18,
		fontWeight: "600",
		color: colors.onSurface,
	},
	sectionBody: { gap: spacing.sm },

	// ---------- Label ----------
	label: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 1.2,
		marginBottom: 4,
		textTransform: "uppercase",
	},

	// ---------- Input ----------
	input: {
		backgroundColor: colors.surface,
		color: colors.onSurface,
		borderRadius: 8,
		borderWidth: 1,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontFamily: "Inter",
		fontSize: 16,
		fontVariant: ["tabular-nums"],
	},

	// ---------- Rows ----------
	row2: { flexDirection: "row", gap: spacing.md },
	row3: { flexDirection: "row", gap: spacing.sm },
	col: { flex: 1 },

	// ---------- Segmented ----------
	segmentTrack: {
		flexDirection: "row",
		backgroundColor: colors.surface,
		borderRadius: 8,
		padding: 4,
		gap: 4,
	},
	segmentItem: {
		flex: 1,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 6,
		alignItems: "center",
		justifyContent: "center",
	},
	segmentText: {
		fontFamily: "Inter",
		fontSize: 14,
		fontWeight: "600",
	},

	// ---------- Direnç group ----------
	direncHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
	},
	direncBar: {
		width: 4,
		height: 16,
		borderRadius: 2,
	},
	direncLabel: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 1.2,
		textTransform: "uppercase",
	},

	// ---------- Primary button ----------
	primaryBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xs,
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingVertical: 4,
		paddingHorizontal: 6,
		marginTop: 4,
	},
	primaryBtnPressed: {
		transform: [{ scale: 0.98 }],
		opacity: 0.92,
	},
	primaryBtnDisabled: {
		backgroundColor: colors.surfaceContainerHigh,
		opacity: 0.6,
	},
	primaryBtnText: {
		fontFamily: "Inter",
		fontSize: 18,
		fontWeight: "600",
		color: colors.onPrimary,
	},
	primaryBtnTextDisabled: {
		color: "#ffffff80",
	},

	// ---------- Results ----------
	resultsWrap: { gap: spacing.md, marginTop: spacing.sm },
	resultsRow: { flexDirection: "row", gap: spacing.md },
	resultCard: {
		flex: 1,
		height: 112,
		backgroundColor: colors.surfaceContainer,
		borderRadius: 12,
		padding: spacing.md,
		overflow: "hidden",
		justifyContent: "space-between",
	},
	resultAccentBar: {
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		width: 4,
	},
	resultLabel: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 1.2,
		textTransform: "uppercase",
		marginLeft: 8,
	},
	resultValue: {
		fontFamily: "Inter",
		fontSize: 28,
		fontWeight: "700",
		alignSelf: "flex-end",
		fontVariant: ["tabular-nums"],
	},

	heroResult: {
		borderRadius: 12,
		backgroundColor: colors.surfaceContainer,
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: spacing.lg,
	},
	heroAccentBar: {
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		width: 4,
	},
	heroInner: {
		alignItems: "center",
		gap: 4,
		zIndex: 1,
	},
	heroLabel: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 2,
		textTransform: "uppercase",
	},
	heroValue: {
		fontFamily: "Inter",
		fontSize: 48,
		lineHeight: 52,
		fontWeight: "700",
		color: colors.primary,
		letterSpacing: -1,
		fontVariant: ["tabular-nums"],
	},

	// ---------- Warnings ----------
	warn: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
		backgroundColor: "#ff6b6b1f",
		borderColor: "#ff6b6b73",
		borderWidth: 1,
		borderRadius: 12,
		padding: 12,
	},
	warnText: {
		color: "#ffd5d5",
		fontFamily: "Inter",
		fontSize: 13,
		fontWeight: "600",
		flex: 1,
	},
	warnTitle: {
		color: "#ffd5d5",
		fontFamily: "Inter",
		fontSize: 16,
		fontWeight: "800",
	},

	// ---------- Secondary buttons ----------
	secondaryRow: {
		flexDirection: "row",
		gap: spacing.sm,
		marginTop: spacing.md,
	},
	secondaryBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 2,
		paddingVertical: 12,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: colors.outlineVariant,
		backgroundColor: "transparent",
	},
	secondaryBtnPressed: {
		opacity: 0.7,
		backgroundColor: colors.surfaceContainer,
	},
	secondaryBtnDisabled: {
		opacity: 0.4,
	},
	secondaryBtnText: {
		color: colors.onSurface,
		fontFamily: "Inter",
		fontSize: 14,
		fontWeight: "600",
	},
	secondaryBtnTextDisabled: {
		color: "#ffffff80",
	},
});
