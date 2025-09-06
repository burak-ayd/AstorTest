import AntDesign from "@expo/vector-icons/AntDesign";
import { useFonts } from "expo-font";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const SheetHandle = ({ sheetIndex, onPress }) => {
	// AntDesign ikonları için doğru font yükleme
	const [fontsLoaded] = useFonts({
		...AntDesign.font, // paket ile uyumlu font mapping
	});

	if (!fontsLoaded) {
		return null; // font yüklenene kadar boş render
	}

	const isSheetOpen = sheetIndex > 0;
	const iconName = isSheetOpen ? "down" : "up";

	return (
		<TouchableOpacity
			onPress={onPress}
			className="flex flex-row justify-center items-center mt-4 md:mt-2">
			<Text style={styles.handleText}>Menü </Text>
			<AntDesign
				name={iconName}
				size={24}
				color="#333"
				style={styles.icon}
			/>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	icon: {
		marginLeft: 8,
	},
	handleText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#333",
	},
});

export default SheetHandle;
