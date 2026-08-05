import { DryTransformerIcon } from "@/components/icons/DryTransformerIcon";
import { OilTransformerIcon } from "@/components/icons/OilTransformerIcon";
import { ToastProvider } from "@/context/ToastContext";
import AppHeader from "@components/AppHeader";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { BackHandler, StatusBar, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";

// ─────────────────────────────────────────────────────────────────────────────
// Industrial Precision — MD3 tokens (mirrors DESING.md)
// ─────────────────────────────────────────────────────────────────────────────
const colors = {
	background: "#111316",
	surface: "#111316",
	surfaceContainer: "#1e2023",
	surfaceContainerHigh: "#282a2d",
	surfaceContainerHighest: "#333538",
	onSurface: "#e2e2e6",
	onSurfaceVariant: "#b9caca",
	outlineVariant: "#3a494a",
	primaryFixedDim: "#00dce5",
};

const spacing = {
	xs: 8,
	sm: 12,
	md: 16,
};

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────
export default function DesarjLayout() {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	// Android back button handler — HomeScreen'e dön
	useEffect(() => {
		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			() => {
				router.push("/(main)/HomeScreen");
				return true;
			},
		);

		return () => backHandler.remove();
	}, [router]);

	// Bottom tab bar — height includes safe-area inset for home indicator
	const TAB_BASE_HEIGHT = 72;
	const tabBarHeight = TAB_BASE_HEIGHT + insets.bottom;

	return (
		<ToastProvider>
			<SafeAreaView style={styles.container} edges={["top"]}>
				<GestureHandlerRootView style={styles.flex}>
					<StatusBar
						barStyle="light-content"
						backgroundColor={colors.background}
						translucent
					/>

					{/* Header — same component as elsewhere */}
					<AppHeader
						title="Kısmi Deşarj Hesabı"
						showBackButton={true}
					/>

					<Tabs
						screenOptions={{
							headerShown: false,
							tabBarStyle: {
								...styles.tabBar,
								height: tabBarHeight,
								paddingBottom: insets.bottom,
							},
							tabBarActiveTintColor: colors.primaryFixedDim,
							tabBarInactiveTintColor: colors.onSurfaceVariant,
							tabBarItemStyle: styles.tabBarItem,
							tabBarLabelStyle: styles.tabBarLabel,
							sceneContainerStyle: styles.scene,
							tabBarHideOnKeyboard: true,
						}}>
						<Tabs.Screen
							name="Kuru"
							options={{
								title: "Kuru Tip",
								tabBarIcon: ({ color, size }) => (
									<DryTransformerIcon
										color={color}
										size={size}
									/>
								),
							}}
						/>
						<Tabs.Screen
							name="Yagli"
							options={{
								title: "Yağlı Tip",
								tabBarIcon: ({ color, size }) => (
									<OilTransformerIcon
										color={color}
										size={size}
									/>
								),
							}}
						/>
					</Tabs>
				</GestureHandlerRootView>
			</SafeAreaView>
		</ToastProvider>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	flex: { flex: 1 },

	// ─── Tab bar (matches HTML's bg-surface-container/90 backdrop-blur) ───
	tabBar: {
		// MD3 nav-bar: tonal + translucent + safe-area inset for bottom
		// Height & paddingBottom are computed dynamically (insets-aware).
		backgroundColor: `${colors.surfaceContainer}E6`, // 90% alpha on hex8
		borderTopWidth: 1,
		borderTopColor: colors.surfaceContainerHighest,
		paddingTop: spacing.xs,
		// Subtle elevation (dark-mode: barely visible shadow + tonal layer)
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: -2 },
		elevation: 8,
	},
	tabBarItem: {
		paddingVertical: spacing.xs,
	},
	tabBarLabel: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		letterSpacing: 1,
		textTransform: "uppercase",
		marginTop: 4,
	},

	// ─── Scene container ───
	scene: {
		backgroundColor: colors.background,
	},
});