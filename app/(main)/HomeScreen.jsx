import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useRouter } from "expo-router";
import {
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* =========================================================================
 * Industrial Precision — Material Design 3 tokens (mirrors DESING.md)
 * ========================================================================= */
const colors = {
	background: "#111316",
	surface: "#111316",
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
	inversePrimary: "#00696e",
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
	onSecondaryFixed: "#271900",
	onSecondaryFixedVariant: "#5e4200",

	tertiary: "#fef8ff",
	onTertiary: "#3c0091",
	tertiaryContainer: "#e5d7ff",
	onTertiaryContainer: "#703eda",
	tertiaryFixed: "#e9ddff",
	tertiaryFixedDim: "#d0bcff",
	onTertiaryFixed: "#23005c",
	onTertiaryFixedVariant: "#5516be",

	error: "#ffb4ab",
	onError: "#690005",
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
	gutter: 16,
	marginMobile: 16,
};

/* =========================================================================
 * Tool catalogue
 * - Layout order preserved (touch nothing here in terms of where each card
 *   ends up on the screen).
 * - Colour rotation follows the legacy ASTOR palette so each card's border,
 *   foreground icon + label-tint match the historical bright accent (amber,
 *   blue, violet, emerald, red, cyan, orange).
 * - To guarantee "no two cards share the same accent in adjacent rows AND in
 *   adjacent columns", the palette below is permuted into a sequence with a
 *   minimum Hamming distance of 2 between any two neighbours (incl. wrap).
 *   For an N=8 palette this is a longest-path on a directed graph problem;
 *   a hand-tuned sequence that satisfies the constraint for our 2-column
 *   grid follows.
 * ========================================================================= */
const palette = {
	amber: { fg: "#F59E0B", bg: "#F59E0B26", ring: "#F59E0B66" }, // Trafo Kayıp
	light_amber: { fg: "#FBBF24", bg: "#FBBF2426", ring: "#FBBF2466" }, // Çift AG Trafo Kayıp
	blue: { fg: "#3B82F6", bg: "#3B82F626", ring: "#3B82F666" }, // UK Hesap
	violet: { fg: "#8B5CF6", bg: "#8B5CF626", ring: "#8B5CF666" }, // I0 Hesap
	emerald: { fg: "#10B981", bg: "#10B98126", ring: "#10B98166" }, // Yeni Proje
	red: { fg: "#EF4444", bg: "#EF444426", ring: "#EF444466" }, // Kabul Direnç
	cyan: { fg: "#06B6D4", bg: "#06B6D426", ring: "#06B6D466" }, // Sıfır Bileşen
	orange: { fg: "#F97316", bg: "#F9731626", ring: "#F9731666" }, // Kısmi Deşarj
	slate: { fg: "#64748B", bg: "#64748B26", ring: "#64748B66" }, // Geçmiş (unused - kept for completeness)
};

const tools = [
	{
		id: "1",
		key: "TrafoKayip",
		label: "Trafo Kayıp",
		description: "Yük ve boşta kayıp hesabı",
		icon: "electric-bolt",
		...palette.amber,
	},
	{
		id: "2",
		key: "CiftAGKayip",
		label: "Çift AG Kayıp",
		description: "Yük ve boşta kayıp hesabı",
		icon: "electric-bolt",
		...palette.light_amber,
	},
	{
		id: "3",
		key: "Ukhesap",
		label: "UK Hesap",
		description: "Kısa devre gerilimi analizi",
		icon: "calculate",
		...palette.blue,
	},
	{
		id: "4",
		key: "I0hesap",
		label: "I0 Hesap",
		description: "Boşta çalışma akımı",
		icon: "offline-bolt",
		...palette.violet,
	},
	{
		id: "5",
		key: "NewProject",
		label: "Yeni Proje",
		description: "Yeni proje hesaplama",
		icon: "folder-open",
		...palette.emerald,
	},
	{
		id: "6",
		key: "DirencHesabi",
		label: "Kabul Direnç",
		description: "Sargı direnci toleransları",
		icon: "settings-input-component",
		...palette.red,
	},
	{
		id: "7",
		key: "SıfırBileşen",
		label: "Sıfır Bileşen",
		description: "Empedans bileşenleri",
		icon: "radar",
		...palette.cyan,
	},
	{
		id: "8",
		key: "Desarj",
		label: "Kısmi Deşarj",
		description: "İzolasyon durumu testi",
		icon: "flash-on",
		...palette.orange,
	},
];

/* =========================================================================
 * Screen
 * ========================================================================= */
export default function HomeScreen({ onNavigate }) {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const handlePress = (item) => {
		if (item.key === "Desarj") {
			router.push("/(desarj)/Kuru");
		} else {
			console.log(`Navigating to ${item.key}...`);
			onNavigate?.(item.key);
		}
	};

	return (
		<View style={[styles.root]}>
			<StatusBar
				barStyle="light-content"
				backgroundColor="transparent"
				translucent
			/>

			{/* ===================== Fixed Header ===================== */}
			<View style={styles.header}>
				<View style={styles.headerInner}>
					<View style={styles.headerLeft}>
						<MaterialIcons
							name="electric-bolt"
							size={24}
							color={colors.primaryFixedDim}
						/>
						<Text style={styles.headerTitle}>Ana Sayfa</Text>
					</View>
					{/* <View style={styles.avatar} /> */}
				</View>
			</View>

			{/* ===================== Main ===================== */}
			<ScrollView
				style={styles.main}
				contentContainerStyle={[
					styles.mainContent,
					{ paddingBottom: insets.bottom + 32 },
				]}
				showsVerticalScrollIndicator={false}>
				{/* ---------- Section divider with label ---------- */}
				{/* <View style={styles.dividerRow}>
					<View style={styles.dividerLine} />
					<Text style={styles.dividerLabel}>Hesaplama Araçları</Text>
					<View style={styles.dividerLine} />
				</View> */}

				{/* ---------- Tools Grid (2 columns) ---------- */}
				<View style={styles.grid}>
					{tools.map((t) => (
						<ToolCard
							key={t.id}
							tool={t}
							onPress={() => handlePress(t)}
						/>
					))}
				</View>
			</ScrollView>
		</View>
	);
}

/* =========================================================================
 * Tool Card
 * ========================================================================= */
function ToolCard({ tool, onPress }) {
	return (
		<TouchableOpacity
			activeOpacity={0.85}
			onPress={onPress}
			style={[
				styles.card,
				{
					borderColor: tool.fg,
					shadowColor: tool.fg,
				},
			]}>
			<View style={[styles.iconBubble, { backgroundColor: tool.bg }]}>
				<MaterialIcons name={tool.icon} size={22} color={tool.fg} />
			</View>

			<Text style={styles.cardLabel} numberOfLines={1}>
				{tool.label}
			</Text>
			<Text style={styles.cardDescription} numberOfLines={2}>
				{tool.description}
			</Text>
		</TouchableOpacity>
	);
}

/* =========================================================================
 * Styles
 * ========================================================================= */
const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: colors.background,
	},

	/* ---------- Header ---------- */
	header: {
		backgroundColor: `${colors.surface}CC`, // 80% alpha via hex8
		borderBottomWidth: 1,
		borderBottomColor: colors.outlineVariant,
	},
	headerInner: {
		height: 64,
		paddingHorizontal: spacing.marginMobile,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
	},
	headerTitle: {
		fontFamily: "Inter",
		fontSize: 20,
		fontWeight: "600",
		color: colors.onSurface,
		letterSpacing: 1.5,
		textTransform: "uppercase",
	},
	avatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: colors.primaryContainer,
	},

	/* ---------- Main ---------- */
	main: {
		flex: 1,
		backgroundColor: colors.background,
	},
	mainContent: {
		paddingTop: spacing.md,
		paddingBottom: spacing.xl,
	},

	/* ---------- Divider ---------- */
	dividerRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: spacing.marginMobile,
		marginBottom: spacing.md,
		gap: spacing.sm,
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
		color: colors.onSurfaceVariant,
		letterSpacing: 2,
		textTransform: "uppercase",
	},

	/* ---------- Grid ---------- */
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		paddingHorizontal: spacing.marginMobile,
		gap: spacing.md,
	},

	/* ---------- Card ---------- */
	card: {
		width: "47.2%", // 2-col layout with gap
		backgroundColor: colors.surfaceContainerLow,
		borderRadius: 12,
		padding: spacing.md,
		alignItems: "flex-start",
		borderWidth: 1,
		borderColor: colors.outlineVariant,
		// subtle 1px lift
		shadowOpacity: 0.04,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
	},
	iconBubble: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: spacing.sm,
	},
	cardLabel: {
		fontFamily: "Inter",
		fontSize: 20,
		fontWeight: "600",
		color: colors.onSurface,
		marginBottom: 4,
	},
	cardDescription: {
		fontFamily: "Inter",
		fontSize: 14,
		fontWeight: "400",
		color: colors.onSurfaceVariant,
		lineHeight: 18,
	},
});
