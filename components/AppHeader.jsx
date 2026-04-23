// components/AppHeader.jsx
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AppHeader({
	title,
	onMenuPress,
	showBackButton = false,
	showHomeButton = false,
	onHomePress,
}) {
	const router = useRouter();

	return (
		<View style={styles.header}>
			{/* Sol buton - sabit 48px */}
			{/* <TouchableOpacity
				onPress={showBackButton ? () => router.back() : onMenuPress}
				style={styles.sideButton}>
				<MaterialIcons
					name={showBackButton ? "arrow-back" : "menu"}
					size={26}
					color="#94A3B8"
				/>
			</TouchableOpacity> */}
			<View style={styles.sideButton} />

			{/* Başlık - flex:1 ile tam ortada */}
			<View style={styles.titleContainer}>
				<Text style={styles.headerTitle} numberOfLines={1}>
					{title}
				</Text>
			</View>

			{/* Sağ buton - sabit 48px (simetri için her zaman render edilir) */}
			{showHomeButton && onHomePress ? (
				<TouchableOpacity
					onPress={onHomePress}
					style={styles.sideButton}>
					<MaterialIcons name="home" size={26} color="#F59E0B" />
				</TouchableOpacity>
			) : (
				<View style={styles.sideButton} />
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		height: 54,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#0F1117",
		borderBottomWidth: 1,
		borderBottomColor: "#1E293B",
		paddingHorizontal: 4,
	},
	sideButton: {
		width: 48,
		height: 48,
		alignItems: "center",
		justifyContent: "center",
	},
	titleContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	headerTitle: {
		fontSize: 17,
		fontWeight: "700",
		color: "#F1F5F9",
		letterSpacing: 0.3,
		textAlign: "center",
	},
});
