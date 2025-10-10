import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const SheetHandle = ({ sheetIndex, onPress }) => {
	// sheetIndex değeri 0'dan büyükse, sheet açık demektir
	const isSheetOpen = sheetIndex > 0;
	const iconName = isSheetOpen ? "keyboard-arrow-down" : "keyboard-arrow-up";

	return (
		<TouchableOpacity
			onPress={onPress}
			className="flex flex-row justify-center items-center mt-4 md:mt-2">
			<Text style={styles.handleText}>Menü </Text>
			<MaterialIcons
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
