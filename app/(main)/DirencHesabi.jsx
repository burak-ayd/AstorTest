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
	onPrimaryFixedVariant: "#004f53",

	secondary: "#ffdb9d",
	onSecondary: "#412d00",
	secondaryContainer: "#feb700",
	onSecondaryContainer: "#6b4b00",
	secondaryFixed: "#ffdea8",
	secondaryFixedDim: "#ffba20",

	tertiary: "#fef8ff",
	tertiaryContainer: "#e5d7ff",
	tertiaryFixedDim: "#d0bcff",

	error: "#ffb4ab",
	errorContainer: "#93000a",
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
// Screen
// ─────────────────────────────────────────────────────────────────────────────
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [olculenKayip, istenenKayip, kademeAkimi]);

	function parseNum(v) {
		if (typeof v !== "string") return NaN;
		v = v.trim().replace(/\s+/g, "").replace(/\./g, "").replace(/,/g, ".");
		return Number(v);
	}

	function hesapla() {
		const olculenKayipValue = parseNum(olculenKayip);
		const istenenKayipValue = parseNum(istenenKayip);
		const kademeAkimiValue = parseNum(kademeAkimi);

		if (
			!isFinite(olculenKayipValue) ||
			!isFinite(istenenKayipValue) ||
			!isFinite(kademeAkimiValue) ||
			kademeAkimiValue <= 0
		) {
			setError(true);
			setResult(null);
			return;
		}

		// Original IEC compensating-resistance formula (mantık korundu)
		const a = (olculenKayipValue - istenenKayipValue) / 3;
		const direncValue = a / kademeAkimiValue ** 2;

		setError(false);
		setResult(direncValue);
	}

	function temizle() {
		setOlculenKayip("");
		setIstenenKayip("");
		setKademeAkimi("");
		setError(false);
		setResult(null);
		showToast && showToast("Temizlendi!", "bottom", "info");
	}

	const fmt = useCallback((x, digits = 2) => {
		if (!isFinite(x)) return "0,00";
		return x.toLocaleString("tr-TR", {
			minimumFractionDigits: digits,
			maximumFractionDigits: digits,
		});
	}, []);

	return (
		<KeyboardAvoidingView
			style={styles.root}
			behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.content}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}>
				{/* ═══════════ Input Section ═══════════ */}
				<View style={styles.section}>
					{/* Inputs Card */}
					<View style={styles.inputCard}>
						{/* Header bar */}
						<View
							style={[
								styles.cardHeader,
								{ backgroundColor: `${colors.primaryFixed}0D` },
							]}>
							<View
								style={[
									styles.cardAccentBar,
									{ backgroundColor: colors.primaryFixed },
								]}
							/>
							<Text
								style={[
									styles.cardHeaderLabel,
									{ color: `${colors.primaryFixed}CC` },
								]}>
								DEĞERLER
							</Text>
						</View>

						{/* Body */}
						<View style={styles.cardBody}>
							<InputField
								label="Ölçülen Kayıp"
								value={olculenKayip}
								onChangeText={setOlculenKayip}
								placeholder="1000 W"
							/>
							<InputField
								label="İstenen Kayıp"
								value={istenenKayip}
								onChangeText={setIstenenKayip}
								placeholder="1200 W"
							/>
							<InputField
								label="Çıkılacak Akım"
								value={kademeAkimi}
								onChangeText={setKademeAkimi}
								placeholder="10 A"
							/>
						</View>
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
							onPress={hesapla}
							style={{ flex: 2 }}
						/> */}
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
				</View>

				{/* ═══════════ Results Section ═══════════ */}
				<View style={[styles.section, styles.resultsSection]}>
					{/* Divider */}
					<View style={styles.dividerRow}>
						<View style={styles.dividerLineLeft} />
						<Text style={styles.dividerLabel}>SONUÇ</Text>
						<View style={styles.dividerLineRight} />
					</View>

					{/* Result bar */}
					{result !== null ? (
						<View style={styles.resultBar}>
							{/* Left 4px accent */}
							<View
								style={[
									styles.resultAccentBar,
									{
										backgroundColor: colors.primaryFixed,
									},
								]}
							/>

							<View style={styles.resultContent}>
								<View style={styles.resultHeaderRow}>
									<Text style={styles.resultMeta}>
										Girilmesi gereken direnç değeri
									</Text>
									<View style={styles.calculatedBadge}>
										<MaterialIcons
											name="check"
											size={12}
											color={colors.primaryFixed}
										/>
										<Text
											style={styles.calculatedBadgeText}>
											Hesaplandı
										</Text>
									</View>
								</View>
								<View style={styles.resultValueRow}>
									<Text
										style={[
											styles.resultNumber,
											{ color: colors.primaryFixed },
										]}>
										{fmt(result, 2)}
									</Text>
									<Text
										style={[
											styles.resultUnit,
											{
												color: `${colors.primaryFixed}B3`,
											},
										]}>
										Ω
									</Text>
								</View>
							</View>
						</View>
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
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Input Field — group focus-within pattern
// ─────────────────────────────────────────────────────────────────────────────
function InputField({ label, value, onChangeText, placeholder }) {
	const [focused, setFocused] = useState(false);
	return (
		<View>
			<Text
				style={[
					styles.fieldLabel,
					focused && { color: colors.primaryFixedDim },
				]}>
				{label}
			</Text>
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
				color={disabled ? "#ffffff80" : colors.onSurfaceVariant}
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
	},
	section: {
		gap: spacing.md,
	},
	resultsSection: {
		marginTop: spacing.md,
		paddingTop: spacing.md,
		borderTopWidth: 1,
		borderTopColor: colors.surfaceContainerHighest,
	},

	// ---------- Input Card ----------
	inputCard: {
		backgroundColor: colors.surfaceContainer,
		borderRadius: 12,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOpacity: 0.08,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: spacing.sm,
		paddingVertical: 4,
		position: "relative",
		borderBottomWidth: 1,
	},
	cardAccentBar: {
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		width: 3,
	},
	cardHeaderLabel: {
		fontFamily: "Inter",
		fontSize: 11,
		fontWeight: "600",
		letterSpacing: 1.2,
		textTransform: "uppercase",
	},
	cardBody: {
		padding: spacing.sm,
		gap: spacing.sm,
	},

	// ---------- Field ----------
	fieldLabel: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 1,
		textTransform: "uppercase",
		marginBottom: spacing.base,
	},
	inputShell: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.surfaceContainerLowest,
		borderRadius: 8,
		padding: spacing.xs,
		borderWidth: 1,
		borderColor: colors.surfaceContainer,
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},
	input: {
		flex: 1,
		minWidth: 100,
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
		paddingTop: spacing.sm,
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
	},
	resultAccentBar: {
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		width: 4,
	},
	resultContent: {
		flex: 1,
		paddingLeft: spacing.sm,
	},
	resultHeaderRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		gap: spacing.sm,
	},
	resultMeta: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 1,
		textTransform: "uppercase",
		flex: 1,
	},
	calculatedBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		backgroundColor: `${colors.surfaceContainer}80`, // 50% on dark teal surface
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: `${colors.primaryFixed}4D`,
	},
	calculatedBadgeText: {
		fontFamily: "Inter",
		fontSize: 10,
		fontWeight: "600",
		color: colors.primaryFixed,
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

	// ---------- Placeholder ----------
	resultPlaceholder: {
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
	resultPlaceholderText: {
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
		fontSize: 12,
		fontWeight: "600",
		color: colors.onPrimaryFixed,
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
		color: colors.onSurfaceVariant,
		letterSpacing: 1.2,
		textTransform: "uppercase",
	},
	secondaryBtnTextDisabled: {
		color: "#ffffff80",
	},
});
