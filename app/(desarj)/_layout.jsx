import { DryTransformerIcon } from "@/components/icons/DryTransformerIcon";
import { OilTransformerIcon } from "@/components/icons/OilTransformerIcon";
import { ToastProvider } from "@/context/ToastContext";
import AppHeader from "@components/AppHeader"; // path'i düzenle
import { Tabs } from "expo-router";
import { StatusBar, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DesarjLayout() {
	return (
		<ToastProvider>
			<SafeAreaView style={styles.container}>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<StatusBar
						barStyle="light-content"
						backgroundColor="#000"
					/>

					{/* Aynı Header Component */}
					<AppHeader
						title="Kısmi Deşarj Hesabı"
						showBackButton={true}
					/>

					<Tabs
						screenOptions={{
							headerShown: false,
							tabBarStyle: {
								backgroundColor: "#1A1A1A",
								borderTopColor: "#333",
								height: 60,
								paddingTop: 2,
							},
							tabBarActiveTintColor: "#E10600",
							tabBarInactiveTintColor: "#8E8E93",
							sceneContainerStyle: {
								backgroundColor: "#222831",
							},
							tabBarLabelStyle: {
								fontSize: 14,
								fontWeight: "600",
								// marginTop: 4,
							},
						}}>
						<Tabs.Screen
							name="Kuru"
							options={{
								title: "Kuru Tip",
								tabBarIcon: ({ color, size }) => (
									<DryTransformerIcon
										color={color}
										size={32}
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
										size={32}
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#222831",
	},
});
