import AppHeader from "@components/AppHeader"; // path'i düzenle
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function DesarjLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaView style={styles.container}>
				<StatusBar barStyle="light-content" backgroundColor="#000" />

				{/* Aynı Header Component */}
				<AppHeader title="Kısmi Deşarj Hesabı" showBackButton={true} />

				<Tabs
					screenOptions={{
						headerShown: false,
						tabBarStyle: {
							backgroundColor: "#1A1A1A",
							borderTopColor: "#333",
						},
						tabBarActiveTintColor: "#4CAF50",
						tabBarInactiveTintColor: "#888",
						sceneContainerStyle: {
							backgroundColor: "#222831",
						},
					}}>
					<Tabs.Screen
						name="Kuru"
						options={{
							title: "Kuru Tip",
							tabBarIcon: ({ color, size }) => (
								<MaterialIcons
									name="grid-on"
									size={size}
									color={color}
								/>
							),
						}}
					/>
					<Tabs.Screen
						name="Yagli"
						options={{
							title: "Yağlı Tip",
							tabBarIcon: ({ color, size }) => (
								<MaterialIcons
									name="opacity"
									size={size}
									color={color}
								/>
							),
						}}
					/>
				</Tabs>

				<Toast />
			</SafeAreaView>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
