import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useEffect, useMemo, useState } from "react";
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
	surfaceContainerLowest: "#0c0e11",
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
	primaryFixed: "#63f7ff",
	primaryFixedDim: "#00dce5",

	secondary: "#ffdb9d",
	onSecondary: "#412d00",
	secondaryContainer: "#feb700",
	onSecondaryContainer: "#6b4b00",
	secondaryFixed: "#ffdea8",
	secondaryFixedDim: "#ffba20",

	tertiary: "#fef8ff",
	tertiaryContainer: "#e5d7ff",
	tertiaryFixed: "#e9ddff",
	tertiaryFixedDim: "#d0bcff",
	onTertiary: "#3c0091",
	onTertiaryContainer: "#703eda",

	error: "#ffb4ab",
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
// Stage accent configurations (input cards + result bars)
// ─────────────────────────────────────────────────────────────────────────────
const STAGE = {
	ilk: {
		title: "İLK KADEME",
		icon: "looks-one",
		accent: colors.primary,
		onAccent: colors.onPrimary,
		bg: `${colors.primary}0D`, // 5%
		wash: `${colors.primary}0D`, // 5%
	},
	nom: {
		title: "NOM KADEME",
		icon: "looks-two",
		accent: colors.secondary,
		onAccent: colors.onSecondary,
		bg: `${colors.secondary}0D`,
		wash: `${colors.secondary}0D`,
	},
	son: {
		title: "SON KADEME",
		icon: "looks-3",
		accent: colors.tertiaryFixedDim,
		onAccent: colors.onTertiary,
		bg: `${colors.tertiaryFixedDim}0D`,
		wash: `${colors.tertiaryFixedDim}0D`,
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// Root 3
// ─────────────────────────────────────────────────────────────────────────────
const SQRT3 = Math.sqrt(3);

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function UkHesap({ showToast }) {
	// General parameters
	const [guc, setGuc] = useState("");
	const [ilkKademeGerilim, setIlkKademeGerilim] = useState("");
	const [nomKademeGerilim, setNomKademeGerilim] = useState("");
	const [sonKademeGerilim, setSonKademeGerilim] = useState("");

	// Stage inputs
	const [ilkKademeCikilanGerilim, setIlkKademeCikilanGerilim] = useState("");
	const [ilkKademeCikilanAkim, setIlkKademeCikilanAkim] = useState("");
	const [nomCikilanGerilim, setNomCikilanGerilim] = useState("");
	const [nomCikilanAkim, setNomCikilanAkim] = useState("");
	const [sonKademeCikilanGerilim, setSonKademeCikilanGerilim] = useState("");
	const [sonKademeCikilanAkim, setSonKademeCikilanAkim] = useState("");

	const [kv, setKv] = useState(true);
	const [error, setError] = useState("");
	const [resultNomKademeUk, setResultNomKademeUk] = useState(null);
	const [resultIlkKademeUk, setResultIlkademeUk] = useState(null);
	const [resultSonKademeUk, setResultSonKademeUk] = useState(null);
	const [params, setParams] = useState({});
	const [history, setHistory] = useState([]);

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

	function parseNum(v) {
		if (typeof v !== "string") return NaN;
		return Number(v.trim().replace(/,/g, "."));
	}

	// ─────────────────────────────────────────────────────────────────────────
	// Save
	// ─────────────────────────────────────────────────────────────────────────
	async function gecmisKaydet() {
		if (!params.guc) {
			setError("Lütfen güç değerini girin.");
			return;
		}

		const ilkKademeActive =
			ilkKademeGerilim && ilkKademeGerilim.trim() !== "";
		const nomKademeActive =
			nomKademeGerilim && nomKademeGerilim.trim() !== "";
		const sonKademeActive =
			sonKademeGerilim && sonKademeGerilim.trim() !== "";

		if (!ilkKademeActive && !nomKademeActive && !sonKademeActive) {
			setError("Lütfen en az bir kademe gerilimi girin.");
			return;
		}

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
			id: Date.now().toString(),
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
			resultIlkKademeUk,
			resultNomKademeUk,
			resultSonKademeUk,
		};

		const newHistory = [newEntry, ...history];
		setHistory(newHistory);

		try {
			await AsyncStorage.setItem("UkHistory", JSON.stringify(newHistory));
			showToast && showToast("Başarıyla kaydedildi!", "bottom");
		} catch (e) {
			console.error("Geçmiş kaydedilirken hata:", e);
			showToast &&
				showToast("Geçmiş Kaydedilirken Hata!", "bottom", "error");
		}
	}

	useEffect(() => {
		async function get() {
			const stored = await AsyncStorage.getItem("UkHistory");
			const parsed = stored ? JSON.parse(stored) : [];
			setHistory(parsed);
		}
		get();
	}, [history]);

	// ─────────────────────────────────────────────────────────────────────────
	// Calculate
	// ─────────────────────────────────────────────────────────────────────────
	function hesapla() {
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

		const ilkKademeAkimVal = gucVal / ilkKademeGerilimVal / SQRT3;
		const sonKademeAkimVal = gucVal / sonKademeGerilimVal / SQRT3;
		const nomKademeAkimVal = gucVal / nomKademeGerilimVal / SQRT3;

		if (!isFinite(gucVal) || gucVal <= 0) {
			setError(
				guc
					? "Lütfen geçerli bir güç değeri girin."
					: "Lütfen güç değerini girin.",
			);
			setResultNomKademeUk(null);
			setResultIlkademeUk(null);
			setResultSonKademeUk(null);
			return;
		}

		const ilkKademeActive =
			ilkKademeGerilim && ilkKademeGerilim.trim() !== "";
		const nomKademeActive =
			nomKademeGerilim && nomKademeGerilim.trim() !== "";
		const sonKademeActive =
			sonKademeGerilim && sonKademeGerilim.trim() !== "";

		if (!ilkKademeActive && !nomKademeActive && !sonKademeActive) {
			setError("Lütfen en az bir kademe gerilimi girin.");
			setResultNomKademeUk(null);
			setResultIlkademeUk(null);
			setResultSonKademeUk(null);
			return;
		}

		const errorMessages = [];

		if (ilkKademeActive) {
			const ok = [
				ilkKademeGerilimVal,
				ilkKademeCikilanGerilimVal,
				ilkKademeCikilanAkimVal,
			].every((n) => isFinite(n) && n > 0);
			if (!ok) {
				errorMessages.push(
					"İlk kademe için tüm alanları doldurun (Çıkılan Gerilim, Çıkılan Akım).",
				);
				setResultIlkademeUk(null);
			}
		} else {
			setResultIlkademeUk(null);
		}

		if (nomKademeActive) {
			const ok = [
				nomKademeGerilimVal,
				nomCikilanGerilimVal,
				nomCikilanAkimVal,
			].every((n) => isFinite(n) && n > 0);
			if (!ok) {
				errorMessages.push(
					"Nom kademe için tüm alanları doldurun (Çıkılan Gerilim, Çıkılan Akım).",
				);
				setResultNomKademeUk(null);
			}
		} else {
			setResultNomKademeUk(null);
		}

		if (sonKademeActive) {
			const ok = [
				sonKademeGerilimVal,
				sonKademeCikilanGerilimVal,
				sonKademeCikilanAkimVal,
			].every((n) => isFinite(n) && n > 0);
			if (!ok) {
				errorMessages.push(
					"Son kademe için tüm alanları doldurun (Çıkılan Gerilim, Çıkılan Akım).",
				);
				setResultSonKademeUk(null);
			}
		} else {
			setResultSonKademeUk(null);
		}

		if (errorMessages.length > 0) {
			setError(errorMessages.join(" "));
			return;
		}

		setError("");

		if (ilkKademeActive) {
			const ilkKademeCgScaled = kv
				? ilkKademeCikilanGerilimVal * SQRT3 * 1000
				: ilkKademeCikilanGerilimVal * SQRT3;
			const ilkKademeOlcek = ilkKademeCgScaled * 100;
			const ilkKademeKgScaled = kv
				? ilkKademeGerilimVal * 1000
				: ilkKademeGerilimVal;
			const ilkKademeUk =
				(ilkKademeOlcek * ilkKademeAkimVal) /
				(ilkKademeKgScaled * ilkKademeCikilanAkimVal);
			setResultIlkademeUk(ilkKademeUk);
		}

		if (nomKademeActive) {
			const cgScaled = kv
				? nomCikilanGerilimVal * SQRT3 * 1000
				: nomCikilanGerilimVal * SQRT3;
			const olcek = cgScaled * 100;
			const kgScaled = kv
				? nomKademeGerilimVal * 1000
				: nomKademeGerilimVal;
			const uk =
				(olcek * nomKademeAkimVal) / (kgScaled * nomCikilanAkimVal);
			setResultNomKademeUk(uk);
		}

		if (sonKademeActive) {
			const sonKademeCgScaled = kv
				? sonKademeCikilanGerilimVal * SQRT3 * 1000
				: sonKademeCikilanGerilimVal * SQRT3;
			const sonKademeOlcek = sonKademeCgScaled * 100;
			const sonKademeKgScaled = kv
				? sonKademeGerilimVal * 1000
				: sonKademeGerilimVal;
			const sonKademeUk =
				(sonKademeOlcek * sonKademeAkimVal) /
				(sonKademeKgScaled * sonKademeCikilanAkimVal);
			setResultSonKademeUk(sonKademeUk);
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
		setResultIlkademeUk(null);
		setResultSonKademeUk(null);
		setParams({});
		showToast && showToast("Temizlendi!", "bottom", "info");
	}

	// ─────────────────────────────────────────────────────────────────────────
	// Render
	// ─────────────────────────────────────────────────────────────────────────
	return (
		<KeyboardAvoidingView
			style={styles.root}
			behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.content}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}>
				{/* ═══════════════════════ INPUT SECTION ═══════════════════════ */}
				<View style={styles.section}>
					{/* Divider: GİRİŞ VERİLERİ */}
					{/* <SectionDivider label="GİRİŞ VERİLERİ" /> */}

					{/* Genel Veriler card */}
					<View style={styles.card}>
						<View
							style={[
								styles.topAccent,
								{
									backgroundColor: `${colors.primaryFixedDim}80`,
								},
							]}
						/>
						<View style={styles.cardHeader}>
							<MaterialIcons
								name="dataset"
								size={20}
								color={colors.primaryFixed}
							/>
							<Text style={styles.cardTitleSm}>
								Genel Veriler
							</Text>
						</View>
						<View style={styles.genelGridCompact}>
							<Field
								label="Trafo Gücü"
								labelSize="xs"
								value={guc}
								onChangeText={setGuc}
								placeholder="1000"
							/>
							<Field
								label="İlk Kademe"
								labelSize="xs"
								value={ilkKademeGerilim}
								onChangeText={setIlkKademeGerilim}
								placeholder="34.5"
							/>
							<Field
								label="Nom Kademe"
								labelSize="xs"
								value={nomKademeGerilim}
								onChangeText={setNomKademeGerilim}
								placeholder="33"
							/>
							<Field
								label="Son Kademe"
								labelSize="xs"
								value={sonKademeGerilim}
								onChangeText={setSonKademeGerilim}
								placeholder="31.5"
							/>
						</View>
					</View>

					{/* Stage 1 Input: İlk Kademe */}
					<StageInputCard
						stage={STAGE.ilk}
						stageNumber="1"
						voltageValue={ilkKademeCikilanGerilim}
						voltageOnChange={setIlkKademeCikilanGerilim}
						currentValue={ilkKademeCikilanAkim}
						currentOnChange={setIlkKademeCikilanAkim}
					/>

					{/* Stage 2 Input: Nom Kademe */}
					<StageInputCard
						stage={STAGE.nom}
						stageNumber="2"
						voltageValue={nomCikilanGerilim}
						voltageOnChange={setNomCikilanGerilim}
						currentValue={nomCikilanAkim}
						currentOnChange={setNomCikilanAkim}
					/>

					{/* Stage 3 Input: Son Kademe */}
					<StageInputCard
						stage={STAGE.son}
						stageNumber="3"
						voltageValue={sonKademeCikilanGerilim}
						voltageOnChange={setSonKademeCikilanGerilim}
						currentValue={sonKademeCikilanAkim}
						currentOnChange={setSonKademeCikilanAkim}
					/>

					{/* Actions */}
					<View style={styles.actionsRow}>
						<SecondaryBtn
							text="Temizle"
							icon="clear-all"
							onPress={temizle}
						/>
						<PrimaryBtn
							text="Kaydet"
							icon="save"
							onPress={gecmisKaydet}
							style={{ flex: 2 }}
						/>
					</View>

					{/* Error */}
					{error ? (
						<View style={styles.errorCard}>
							<MaterialIcons
								name="error-outline"
								size={18}
								color={colors.error}
							/>
							<Text style={styles.errorText}>{error}</Text>
						</View>
					) : null}
				</View>

				{/* ═══════════════════════ RESULTS SECTION ═══════════════════════ */}
				<View style={[styles.section, styles.resultsSection]}>
					{/* Divider: ÖLÇÜM SONUÇLARI */}
					{/* <SectionDivider label="ÖLÇÜM SONUÇLARI" /> */}

					{resultIlkKademeUk && (
						<ResultBar
							stage={STAGE.ilk}
							label="İlk Kademe Hesaplanan Uk"
							resultNumber={resultIlkKademeUk}
						/>
					)}

					{resultNomKademeUk && (
						<ResultBar
							stage={STAGE.nom}
							label="Nom Kademe Hesaplanan Uk"
							resultNumber={resultNomKademeUk}
						/>
					)}
					{resultSonKademeUk && (
						<ResultBar
							stage={STAGE.son}
							label="Son Kademe Hesaplanan Uk"
							resultNumber={resultSonKademeUk}
						/>
					)}
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Section divider with gradient lines (mirrors HTML's bg-gradient-to-r)
// ─────────────────────────────────────────────────────────────────────────────
function SectionDivider({ label }) {
	return (
		<View style={styles.dividerRow}>
			<View style={styles.dividerLineLeft} />
			<Text style={styles.dividerLabel}>{label}</Text>
			<View style={styles.dividerLineRight} />
		</View>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage Input Card (matches HTML's bg-primary/5 + 3px accent + numbered badge)
// ─────────────────────────────────────────────────────────────────────────────
function StageInputCard({
	stage,
	stageNumber,
	voltageValue,
	voltageOnChange,
	currentValue,
	currentOnChange,
}) {
	return (
		<View style={styles.stageCard}>
			{/* Header bar — slimmer (5% bg, 3px accent, numbered badge) */}
			<View
				style={[
					styles.stageHeader,
					{
						backgroundColor: stage.bg,
						borderBottomColor: `${stage.accent}1A`, // 10% bottom border
					},
				]}>
				<View
					style={[
						styles.stageAccentBar,
						{ backgroundColor: stage.accent },
					]}
				/>
				<Text
					style={[
						styles.stageHeaderLabel,
						{ color: `${stage.accent}CC` },
					]}>
					{stage.title}
				</Text>
				<View
					style={[
						styles.stageBadge,
						{ backgroundColor: stage.accent },
					]}>
					<Text
						style={[
							styles.stageBadgeText,
							{ color: stage.onAccent },
						]}>
						{stageNumber}
					</Text>
				</View>
			</View>

			{/* Body */}
			<View style={styles.stageBody}>
				<View style={styles.genelGrid}>
					<Field
						label="Test Gerilimi (V)"
						value={voltageValue}
						onChangeText={voltageOnChange}
						placeholder="0.0"
					/>
					<Field
						label="Test Akımı (A)"
						value={currentValue}
						onChangeText={currentOnChange}
						placeholder="0.0"
					/>
				</View>
			</View>
		</View>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Result Bar (mirrors HTML's bg-surface-container-lowest + border + hover-fill)
// ─────────────────────────────────────────────────────────────────────────────
function ResultBar({ stage, label, resultNumber }) {
	const [hovered, setHovered] = useState(false);

	return (
		<View
			// onPressIn={() => setHovered(true)}
			// onPressOut={() => setHovered(false)}
			style={styles.resultBar}>
			{/* Hover wash fill */}
			<View
				style={[
					styles.resultBarFill,
					{
						backgroundColor: stage.wash,
						width: hovered ? "100%" : "0%",
					},
				]}
			/>
			{/* Left accent bar (4px) */}
			<View
				style={[
					styles.resultBarAccent,
					{ backgroundColor: stage.accent },
				]}
			/>
			{/* Content */}
			<View style={styles.resultBarContent}>
				<Text style={styles.resultLabel}>{label}</Text>
				<View style={styles.resultValueRow}>
					<Text
						style={[styles.resultNumber, { color: stage.accent }]}>
						{resultNumber !== null
							? formatPct(resultNumber)
							: "0.00"}
					</Text>
					<Text
						style={[
							styles.resultUnit,
							{ color: `${stage.accent}B3` },
						]}>
						%
					</Text>
				</View>
			</View>
			{/* Decorative percent icon */}
			<MaterialIcons
				name="percent"
				size={48}
				color={`${stage.accent}1A`}
				style={styles.resultBarIcon}
			/>
		</View>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Field — surface-container-lowest input with group focus-within
// ─────────────────────────────────────────────────────────────────────────────
function Field({
	label,
	value,
	onChangeText,
	placeholder,
	style,
	labelSize = "md", // "md" (default label-caps 12px) | "xs" (10px compact)
}) {
	const [focused, setFocused] = useState(false);

	const containerStyle =
		labelSize === "xs" ? styles.fieldColCompact : styles.fieldCol;
	const labelStyle = labelSize === "xs" ? styles.labelXs : styles.label;

	return (
		<View style={[containerStyle, style]}>
			<Text style={labelStyle}>{label}</Text>
			<View
				style={[
					styles.inputShell,
					focused && {
						backgroundColor: colors.surfaceContainerHighest,
					},
				]}>
				<TextInput
					style={styles.input}
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					placeholderTextColor={`${colors.onSurfaceVariant}4D`}
					keyboardType="decimal-pad"
					selectionColor={colors.primaryFixedDim}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
				/>
			</View>
		</View>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Buttons (memoized flat-style pattern from previous fix)
// ─────────────────────────────────────────────────────────────────────────────
function PrimaryBtn({ text, icon, onPress, disabled = false, style }) {
	const [pressed, setPressed] = useState(false);
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
				size={18}
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
			onPressOut={() => setPressed(false)}>
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
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatPct(x) {
	if (!isFinite(x)) return "0.00";
	return x.toLocaleString("tr-TR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: colors.background },
	scroll: { backgroundColor: colors.background },
	content: {
		paddingHorizontal: spacing.sm,
		paddingTop: spacing.md,
		paddingBottom: 96,
	},

	// ---------- Section ----------
	section: {
		gap: spacing.md,
	},
	resultsSection: {
		marginTop: spacing.md,
		paddingTop: spacing.md,
		borderTopWidth: 1,
		borderTopColor: colors.surfaceContainerHighest,
	},

	// ---------- Card ----------
	card: {
		backgroundColor: colors.surfaceContainer,
		borderRadius: 12,
		padding: spacing.sm,
		overflow: "hidden",
		gap: spacing.sm,
		shadowColor: "#000",
		shadowOpacity: 0.04,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},
	topAccent: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 3,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
	},
	cardTitleSm: {
		fontFamily: "Inter",
		fontSize: 16,
		fontWeight: "400",
		color: colors.onSurface,
	},

	// ---------- Grid ----------
	genelGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing.sm,
	},
	genelGridCompact: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 4,
	},

	// ---------- Field ----------
	fieldCol: {
		flexBasis: "48%",
		flexGrow: 1,
		minWidth: 140,
	},
	fieldColCompact: {
		flex: 1,
		minWidth: "22%",
		marginBottom: 2,
	},
	label: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 1,
		textTransform: "uppercase",
	},
	labelXs: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "400",
		color: colors.onSurfaceVariant,
		textTransform: "none",
		letterSpacing: 0,
	},
	inputShell: {
		backgroundColor: colors.surfaceContainerLowest,
		borderRadius: 8,
		padding: spacing.xs,
		marginTop: spacing.base,
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},
	input: {
		flex: 1,
		minWidth: 100,
		backgroundColor: "transparent",
		fontFamily: "Inter",
		fontSize: 14,
		fontWeight: "400",
		color: colors.onSurface,
		paddingHorizontal: spacing.xs,
		paddingVertical: spacing.base,
		fontVariant: ["tabular-nums"],
	},

	// ---------- Divider ----------
	dividerRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
		paddingVertical: spacing.xs,
		opacity: 0.6,
	},
	dividerLineLeft: {
		flex: 1,
		height: 1,
		// gradient simulation via single color (closest to transparent→variant)
		backgroundColor: `${colors.onSurfaceVariant}4D`,
	},
	dividerLineRight: {
		flex: 1,
		height: 1,
		backgroundColor: `${colors.onSurfaceVariant}4D`,
	},
	dividerLabel: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 1.5,
		textTransform: "uppercase",
	},

	// ---------- Stage Input Card ----------
	stageCard: {
		backgroundColor: colors.surfaceContainer,
		borderRadius: 12,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOpacity: 0.08,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
	},
	stageHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: spacing.sm,
		paddingVertical: 4,
		position: "relative",
		borderBottomWidth: 1,
	},
	stageAccentBar: {
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		width: 3,
	},
	stageHeaderLabel: {
		fontFamily: "Inter",
		fontSize: 11,
		fontWeight: "600",
		letterSpacing: 1.2,
		textTransform: "uppercase",
	},
	stageBadge: {
		width: 16,
		height: 16,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	stageBadgeText: {
		fontFamily: "Inter",
		fontSize: 10,
		fontWeight: "700",
		lineHeight: 12,
		textAlign: "center",
	},
	stageBody: {
		padding: spacing.sm,
		gap: spacing.sm,
	},

	// ---------- Result Bar ----------
	resultBar: {
		backgroundColor: colors.surfaceContainerLowest,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.surfaceContainer,
		padding: spacing.sm,
		position: "relative",
		overflow: "hidden",
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	resultBarFill: {
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
	},
	resultBarAccent: {
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		width: 4,
	},
	resultBarContent: {
		flexDirection: "column",
		paddingLeft: spacing.sm,
		zIndex: 1,
	},
	resultLabel: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 1,
		textTransform: "uppercase",
	},
	resultValueRow: {
		flexDirection: "row",
		alignItems: "baseline",
		gap: spacing.xs,
		marginTop: 4,
	},
	resultNumber: {
		fontFamily: "Inter",
		fontSize: 20,
		fontWeight: "700",
		lineHeight: 28,
		fontVariant: ["tabular-nums"],
	},
	resultUnit: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
	},
	resultBarIcon: {
		position: "absolute",
		right: -8,
		bottom: -8,
		zIndex: 0,
	},

	// ---------- Error ----------
	errorCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
		backgroundColor: `${colors.error}1A`,
		borderColor: `${colors.error}55`,
		borderWidth: 1,
		borderRadius: 12,
		padding: spacing.sm,
	},
	errorText: {
		fontFamily: "Inter",
		fontSize: 13,
		fontWeight: "600",
		color: colors.error,
		flex: 1,
	},

	// ---------- Actions ----------
	actionsRow: {
		flexDirection: "row",
		gap: spacing.md,
		paddingTop: spacing.sm,
	},

	// ---------- Primary Button ----------
	primaryBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xs,
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingVertical: spacing.sm,
		shadowColor: "#000",
		shadowOpacity: 0.15,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
		elevation: 3,
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
		fontSize: 12,
		fontWeight: "600",
		color: colors.onPrimary,
		letterSpacing: 1.2,
		textTransform: "uppercase",
	},
	primaryBtnTextDisabled: {
		color: "#ffffff80",
	},

	// ---------- Secondary Button ----------
	secondaryBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xs,
		backgroundColor: colors.surfaceContainerHighest,
		borderRadius: 12,
		paddingVertical: spacing.sm,
		shadowColor: "#000",
		shadowOpacity: 0.04,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},
	secondaryBtnPressed: {
		opacity: 0.7,
		backgroundColor: colors.surfaceContainer,
	},
	secondaryBtnDisabled: {
		opacity: 0.4,
	},
	secondaryBtnText: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurface,
		letterSpacing: 1.2,
		textTransform: "uppercase",
	},
	secondaryBtnTextDisabled: {
		color: "#ffffff80",
	},
});
