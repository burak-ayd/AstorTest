import { useToast } from "@/context/ToastContext";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useCallback, useMemo, useState } from "react";
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

const SQRT3 = Math.sqrt(3);

// Yağlı-tipi deşarj çarpanları (IEC 60076-3 standardına yakın)
const YAGLI_FACTORS = [
	{ label: "0.4", multiplier: 0.4 },
	{ label: "1.2", multiplier: 1.2 },
	{ label: "1.58", multiplier: 1.58 },
	{ label: "2.0", multiplier: 2.0 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function Yagli() {
	const { showToast } = useToast();
	const [gerilim, setGerilim] = useState("");

	const fmt = useCallback(
		(x, digits = 1) =>
			!isFinite(x)
				? "0,0"
				: x.toLocaleString("tr-TR", {
						minimumFractionDigits: digits,
						maximumFractionDigits: digits,
					}),
		[],
	);

	const numericResults = useMemo(() => {
		const g = parseNum(gerilim);
		if (!isFinite(g)) return null;
		return YAGLI_FACTORS.map(({ label, multiplier }) => ({
			label,
			value: (multiplier * g) / SQRT3,
		}));
	}, [gerilim]);

	function parseNum(v) {
		if (typeof v !== "string") return NaN;
		return Number(v.trim().replace(/,/g, "."));
	}

	function temizle() {
		setGerilim("");
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
				{/* ═══════════ Input Card ═══════════ */}
				<View style={styles.inputCard}>
					<View
						style={[
							styles.topAccent,
							{
								backgroundColor: `${colors.primaryFixedDim}80`,
							},
						]}
					/>

					{/* Quick select */}
					<View style={styles.fieldStack}>
						<Text style={styles.labelXs}>Hızlı Seçim (kV/V)</Text>
						<View style={styles.quickGrid}>
							<QuickBtn
								label="33 kV"
								value="33"
								onPress={setGerilim}
							/>
							<QuickBtn
								label="20 kV"
								value="20"
								onPress={setGerilim}
							/>
							<QuickBtn
								label="15 kV"
								value="15"
								onPress={setGerilim}
							/>
							<QuickBtn
								label="400 V"
								value="400"
								onPress={setGerilim}
								variant="neutral"
							/>
							<QuickBtn
								label="420 V"
								value="420"
								onPress={setGerilim}
								variant="neutral"
							/>
							<QuickBtn
								label="416 V"
								value="416"
								onPress={setGerilim}
								variant="neutral"
							/>
						</View>
					</View>

					{/* Manual input */}
					<View>
						<Text style={styles.labelXs}>Gerilim (kV)</Text>
						<View style={styles.inputShell}>
							<TextInput
								style={styles.input}
								value={gerilim}
								onChangeText={setGerilim}
								placeholder="0"
								placeholderTextColor={`${colors.onSurfaceVariant}4D`}
								keyboardType="decimal-pad"
								selectionColor={colors.primaryFixedDim}
							/>
						</View>
					</View>

					{/* Actions */}
					<View style={styles.actionsRow}>
						<SecondaryBtn
							text="Temizle"
							icon="delete-sweep"
							onPress={temizle}
						/>
						{/* <PrimaryBtn
							text="Hesapla"
							icon="bolt"
							onPress={() => {}}
							style={{ flex: 2 }}
						/> */}
					</View>
				</View>

				{/* ═══════════ Results Section ═══════════ */}
				{gerilim !== "" && (
					<View style={styles.resultsSection}>
						<View style={styles.dividerRow}>
							<View style={styles.dividerLineLeft} />
							<Text style={styles.dividerLabel}>Sonuçlar</Text>
							<View style={styles.dividerLineRight} />
						</View>

						<View style={styles.resultStack}>
							{numericResults
								? numericResults.map((r) => (
										<ResultBar
											key={r.label}
											label={r.label}
											value={fmt(r.value, 1)}
										/>
									))
								: null}
						</View>
					</View>
				)}
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick Select Button
// ─────────────────────────────────────────────────────────────────────────────
function QuickBtn({ label, value, onPress, variant = "primary" }) {
	const [pressed, setPressed] = useState(false);
	const isPrimary = variant === "primary";
	const composed = useMemo(() => {
		return (
			StyleSheet.flatten([
				styles.quickBtn,
				isPrimary ? styles.quickBtnPrimary : styles.quickBtnNeutral,
				pressed ? styles.quickBtnPressed : null,
			]) || styles.quickBtn
		);
	}, [variant, pressed, isPrimary]);

	return (
		<Pressable
			onPress={() => onPress(value)}
			style={composed}
			onPressIn={() => setPressed(true)}
			onPressOut={() => setPressed(false)}
			android_ripple={{ color: "#ffffff10" }}>
			<Text
				style={[
					styles.quickBtnText,
					isPrimary
						? { color: colors.primaryFixed }
						: { color: colors.onSurface },
				]}>
				{label}
			</Text>
		</Pressable>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Result Bar (HTML: bg-surface-container-lowest + 4px secondary accent + hover-fill)
// ─────────────────────────────────────────────────────────────────────────────
function ResultBar({ label, value }) {
	const [hovered, setHovered] = useState(false);
	return (
		<Pressable
			onPressIn={() => setHovered(true)}
			onPressOut={() => setHovered(false)}
			style={styles.resultBar}>
			<View
				style={[
					styles.resultBarFill,
					{
						backgroundColor: `${colors.secondary}0D`,
						width: hovered ? "100%" : "0%",
					},
				]}
			/>
			<View
				style={[
					styles.resultBarAccent,
					{ backgroundColor: colors.secondary },
				]}
			/>
			<View style={styles.resultBarContent}>
				<Text
					style={[
						styles.resultBarLabel,
						{ color: colors.secondaryFixedDim },
					]}>
					{label}
				</Text>
				<View style={styles.resultBarValueRow}>
					<Text style={styles.resultBarValue}>{value}</Text>
					<Text style={styles.resultBarUnit}>V</Text>
				</View>
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
	fieldStack: { gap: spacing.xs },

	labelXs: {
		fontFamily: "Inter",
		fontSize: 10,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 1.5,
		textTransform: "uppercase",
	},

	quickGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing.xs,
	},
	quickBtn: {
		flexBasis: "31%",
		flexGrow: 1,
		minWidth: 80,
		paddingVertical: spacing.xs,
		borderRadius: 8,
		borderWidth: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	quickBtnPrimary: {
		backgroundColor: `${colors.primary}1A`,
		borderColor: `${colors.primary}33`,
	},
	quickBtnNeutral: {
		backgroundColor: colors.surfaceBright,
		borderColor: `${colors.outlineVariant}80`,
	},
	quickBtnPressed: {
		transform: [{ scale: 0.97 }],
		opacity: 0.85,
	},
	quickBtnText: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "400",
	},

	inputShell: {
		flexDirection: "row",
		alignItems: "center",
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
		fontFamily: "Inter",
		fontSize: 14,
		fontWeight: "400",
		color: colors.onSurface,
		paddingHorizontal: spacing.xs,
		paddingVertical: spacing.base,
		fontVariant: ["tabular-nums"],
	},

	actionsRow: {
		flexDirection: "row",
		gap: spacing.md,
		marginTop: spacing.xs,
		paddingTop: spacing.sm,
		borderTopWidth: 1,
		borderTopColor: colors.surfaceContainerHighest,
	},

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
	resultStack: { gap: spacing.sm },

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
		fontSize: 14,
		fontWeight: "600",
		letterSpacing: 0.5,
	},
	resultBarValueRow: {
		flexDirection: "row",
		alignItems: "baseline",
		gap: spacing.xs,
		marginTop: 4,
	},
	resultBarValue: {
		fontFamily: "Inter",
		fontSize: 18,
		fontWeight: "700",
		color: colors.onSurface,
		fontVariant: ["tabular-nums"],
	},
	resultBarUnit: {
		fontFamily: "Inter",
		fontSize: 14,
		fontWeight: "400",
		color: colors.onSurfaceVariant,
		marginLeft: 4,
	},

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
