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
	secondaryFixedDim: "#ffba20",

	tertiary: "#fef8ff",

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
// Input field configuration
// ─────────────────────────────────────────────────────────────────────────────
const FIELDS = [
	{
		id: "power",
		key: "guc",
		label: "Power (kVA)",
		placeholder: "e.g. 1000",
		icon: "bolt",
		setter: "setGuc",
	},
	{
		id: "lv-voltage",
		key: "agGerilimi",
		label: "LV Voltage (kV)",
		placeholder: "e.g. 0.4",
		icon: "flash-on",
		setter: "setAgGerilimi",
	},
	{
		id: "noload-current",
		key: "kademeAkimi",
		label: "No-load Current (A)",
		placeholder: "e.g. 2.5",
		icon: "timeline",
		setter: "setKademeAkimi",
	},
];

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function I0Hesap({ showToast }) {
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

	function hesapla() {
		const gucValue = parseNum(guc);
		const agGerilimiValue = parseNum(agGerilimi);
		const kademeAkimiValue = parseNum(kademeAkimi);

		if (
			!isFinite(gucValue) ||
			!isFinite(agGerilimiValue) ||
			!isFinite(kademeAkimiValue) ||
			gucValue <= 0 ||
			agGerilimiValue <= 0
		) {
			setError(true);
			setResult(null);
			return;
		}

		const agAkimi = gucValue / (agGerilimiValue * Math.sqrt(3));
		const i0 = (kademeAkimiValue / agAkimi) * 100;

		setError(false);
		setResult(i0);
	}

	function temizle() {
		setGuc("");
		setAgGerilimi("");
		setKademeAkimi("");
		setError(false);
		setResult(null);
		showToast && showToast("Temizlendi!", "bottom", "info");
	}

	return (
		<KeyboardAvoidingView
			style={styles.root}
			behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.content}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}>
				{/* ═══════════════════════ Input Section ═══════════════════════ */}
				<View style={styles.inputCard}>
					{/* Decorative watermark icon (top-right, 5% alpha) */}
					<View style={styles.watermark} pointerEvents="none">
						<MaterialIcons
							name="electric-meter"
							size={120}
							color={`${colors.onSurfaceVariant}0D`}
						/>
					</View>

					<View style={styles.inputCardInner}>
						<Text style={styles.inputSectionLabel}>
							Giriş Değerleri
						</Text>

						<View style={styles.fieldStack}>
							<IconField
								icon="bolt"
								label="Güç (kVA)"
								value={guc}
								onChangeText={setGuc}
								placeholder="e.g. 1000"
							/>
							<IconField
								icon="flash-on"
								label="AG Gerilimi (kV)"
								value={agGerilimi}
								onChangeText={setAgGerilimi}
								placeholder="e.g. 0.4"
							/>
							<IconField
								icon="timeline"
								label="Boşta Akım Değeri (A)"
								value={kademeAkimi}
								onChangeText={setKademeAkimi}
								placeholder="e.g. 2.5"
							/>
						</View>
					</View>
				</View>

				{/* ═══════════════════════ Action Buttons ═══════════════════════ */}
				<View style={styles.actionsRow}>
					<SecondaryBtn
						text="Temizle"
						icon="delete-sweep"
						onPress={temizle}
					/>
					<PrimaryBtn
						text="Hesapla"
						icon="calculate"
						onPress={hesapla}
						style={{ flex: 2 }}
					/>
				</View>

				{/* ═══════════════════════ Divider ═══════════════════════ */}
				{/* <View style={styles.dividerRow}>
					<View style={styles.dividerLine} />
					<Text style={styles.dividerLabel}>Results</Text>
					<View style={styles.dividerLine} />
				</View> */}

				{/* ═══════════════════════ Result Card ═══════════════════════ */}
				{result !== null ? (
					<ResultCard i0Value={result} />
				) : (
					<View style={styles.resultPlaceholder}>
						<MaterialIcons
							name="calculate"
							size={48}
							color={colors.onSurfaceVariant}
						/>
						<Text style={styles.resultPlaceholderText}>
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
// Result Card — dark teal hero (bg onPrimary = #003739)
// ─────────────────────────────────────────────────────────────────────────────
function ResultCard({ i0Value }) {
	return (
		<View style={styles.resultCard}>
			{/* Decorative corner shape */}
			<View style={styles.resultCorner} pointerEvents="none" />

			<View style={styles.resultCardInner}>
				{/* Header row */}
				<View style={styles.resultHeader}>
					<View style={styles.resultHeaderText}>
						<Text style={styles.resultKicker}>Sonuç</Text>
						{/* <Text style={styles.resultSubtitle}>
							Calculated based on provided inputs
						</Text> */}
					</View>
					<View style={styles.checkBadge}>
						<MaterialIcons
							name="check-circle"
							size={24}
							color={colors.primaryFixed}
						/>
					</View>
				</View>

				{/* Metric grid */}
				<View style={styles.metricGrid}>
					<MetricTile
						label="I₀ Değeri (%)"
						value={i0Value.toFixed(4)}
						accent={colors.primaryFixed}
					/>
				</View>
			</View>
		</View>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Metric Tile (inner card with left accent bar)
// ─────────────────────────────────────────────────────────────────────────────
function MetricTile({ label, value, accent }) {
	const [hovered, setHovered] = useState(false);
	return (
		<Pressable
			onPressIn={() => setHovered(true)}
			onPressOut={() => setHovered(false)}
			style={styles.metricTile}>
			<View
				style={[
					styles.metricAccent,
					{
						backgroundColor: accent,
						width: hovered ? 8 : 4,
					},
				]}
			/>
			<Text style={styles.metricLabel}>{label}</Text>
			<Text style={[styles.metricValue, { color: accent }]}>
				{value} %
			</Text>
		</Pressable>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Icon Field — group focus-within pattern
// ─────────────────────────────────────────────────────────────────────────────
function IconField({ icon, label, value, onChangeText, placeholder }) {
	const [focused, setFocused] = useState(false);
	const iconColor = focused
		? colors.primaryFixedDim
		: colors.onSurfaceVariant;

	return (
		<View>
			<Text
				style={[
					styles.fieldLabel,
					focused && { color: colors.primaryFixedDim },
				]}>
				{label}
			</Text>
			<View style={styles.inputShell}>
				<MaterialIcons
					name={icon}
					size={20}
					color={iconColor}
					style={styles.inputIcon}
				/>
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
				size={24}
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
				size={24}
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

	// ---------- Input Card ----------
	inputCard: {
		backgroundColor: colors.surfaceContainer,
		borderRadius: 16,
		padding: spacing.md,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOpacity: 0.04,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
		position: "relative",
	},
	watermark: {
		position: "absolute",
		right: -48,
		top: -48,
	},
	inputCardInner: {
		gap: spacing.md,
	},
	inputSectionLabel: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 2,
		textTransform: "uppercase",
	},
	fieldStack: { gap: spacing.lg },

	// ---------- Field ----------
	fieldLabel: {
		fontFamily: "Inter",
		fontSize: 14,
		fontWeight: "400",
		color: colors.onSurfaceVariant,
		marginBottom: spacing.xs,
	},
	inputShell: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.surfaceContainerLowest,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "transparent",
		paddingHorizontal: spacing.sm,
		paddingVertical: spacing.sm,
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},
	inputIcon: {
		marginRight: spacing.sm,
	},
	input: {
		flex: 1,
		fontFamily: "Inter",
		fontSize: 16,
		fontWeight: "400",
		color: colors.onSurface,
		paddingVertical: 0,
		fontVariant: ["tabular-nums"],
	},

	// ---------- Actions ----------
	actionsRow: {
		flexDirection: "row",
		gap: spacing.md,
	},

	// ---------- Divider ----------
	dividerRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
		paddingVertical: spacing.xs,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		borderTopWidth: 1,
		borderStyle: "dashed",
		borderColor: colors.outlineVariant,
	},
	dividerLabel: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.outline,
		letterSpacing: 2,
		textTransform: "uppercase",
	},

	// ---------- Result Card (dark teal hero) ----------
	resultCard: {
		backgroundColor: colors.onPrimary, // #003739 — dark teal
		borderRadius: 16,
		padding: spacing.md,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOpacity: 0.15,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 4 },
		elevation: 4,
		position: "relative",
	},
	resultCorner: {
		position: "absolute",
		right: 0,
		top: 0,
		width: 128,
		height: 128,
		backgroundColor: `${colors.primaryFixed}0D`, // 5% alpha
		borderBottomLeftRadius: 999,
	},
	resultCardInner: { gap: spacing.lg },
	resultHeader: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
	},
	resultHeaderText: { flex: 1 },
	resultKicker: {
		fontFamily: "Inter",
		fontSize: 20,
		fontWeight: "600",
		color: colors.primaryFixed,
		letterSpacing: 2,
		textTransform: "uppercase",
		marginBottom: 4,
	},
	resultSubtitle: {
		fontFamily: "Inter",
		fontSize: 14,
		fontWeight: "400",
		color: `${colors.primary}CC`, // 80% alpha primary
	},
	checkBadge: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: `${colors.primaryFixed}33`, // 20% alpha
		alignItems: "center",
		justifyContent: "center",
	},

	// ---------- Metric grid ----------
	metricGrid: {
		flexDirection: "row",
		gap: spacing.md,
	},
	metricTile: {
		flex: 1,
		backgroundColor: `${colors.surfaceContainerLowest}4D`, // 30% alpha on dark teal
		borderRadius: 12,
		padding: spacing.md,
		position: "relative",
		overflow: "hidden",
	},
	metricAccent: {
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
	},
	metricLabel: {
		fontFamily: "Inter",
		fontSize: 14,
		fontWeight: "400",
		color: `${colors.primary}B3`, // 70% alpha
		marginBottom: 4,
		marginLeft: 8,
	},
	metricValue: {
		fontFamily: "Inter",
		fontSize: 28,
		fontWeight: "700",
		lineHeight: 34,
		marginLeft: 8,
		fontVariant: ["tabular-nums"],
	},

	// ---------- Result Placeholder ----------
	resultPlaceholder: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.sm,
		backgroundColor: colors.surfaceContainer,
		borderRadius: 16,
		paddingVertical: spacing.lg,
		paddingHorizontal: spacing.md,
		borderWidth: 1,
		borderColor: colors.outlineVariant,
		borderStyle: "dashed",
	},
	resultPlaceholderText: {
		fontFamily: "Inter",
		fontSize: 13,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		flex: 1,
	},

	// ---------- Reference card ----------
	referenceCard: {
		height: 128,
		borderRadius: 16,
		overflow: "hidden",
		backgroundColor: colors.surfaceContainerHigh,
		marginTop: spacing.md,
		justifyContent: "center",
		alignItems: "center",
	},
	referenceOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: `${colors.surfaceContainer}B3`, // 70% surface-container
	},
	referenceContent: {
		alignItems: "center",
		gap: spacing.xs,
		zIndex: 1,
	},
	referenceLabel: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 2,
		textTransform: "uppercase",
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

	// ---------- Primary button ----------
	primaryBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xs,
		backgroundColor: colors.primaryFixed,
		borderRadius: 12,
		paddingVertical: spacing.md,
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
		fontSize: 22,
		fontWeight: "600",
		color: colors.onPrimaryFixed,
	},
	primaryBtnTextDisabled: {
		color: "#ffffff80",
	},

	// ---------- Secondary button ----------
	secondaryBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xs,
		backgroundColor: colors.surfaceContainerHigh,
		borderRadius: 12,
		paddingVertical: spacing.md,
		shadowColor: "#000",
		shadowOpacity: 0.04,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},
	secondaryBtnPressed: {
		opacity: 0.7,
		backgroundColor: colors.surfaceContainerHighest,
	},
	secondaryBtnDisabled: {
		opacity: 0.4,
	},
	secondaryBtnText: {
		fontFamily: "Inter",
		fontSize: 20,
		fontWeight: "600",
		color: colors.onSurface,
	},
	secondaryBtnTextDisabled: {
		color: "#ffffff80",
	},
});
