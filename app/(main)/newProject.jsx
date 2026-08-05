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
	surfaceContainerLowest: "#0c0e11",
	surfaceContainerLow: "#1a1c1f",
	surfaceContainer: "#1e2023",
	surfaceContainerHigh: "#282a2d",
	surfaceContainerHighest: "#333538",
	surfaceBright: "#37393d",
	surfaceVariant: "#333538",
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
	onPrimaryFixed: "#002021",

	secondary: "#ffdb9d",
	onSecondary: "#412d00",
	secondaryContainer: "#feb700",
	onSecondaryContainer: "#6b4b00",
	secondaryFixed: "#ffdea8",
	secondaryFixedDim: "#ffba20",
	onSecondaryFixed: "#271900",

	tertiary: "#fef8ff",
	onTertiary: "#3c0091",
	tertiaryContainer: "#e5d7ff",
	onTertiaryContainer: "#703eda",
	tertiaryFixed: "#e9ddff",
	tertiaryFixedDim: "#d0bcff",

	error: "#ffb4ab",
	info: "#10B981",
};

const spacing = {
	base: 4,
	xs: 8,
	sm: 12,
	md: 16,
	lg: 24,
	xl: 32,
	marginMobile: 16,
	marginDesktop: 48,
};

const SQRT3 = Math.sqrt(3);

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function NewProject({ showToast }) {
	const [guc, setGuc] = useState("");
	const [ilkKademe, setIlkKademe] = useState("");
	const [nominalKademe, setNominalKademe] = useState("");
	const [sonKademe, setSonKademe] = useState("");
	const [agGerilimi, setAgGerilimi] = useState("");
	const [ciftAG, setCiftAG] = useState(false);

	const [error, setError] = useState(false);
	const [result, setResult] = useState(null);

	useEffect(() => {
		if (guc || ilkKademe || nominalKademe || sonKademe || agGerilimi) {
			hesapla();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [guc, ilkKademe, nominalKademe, sonKademe, agGerilimi]);

	// ─────────────────────────────────────────────────────────────────────────
	// Helpers
	// ─────────────────────────────────────────────────────────────────────────
	function parseNum(v) {
		if (typeof v !== "string") return NaN;
		return Number(v.trim().replace(/,/g, "."));
	}

	const fmt = useCallback(
		(x, digits = 2) =>
			!isFinite(x)
				? "—"
				: x.toLocaleString("tr-TR", {
						minimumFractionDigits: digits,
						maximumFractionDigits: digits,
					}),
		[],
	);

	// ─────────────────────────────────────────────────────────────────────────
	// Calculate
	// ─────────────────────────────────────────────────────────────────────────
	function hesapla() {
		const gucValue = parseNum(guc);
		const ilkKademeValue = parseNum(ilkKademe);
		const nominalKademeValue = parseNum(nominalKademe);
		const sonKademeValue = parseNum(sonKademe);
		const AgValue = parseNum(agGerilimi);

		setError(false);

		// HV (YG) currents
		const ilkKademeAkimi = gucValue / ilkKademeValue / SQRT3;
		const nominalKademeAkimi = gucValue / nominalKademeValue / SQRT3;
		const sonKademeAkimi = gucValue / sonKademeValue / SQRT3;

		// AG current (single output)
		const agAkimi = gucValue / (AgValue / 1000) / SQRT3;

		// No-load voltages (mean / RMS derivation per IEC)
		const Umean_90 = (AgValue / SQRT3 / 1.11) * 0.9;
		const Umean_100 = (AgValue / SQRT3 / 1.11) * 1.0;
		const Umean_110 = (AgValue / SQRT3 / 1.11) * 1.1;
		const Urms = AgValue / SQRT3;

		setResult({
			yg: {
				ilk: ilkKademeAkimi,
				nom: nominalKademeAkimi,
				son: sonKademeAkimi,
			},
			cift_ag: {
				ilk: ilkKademeAkimi * 2,
				nom: nominalKademeAkimi * 2,
				son: sonKademeAkimi * 2,
				cift: agAkimi,
			},
			tolerans: {
				u90: Umean_90,
				u100: Umean_100,
				u110: Umean_110,
				urms: Urms,
			},
		});
	}

	function temizle() {
		setGuc("");
		setAgGerilimi("");
		setIlkKademe("");
		setSonKademe("");
		setNominalKademe("");
		setError(false);
		setResult(null);
		showToast && showToast("Temizlendi!", "bottom", "info");
	}

	const allFilled =
		guc && ilkKademe && nominalKademe && sonKademe && agGerilimi;

	return (
		<KeyboardAvoidingView
			style={styles.root}
			behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.content}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}>
				{/* ═══════════ Header ═══════════ */}
				<View style={styles.headerBlock}>
					<Text style={styles.title}>Yeni Proje Hesaplama</Text>
				</View>

				{/* ═══════════ Input Card ═══════════ */}
				<View style={styles.inputCard}>
					{/* Row 1: Güç + AG Gerilim */}
					<View style={styles.row1}>
						<BigInput
							label="Güç (kVA)"
							value={guc}
							onChangeText={setGuc}
							placeholder="1000 kVA"
							ringColor={colors.primaryFixed}
						/>
						<BigInput
							label="AG Gerilim (V)"
							value={agGerilimi}
							onChangeText={setAgGerilimi}
							placeholder="400 V"
							ringColor={colors.primaryFixed}
						/>
					</View>

					<View style={styles.thinDivider} />

					{/* Row 2: 3-col kademe */}
					<View style={styles.row3}>
						<SmallInput
							label="İlk Kademe (V)"
							value={ilkKademe}
							onChangeText={setIlkKademe}
							placeholder="28,5 kV"
							ringColor={colors.secondaryFixed}
						/>
						<SmallInput
							label="Nom Kademe (V)"
							value={nominalKademe}
							onChangeText={setNominalKademe}
							placeholder="33 kV"
							ringColor={colors.secondaryFixed}
						/>
						<SmallInput
							label="Son Kademe (V)"
							value={sonKademe}
							onChangeText={setSonKademe}
							placeholder="36 kV"
							ringColor={colors.secondaryFixed}
						/>
					</View>

					{/* Çift AG Checkbox */}
					<Pressable
						onPress={() => setCiftAG((p) => !p)}
						style={styles.checkboxRow}
						accessibilityRole="checkbox"
						accessibilityState={{ checked: ciftAG }}>
						<View
							style={[
								styles.checkbox,
								ciftAG && {
									backgroundColor: colors.primaryFixed,
									borderColor: colors.primaryFixed,
								},
							]}>
							{ciftAG ? (
								<MaterialIcons
									name="check"
									size={14}
									color={colors.onPrimaryFixed}
								/>
							) : null}
						</View>
						<Text style={styles.checkboxLabel}>Çift AG Çıkışı</Text>
					</Pressable>

					<View
						style={{
							flexDirection: "row",
							gap: spacing.md,
						}}>
						{/* Temizle secondary action */}
						<SecondaryBtn
							text="Temizle"
							icon="delete-sweep"
							onPress={temizle}
						/>

						{/* Hesapla Button */}
						<PrimaryBtn
							text="Hesapla"
							icon="bolt"
							onPress={hesapla}
							disabled={!allFilled}
						/>
					</View>
				</View>

				{/* ═══════════ Divider ═══════════ */}
				{/* <View style={styles.dividerRow}>
					<View style={styles.dividerLine} />
					<Text style={styles.dividerLabel}>Hesaplama Sonuçları</Text>
					<View style={styles.dividerLine} />
				</View> */}
				{ciftAG && (
					<View style={styles.infoCard}>
						<Text style={styles.infoText}>
							Güç 2 katı ile çarpılacaktır. Tek AG gücü
							girdiğinizden emin olunuz!
						</Text>
					</View>
				)}

				{/* ═══════════ Results Card ═══════════ */}
				{result ? (
					<ResultsCard result={result} ciftAG={ciftAG} fmt={fmt} />
				) : (
					<View style={styles.placeholder}>
						<MaterialIcons
							name="calculate"
							size={48}
							color={colors.onSurfaceVariant}
						/>
						<Text style={styles.placeholderText}>
							Hesaplamak için tüm alanları doldurun
						</Text>
					</View>
				)}

				{error ? (
					<View style={styles.errorCard}>
						<MaterialIcons
							name="error-outline"
							size={18}
							color={colors.error}
						/>
						<Text style={styles.errorText}>
							Lütfen tüm alanlara geçerli sayılar girin.
						</Text>
					</View>
				) : null}
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Results Card (mirrors HTML's 3 grouped sections)
// ─────────────────────────────────────────────────────────────────────────────
function ResultsCard({ result, ciftAG, fmt }) {
	const { yg, cift_ag, tolerans } = result;

	return (
		<View style={styles.resultsCard}>
			{/* ─── YG Akım Değerleri ─── */}
			<View>
				<View
					style={[
						styles.resultSectionHeader,
						{ backgroundColor: `${colors.primary}1A` },
					]}>
					<Text
						style={[
							styles.resultSectionLabel,
							{ color: colors.primaryFixedDim },
						]}>
						YG + (AG1) ve YG + (AG2) Akım Değerleri (A)
					</Text>
				</View>
				<View style={styles.resultTriRow}>
					<ResultCell
						label="İlk"
						value={fmt(yg.ilk, 2) + " A"}
						size="sm"
					/>
					<ResultCell
						label="Nominal"
						value={fmt(yg.nom, 2) + " A"}
						size="md"
						accent={colors.secondaryFixed}
						highlighted
					/>
					<ResultCell
						label="Son"
						value={fmt(yg.son, 2) + " A"}
						size="sm"
					/>
				</View>
			</View>
			{ciftAG ? (
				<View>
					<View
						style={[
							styles.resultSectionHeader,
							{ backgroundColor: `${colors.tertiary}1A` },
						]}>
						<Text
							style={[
								styles.resultSectionLabel,
								{ color: colors.tertiaryFixedDim },
							]}>
							YG + (AG1+AG2) Akım Değerleri (A)
						</Text>
					</View>

					<View style={styles.resultTriRow}>
						<ResultCell
							label="Çift AG İlk"
							value={fmt(cift_ag.ilk, 2) + " A"}
							size="sm"
						/>
						<ResultCell
							label="Çift AG Nom"
							value={fmt(cift_ag.nom, 2) + " A"}
							size="sm"
							accent={colors.secondaryFixed}
							highlighted
						/>
						<ResultCell
							label="Çift AG Son"
							value={fmt(cift_ag.son, 2) + " A"}
							size="sm"
						/>
					</View>
					<View style={styles.standartRow}>
						<Text style={styles.cellLabel}>AG-AG Akım Değeri</Text>
						<View style={styles.actionsRow}>
							<Text
								style={[
									styles.standartValue,
									{ color: colors.tertiaryFixed },
								]}>
								{fmt(cift_ag.cift, 2)}
							</Text>
							<Text
								style={[
									styles.cellUnit,
									{ lineHeight: 28, fontSize: 28 },
								]}>
								A
							</Text>
						</View>
					</View>
				</View>
			) : null}

			{/* ─── Tolerans & Teknik Veriler ─── */}
			<View>
				<View style={styles.resultSectionHeader}>
					<Text style={styles.resultSectionLabel}>
						Boşta Gerilim Değerleri
					</Text>
				</View>
				<View style={styles.toleransRow}>
					{/* Left list */}
					<View style={styles.toleransList}>
						<ToleransRow
							label="%90 Gerilim"
							value={`${fmt(tolerans.u90, 2)} V`}
						/>
						<ToleransRow
							label="%100 Gerilim"
							value={`${fmt(tolerans.u100, 2)} V`}
						/>
						<ToleransRow
							label="%110 Gerilim"
							value={`${fmt(tolerans.u110, 2)} V`}
						/>
					</View>
					{/* Urms highlighted */}
					<View style={styles.urmsBox}>
						<Text style={styles.cellLabel}>Urms Değeri</Text>
						<View style={styles.actionsRow}>
							<Text
								style={[
									styles.urmsValue,
									{ color: colors.secondaryFixedDim },
								]}>
								{fmt(tolerans.urms, 2)}
							</Text>
							<Text style={styles.cellUnit}>V</Text>
						</View>
					</View>
				</View>
			</View>
		</View>
	);
}

function ResultCell({ label, value, size, accent, highlighted }) {
	const fontSize = size === "md" ? 20 : 16;
	return (
		<View style={[styles.cell, highlighted && styles.cellHighlighted]}>
			{highlighted ? <View style={styles.cellTopBar} /> : null}
			<Text
				style={[
					styles.cellLabel,
					highlighted && { color: colors.secondaryFixedDim },
				]}>
				{label}
			</Text>
			<Text
				style={[
					styles.cellValue,
					{ fontSize },
					accent ? { color: accent } : null,
				]}>
				{value}
			</Text>
		</View>
	);
}

function ToleransRow({ label, value }) {
	return (
		<View style={styles.toleransItem}>
			<Text style={styles.cellLabel}>{label}</Text>
			<Text style={styles.cellValueSm}>{value}</Text>
		</View>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Inputs
// ─────────────────────────────────────────────────────────────────────────────
function BigInput({ label, value, onChangeText, placeholder, ringColor }) {
	const [focused, setFocused] = useState(false);
	return (
		<View style={styles.inputCol}>
			<Text style={styles.label}>{label}</Text>
			<TextInput
				style={[
					styles.bigInput,
					{
						borderColor: focused
							? ringColor
							: colors.outlineVariant,
					},
				]}
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={`${colors.onSurfaceVariant}4D`}
				keyboardType="decimal-pad"
				selectionColor={ringColor}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
			/>
		</View>
	);
}

function SmallInput({ label, value, onChangeText, placeholder, ringColor }) {
	const [focused, setFocused] = useState(false);
	return (
		<View style={styles.inputCol}>
			<Text style={styles.label}>{label}</Text>
			<TextInput
				style={[
					styles.smallInput,
					{
						borderColor: focused
							? ringColor
							: colors.outlineVariant,
					},
				]}
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={`${colors.onSurfaceVariant}4D`}
				keyboardType="decimal-pad"
				selectionColor={ringColor}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
			/>
		</View>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Buttons
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
				color={disabled ? "#ffffff80" : colors.onPrimaryFixed}
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
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: colors.background },
	scroll: { backgroundColor: colors.background },
	content: {
		paddingHorizontal: spacing.marginMobile,
		paddingTop: spacing.lg,
		paddingBottom: 96,
		gap: spacing.lg,
	},

	// ---------- Header ----------
	headerBlock: { gap: spacing.sm },
	title: {
		fontFamily: "Inter",
		fontSize: 24,
		fontWeight: "600",
		color: colors.onSurface,
		lineHeight: 32,
	},
	subtitle: {
		fontFamily: "Inter",
		fontSize: 14,
		fontWeight: "400",
		color: colors.onSurfaceVariant,
		lineHeight: 20,
	},

	// ---------- Input Card ----------
	inputCard: {
		backgroundColor: colors.surfaceContainer,
		borderRadius: 12,
		padding: spacing.md,
		gap: spacing.xs,
		shadowColor: "#000",
		shadowOpacity: 0.04,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},
	row1: { flexDirection: "row", gap: spacing.md },
	row3: { flexDirection: "row", gap: spacing.sm },

	thinDivider: {
		height: 1,
		backgroundColor: `${colors.outlineVariant}4D`,
		marginVertical: spacing.xs,
	},

	inputCol: { flex: 1 },
	label: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 1,
		marginBottom: spacing.xs,
	},
	bigInput: {
		backgroundColor: colors.surfaceContainerLow,
		color: colors.onSurface,
		fontFamily: "Inter",
		fontSize: 20,
		fontWeight: "700",
		textAlign: "right",
		paddingHorizontal: spacing.sm,
		paddingVertical: spacing.sm,
		borderRadius: 8,
		borderWidth: 1,
		fontVariant: ["tabular-nums"],
	},
	smallInput: {
		backgroundColor: colors.surfaceContainerLow,
		color: colors.onSurface,
		fontFamily: "Inter",
		fontSize: 16,
		fontWeight: "700",
		textAlign: "center",
		paddingHorizontal: spacing.sm,
		paddingVertical: spacing.sm,
		borderRadius: 8,
		borderWidth: 1,
		fontVariant: ["tabular-nums"],
	},

	// ---------- Checkbox ----------
	checkboxRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		marginTop: spacing.base,
	},
	checkbox: {
		width: 16,
		height: 16,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: colors.outlineVariant,
		backgroundColor: colors.surfaceContainerLow,
		alignItems: "center",
		justifyContent: "center",
	},
	checkboxLabel: {
		fontFamily: "Inter",
		fontSize: 14,
		fontWeight: "400",
		color: colors.onSurface,
	},

	// ---------- Actions ----------
	actionsRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
	},

	// ---------- Divider ----------
	dividerRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.base,
		opacity: 0.7,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		borderTopWidth: 1,
		borderStyle: "dashed",
		borderColor: colors.outline,
	},
	dividerLabel: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.outline,
		letterSpacing: 2,
		textTransform: "uppercase",
	},

	// ---------- Results Card ----------
	resultsCard: {
		backgroundColor: colors.surfaceContainerHigh,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.surfaceContainerHighest,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOpacity: 0.08,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
	},
	resultSectionHeader: {
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		justifyContent: "center",
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: colors.surfaceContainerHighest,
	},
	resultSectionLabel: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 1.5,
		textTransform: "uppercase",
	},
	resultTriRow: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: colors.surfaceContainerHighest,
	},
	cell: {
		flex: 1,
		padding: spacing.sm,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.surfaceContainerLow,
		borderRightWidth: 1,
		borderRightColor: colors.surfaceContainerHighest,
		position: "relative",
	},
	cellHighlighted: {
		backgroundColor: `${colors.surfaceContainerLow}80`, // 50% alpha
	},
	cellTopBar: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 4,
		backgroundColor: colors.secondaryFixedDim,
	},
	cellLabel: {
		fontFamily: "Inter",
		fontSize: 10,
		fontWeight: "400",
		color: colors.onSurfaceVariant,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 4,
	},
	cellValue: {
		fontFamily: "Inter",
		fontWeight: "700",
		color: colors.onSurface,
		fontVariant: ["tabular-nums"],
	},
	cellValueSm: {
		fontFamily: "Inter",
		fontSize: 14,
		fontWeight: "700",
		color: colors.onSurface,
		fontVariant: ["tabular-nums"],
	},

	// ---------- Standart full-width row ----------
	standartRow: {
		paddingVertical: spacing.xs,
		paddingHorizontal: spacing.md,
		backgroundColor: colors.surfaceContainerLow,
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: colors.surfaceContainerHighest,
	},
	standartValue: {
		fontFamily: "Inter",
		fontSize: 28,
		fontWeight: "700",
		lineHeight: 28,
		fontVariant: ["tabular-nums"],
	},

	// ---------- Tolerans row ----------
	toleransRow: {
		flexDirection: "row",
	},
	toleransList: {
		flex: 1,
	},
	toleransItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.sm,
		backgroundColor: colors.surfaceContainerLow,
		borderBottomWidth: 1,
		borderBottomColor: colors.surfaceContainerHighest,
	},
	urmsBox: {
		width: "40%",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.sm,
		backgroundColor: colors.surfaceContainerLow,
		borderLeftWidth: 1,
		borderLeftColor: colors.surfaceContainerHighest,
	},
	urmsValue: {
		fontFamily: "Inter",
		fontSize: 22,
		fontWeight: "700",
		fontVariant: ["tabular-nums"],
	},
	cellUnit: {
		fontFamily: "Inter",
		fontSize: 22,
		color: colors.onSurfaceVariant,
		// marginTop: 4,
	},

	// ---------- Placeholder ----------
	placeholder: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.sm,
		backgroundColor: colors.surfaceContainer,
		borderRadius: 12,
		paddingVertical: spacing.lg,
		paddingHorizontal: spacing.md,
		borderWidth: 1,
		borderColor: colors.outlineVariant,
		borderStyle: "dashed",
	},
	placeholderText: {
		fontFamily: "Inter",
		fontSize: 13,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		flex: 1,
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

	// ---------- Error ----------
	infoCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
		backgroundColor: `${colors.info}1A`,
		borderColor: `${colors.info}55`,
		borderWidth: 1,
		borderRadius: 12,
		padding: spacing.sm,
	},
	infoText: {
		fontFamily: "Inter",
		fontSize: 13,
		color: colors.info,
		flex: 1,
		marginVertical: 10,
		paddingHorizontal: 6,
		textAlign: "center",
		fontWeight: "bold",
	},

	// ---------- Primary Button ----------
	primaryBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xs,
		backgroundColor: colors.primaryFixed,
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
		fontSize: 20,
		fontWeight: "600",
		color: colors.onPrimaryFixed,
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
		backgroundColor: "transparent",
		borderWidth: 1,
		borderColor: colors.outlineVariant,
		borderRadius: 999,
		paddingVertical: spacing.sm,
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
		fontSize: 14,
		fontWeight: "600",
		color: colors.onSurface,
		letterSpacing: 1.2,
		textTransform: "uppercase",
	},
	secondaryBtnTextDisabled: {
		color: "#ffffff80",
	},
});
