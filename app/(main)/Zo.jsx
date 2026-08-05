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
	onPrimaryFixed: "#002021",

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

// Result accent configurations
const RESULT_ACCENTS = {
	i0: { fg: colors.primary, wash: `${colors.primary}0D` },
	z0: { fg: colors.secondary, wash: `${colors.secondary}0D` },
	Z0: { fg: colors.tertiaryFixedDim, wash: `${colors.tertiaryFixedDim}0D` },
};

const SQRT3 = Math.sqrt(3);

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function SıfırBileşenHesabı({ showToast }) {
	const [guc, setGuc] = useState("");
	const [yildizGerilimi, setYildizGerilimi] = useState("");
	const [cikilanGerilim, setCikilanGerilim] = useState("");
	const [cikilanAkim, setCikilanAkim] = useState("");

	const [resultI0, setResultI0] = useState(null);
	const [resultz0, setResultz0] = useState(null);
	const [resultZ0, setResultZ0] = useState(null);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (guc && yildizGerilimi) {
			hesaplaI0();
		}
		if (cikilanAkim && cikilanGerilim) {
			const z0Ham = hesaplaz0();
			if (guc && yildizGerilimi && z0Ham !== null) {
				hesaplaZ0(z0Ham);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [guc, yildizGerilimi, cikilanAkim, cikilanGerilim]);

	function parseNum(v) {
		if (typeof v !== "string") return NaN;
		v = v.trim().replace(/\s+/g, "").replace(/\./g, "").replace(/,/g, ".");
		return Number(v);
	}

	function hesaplaI0() {
		const gucValue = parseNum(guc);
		const yildizGerilimiValue = parseNum(yildizGerilimi);

		if (!isFinite(gucValue) || !isFinite(yildizGerilimiValue)) {
			setError(true);
			setResultI0(null);
			return;
		}

		const I0 = gucValue / yildizGerilimiValue / SQRT3 / 3;
		setError(false);
		setResultI0(I0);
	}

	function hesaplaz0() {
		const cikilanGerilimValue = parseNum(cikilanGerilim);
		const cikilanAkimValue = parseNum(cikilanAkim);

		if (
			!isFinite(cikilanGerilimValue) ||
			!isFinite(cikilanAkimValue) ||
			cikilanAkimValue === 0
		) {
			setResultz0(null);
			return null;
		}

		const z0 = (cikilanGerilimValue * 3) / cikilanAkimValue;
		setResultz0(z0);
		return isFinite(z0) ? z0 : null;
	}

	function hesaplaZ0(z0Ham) {
		const gucValue = parseNum(guc);
		const yildizGerilimiValue = parseNum(yildizGerilimi);

		if (
			!isFinite(gucValue) ||
			!isFinite(yildizGerilimiValue) ||
			yildizGerilimiValue === 0
		) {
			setResultZ0(null);
			return;
		}

		const Inominal = gucValue / yildizGerilimiValue / SQRT3;
		const Z0 =
			(z0Ham * Inominal * 100) / ((yildizGerilimiValue * 1000) / SQRT3);
		setResultZ0(Z0);
	}

	function temizle() {
		setGuc("");
		setYildizGerilimi("");
		setCikilanAkim("");
		setCikilanGerilim("");
		setError(false);
		setResultI0(null);
		setResultz0(null);
		setResultZ0(null);
		showToast && showToast("Temizlendi!", "bottom", "info");
	}

	// Formatting is now done inside <ResultBar> to avoid calling
	// toLocaleString on a null/undefined value at parent render time.

	return (
		<KeyboardAvoidingView
			style={styles.root}
			behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.content}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}>
				{/* ═══════════ Inputs Card (2x2 grid) ═══════════ */}
				<View style={styles.inputCard}>
					<View
						style={[
							styles.topAccent,
							{
								backgroundColor: `${colors.primaryFixedDim}80`,
							},
						]}
					/>

					<View style={styles.inputGrid}>
						<CompactField
							label="Güç (kVA)"
							value={guc}
							onChangeText={setGuc}
							placeholder="2500 kVA"
						/>
						<CompactField
							label="Yıldız Noktası Gerilimi (kV)"
							value={yildizGerilimi}
							onChangeText={setYildizGerilimi}
							placeholder="0,4 kV"
						/>
						<CompactField
							label="Çıkılan Gerilim (V)"
							value={cikilanGerilim}
							onChangeText={setCikilanGerilim}
							placeholder="0,4 V"
						/>
						<CompactField
							label="Çıkılan Akım (A)"
							value={cikilanAkim}
							onChangeText={setCikilanAkim}
							placeholder="10 A"
						/>
					</View>

					{/* Actions */}
					<View style={styles.actionsRow}>
						<SecondaryBtn
							text="Temizle"
							icon="clear-all"
							onPress={temizle}
						/>
						{/* <PrimaryBtn
							text="Hesapla"
							icon="calculate"
							onPress={() => {
								if (guc && yildizGerilimi) hesaplaI0();
								if (cikilanAkim && cikilanGerilim) {
									const z0Ham = hesaplaz0();
									if (
										guc &&
										yildizGerilimi &&
										z0Ham !== null
									) {
										hesaplaZ0(z0Ham);
									}
								}
							}}
							style={{ flex: 2 }}
						/> */}
					</View>
				</View>

				{/* ═══════════ Results Section ═══════════ */}
				<View style={styles.resultsSection}>
					<View style={styles.dividerRow}>
						<View style={styles.dividerLineLeft} />
						<Text style={styles.dividerLabel}>Sonuçlar</Text>
						<View style={styles.dividerLineRight} />
					</View>

					<View style={styles.resultStack}>
						<ResultBar
							accent={RESULT_ACCENTS.i0}
							label="Çıkılacak Akım Değeri"
							subLabel="Akım (A)"
							value={resultI0}
							digits={4}
							unit="A"
						/>
						<ResultBar
							accent={RESULT_ACCENTS.z0}
							label="z0 Değeri"
							subLabel="z0 (%)"
							value={resultz0}
							digits={4}
							unit="%"
						/>
						<ResultBar
							accent={RESULT_ACCENTS.Z0}
							label="Z0 Değeri"
							subLabel="Uk'ya yakın olmalı — Z0 (%)"
							value={resultZ0}
							digits={4}
							unit="%"
						/>
					</View>
				</View>

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
// Compact Field (2x2 grid, 10px label)
// ─────────────────────────────────────────────────────────────────────────────
function CompactField({ label, value, onChangeText, placeholder }) {
	const [focused, setFocused] = useState(false);
	return (
		<View style={styles.fieldCol}>
			<Text
				style={[
					styles.fieldLabelXs,
					focused && { color: colors.primaryFixedDim },
				]}>
				{label}
			</Text>
			<View
				style={[
					styles.inputShell,
					focused && {
						backgroundColor: colors.surfaceContainerHighest,
						borderColor: `${colors.primaryFixed}4D`,
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
// Result Bar (matches HTML's bg-surface-container-lowest + 4px accent + hover-fill)
// ─────────────────────────────────────────────────────────────────────────────
function ResultBar({ accent, label, subLabel, value, unit, digits = 4 }) {
	const [hovered, setHovered] = useState(false);

	// Guard: hide bar when value is null/undefined/NaN.
	// This MUST happen before any toLocaleString / numeric format call,
	// otherwise React will throw at the parent's render stage.
	if (value === null || value === undefined || !isFinite(value)) {
		return null;
	}

	// Safe to format now that we know value is a finite number.
	const formatted = value.toLocaleString("tr-TR", {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
	});

	return (
		<Pressable
			onPressIn={() => setHovered(true)}
			onPressOut={() => setHovered(false)}
			style={styles.resultBar}>
			{/* Hover wash fill */}
			<View
				style={[
					styles.resultBarFill,
					{
						backgroundColor: accent.wash,
						width: hovered ? "100%" : "0%",
					},
				]}
			/>
			{/* Left 4px accent */}
			<View
				style={[styles.resultBarAccent, { backgroundColor: accent.fg }]}
			/>
			{/* Content */}
			<View style={styles.resultBarContent}>
				<Text style={styles.resultBarLabel}>{label}</Text>
				<Text style={styles.resultBarSubLabel}>{subLabel}</Text>
			</View>
			<View style={styles.resultBarValueRow}>
				<Text style={[styles.resultBarValue, { color: accent.fg }]}>
					{formatted}
				</Text>
				<Text
					style={[styles.resultBarUnit, { color: `${accent.fg}B3` }]}>
					{unit}
				</Text>
			</View>
		</Pressable>
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
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: colors.background },
	scroll: { backgroundColor: colors.background },
	content: {
		paddingHorizontal: spacing.sm,
		paddingTop: spacing.md,
		paddingBottom: 96,
		gap: spacing.md,
	},

	// ---------- Input Card ----------
	inputCard: {
		backgroundColor: colors.surfaceContainer,
		borderRadius: 12,
		padding: spacing.sm,
		gap: spacing.sm,
		overflow: "hidden",
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
	inputGrid: {
		flexDirection: "column",
		flexWrap: "nowrap",
		gap: spacing.xs,
	},
	fieldCol: {
		flexBasis: "48%",
		flexGrow: 1,
		minWidth: 140,
	},
	fieldLabelXs: {
		fontFamily: "Inter",
		fontSize: 14,
		fontWeight: "400",
		color: colors.onSurfaceVariant,
		textTransform: "none",
		letterSpacing: 0,
		marginBottom: spacing.base,
	},
	inputShell: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.surfaceContainerLowest,
		borderRadius: 8,
		padding: spacing.xs,
		borderWidth: 1,
		borderColor: "transparent",
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},
	input: {
		flex: 1,
		minWidth: 80,
		backgroundColor: "transparent",
		fontFamily: "Inter",
		fontSize: 14,
		fontWeight: "400",
		color: colors.onSurface,
		paddingHorizontal: spacing.xs,
		paddingVertical: spacing.base,
		fontVariant: ["tabular-nums"],
	},

	// ---------- Actions ----------
	actionsRow: {
		flexDirection: "row",
		gap: spacing.md,
		marginTop: spacing.xs,
		paddingTop: spacing.xs,
		borderTopWidth: 1,
		borderTopColor: colors.surfaceContainerHighest,
	},

	// ---------- Results Section ----------
	resultsSection: { gap: spacing.sm, marginTop: spacing.sm },
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
		letterSpacing: 2,
		textTransform: "uppercase",
	},
	resultStack: { gap: spacing.xs },

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
		flex: 1,
		paddingLeft: spacing.sm,
		zIndex: 1,
	},
	resultBarLabel: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "400",
		color: colors.onSurface,
	},
	resultBarSubLabel: {
		fontFamily: "Inter",
		fontSize: 10,
		fontWeight: "400",
		color: colors.onSurfaceVariant,
		marginTop: 2,
	},
	resultBarValueRow: {
		flexDirection: "row",
		alignItems: "baseline",
		gap: 4,
		zIndex: 1,
	},
	resultBarValue: {
		fontFamily: "Inter",
		fontSize: 20,
		fontWeight: "700",
		lineHeight: 28,
		letterSpacing: -0.5,
		fontVariant: ["tabular-nums"],
	},
	resultBarUnit: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		marginLeft: 4,
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
