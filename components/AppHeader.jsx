// components/AppHeader.jsx
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppHeader({
	title,
	onMenuPress,
	showBackButton = false,
}) {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.header, { paddingTop: insets.top }]}>
			<TouchableOpacity
				onPress={showBackButton ? () => router.back() : onMenuPress}
				style={styles.menuButton}>
				<MaterialIcons
					name={showBackButton ? "arrow-back" : "menu"}
					size={32}
					color="#fff"
				/>
			</TouchableOpacity>
			<Text style={styles.headerTitle}>{title}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		height: 50,
		paddingHorizontal: 2,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#111",
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#fff",
		flex: 1,
		textAlign: "center",
		marginRight: 42,
	},
	menuButton: {
		paddingHorizontal: 10,
	},
});
