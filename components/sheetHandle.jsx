import { AntDesign } from "@react-native-vector-icons/ant-design";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const SheetHandle = ({ sheetIndex, onPress }) => {
<<<<<<< HEAD
=======
	// 1. yöntem: manuel kopyalanan TTF dosyasını kullanıyoruz
	const [fontsLoaded] = useFonts({
		AntDesign: require("../assets/fonts/AntDesign.ttf"),
	});

	if (!fontsLoaded) {
		return null; // Font yüklenene kadar render etme
	}

>>>>>>> a4d85c089036a7f0f2387bdd049249470d26c793
	// sheetIndex değeri 0'dan büyükse, sheet açık demektir
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
