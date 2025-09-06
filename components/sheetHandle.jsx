import { AntDesign } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

// sheetIndex prop'unu alacak şekilde güncellendi
const SheetHandle = ({ sheetIndex, onPress }) => {
	const [fontsLoaded] = useFonts({
		...AntDesign.font,
	});
	// sheetIndex değeri 0'dan büyükse, sheet açık demektir
	const isSheetOpen = sheetIndex > 0;

	// Duruma göre ikon adını belirle
	const iconName = isSheetOpen ? "down" : "up";
	if (!fontsLoaded) {
		return null;
	}
	return (
		<TouchableOpacity
			onPress={onPress}
			// style={styles.handleContainer}
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
	handleContainer: {
		// flex: 1,
		// display: "flex",
		// flexDirection: "row",
		// alignItems: "center",
		// justifyContent: "center",
		// paddingVertical: 0,
	},
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
