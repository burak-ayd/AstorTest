import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useRouter } from "expo-router";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const menuItems = [
	{
		id: "1",
		label: "Trafo Kayıp",
		description: "Trafo yükte kayıp hesaplayıcı",
		key: "TrafoKayip",
		icon: "electric-bolt",
		color: "#F59E0B",
		bgColor: "#F59E0B18",
		borderColor: "#F59E0B40",
	},
	{
		id: "2",
		label: "UK Hesap",
		description: "Trafo kısa devre gerilimi (Uk%) hesaplama",
		key: "Ukhesap",
		icon: "calculate",
		color: "#3B82F6",
		bgColor: "#3B82F618",
		borderColor: "#3B82F640",
	},
	{
		id: "3",
		label: "I0 Hesap",
		description: "Trafo boşta çalışma akımı (I0%) hesaplama",
		key: "I0hesap",
		icon: "power",
		color: "#8B5CF6",
		bgColor: "#8B5CF618",
		borderColor: "#8B5CF640",
	},
	{
		id: "4",
		label: "Yeni Proje",
		description: "Yeni proje hesaplama ve analiz",
		key: "NewProject",
		icon: "folder-open",
		color: "#10B981",
		bgColor: "#10B98118",
		borderColor: "#10B98140",
	},
	{
		id: "5",
		label: "Kabul Direnç",
		description: "Kabul direnci hesaplama",
		key: "DirencHesabi",
		icon: "settings-input-component",
		color: "#EF4444",
		bgColor: "#EF444418",
		borderColor: "#EF444440",
	},
	{
		id: "6",
		label: "Sıfır Bileşen",
		description: "Sıfır bileşen hesabı",
		key: "SıfırBileşen",
		icon: "radar",
		color: "#06B6D4",
		bgColor: "#06B6D418",
		borderColor: "#06B6D440",
	},
	{
		id: "7",
		label: "Kısmi Deşarj",
		description: "Kuru ve yağlı tip trafo deşarj hesabı",
		key: "Desarj",
		icon: "flash-on",
		color: "#F97316",
		bgColor: "#F9731618",
		borderColor: "#F9731640",
	},
	{
		id: "8",
		label: "Geçmiş",
		description: "Hesaplama geçmişini görüntüle",
		key: "History",
		icon: "history",
		color: "#64748B",
		bgColor: "#64748B18",
		borderColor: "#64748B40",
	},
	// {
	// 	id: "9",
	// 	label: "Güncelleme",
	// 	description: "Uygulama güncellemelerini kontrol et",
	// 	key: "OtaUpdate",
	// 	icon: "system-update",
	// 	color: "#EC4899",
	// 	bgColor: "#EC489918",
	// 	borderColor: "#EC489940",
	// },
];

export default function HomeScreen({ onNavigate }) {
	const router = useRouter();

	const handlePress = (item) => {
		if (item.key === "Desarj") {
			router.push("/(desarj)/Kuru");
		} else {
			onNavigate(item.key);
		}
	};

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.contentContainer}
			showsVerticalScrollIndicator={false}>
			{/* Hero Section */}
			<View style={styles.heroSection}>
				<View style={styles.logoContainer}>
					<MaterialIcons
						name="electric-bolt"
						size={36}
						color="#F59E0B"
					/>
				</View>
				<Text style={styles.heroTitle}>
					Trafo Test Hesaplama Araçları
				</Text>
				{/* <Text style={styles.heroSubtitle}>
					Trafo kabul test hesaplamalarını hızlı ve doğru yapın
				</Text> */}
			</View>

			{/* Divider */}
			<View style={styles.divider} />

			{/* Section Title */}
			{/* <Text style={styles.sectionTitle}>Hesaplama Araçları</Text> */}

			{/* Menu Grid */}
			<View style={styles.grid}>
				{menuItems.map((item) => (
					<TouchableOpacity
						key={item.id}
						style={[
							styles.card,
							{
								borderColor: item.borderColor,
								backgroundColor: item.bgColor,
							},
						]}
						onPress={() => handlePress(item)}
						activeOpacity={0.75}>
						{/* Icon */}
						<View
							style={[
								styles.iconWrapper,
								{
									backgroundColor: item.bgColor,
									borderColor: item.borderColor,
								},
							]}>
							<MaterialIcons
								name={item.icon}
								size={28}
								color={item.color}
							/>
						</View>

						{/* Text */}
						<View style={styles.cardTextContainer}>
							<Text
								style={[
									styles.cardLabel,
									{ color: item.color },
								]}>
								{item.label}
							</Text>
							<Text
								style={styles.cardDescription}
								numberOfLines={2}>
								{item.description}
							</Text>
						</View>

						{/* Arrow */}
						<MaterialIcons
							name="chevron-right"
							size={22}
							color={item.color}
							style={styles.cardArrow}
						/>
					</TouchableOpacity>
				))}
			</View>

			{/* Footer */}
			{/* <View style={styles.footer}>
				<Text style={styles.footerText}>ASTOR Elektrik A.Ş.</Text>
				<Text style={styles.footerVersion}>Trafo Kabul Test v1.0</Text>
			</View> */}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#0F1117",
	},
	contentContainer: {
		paddingBottom: 32,
	},

	// Hero
	heroSection: {
		alignItems: "center",
		paddingTop: 28,
		paddingBottom: 20,
		paddingHorizontal: 20,
	},
	logoContainer: {
		width: 70,
		height: 70,
		borderRadius: 20,
		backgroundColor: "#F59E0B18",
		borderWidth: 1.5,
		borderColor: "#F59E0B55",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 14,
	},
	heroTitle: {
		fontSize: 24,
		fontWeight: "800",
		color: "#F1F5F9",
		letterSpacing: 0.5,
		textAlign: "center",
	},
	heroSubtitle: {
		fontSize: 13,
		color: "#64748B",
		marginTop: 6,
		textAlign: "center",
		lineHeight: 19,
		paddingHorizontal: 16,
	},

	// Divider
	divider: {
		height: 1,
		backgroundColor: "#1E293B",
		marginHorizontal: 20,
		marginBottom: 20,
	},

	// Section
	sectionTitle: {
		fontSize: 12,
		fontWeight: "700",
		color: "#475569",
		letterSpacing: 1.5,
		textTransform: "uppercase",
		marginHorizontal: 20,
		marginBottom: 12,
	},

	// Grid
	grid: {
		paddingHorizontal: 12,
		gap: 8,
	},

	// Card
	card: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderRadius: 14,
		paddingVertical: 14,
		paddingHorizontal: 14,
		gap: 14,
	},
	iconWrapper: {
		width: 50,
		height: 50,
		borderRadius: 14,
		borderWidth: 1,
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	cardTextContainer: {
		flex: 1,
	},
	cardLabel: {
		fontSize: 15,
		fontWeight: "700",
		letterSpacing: 0.2,
		marginBottom: 2,
	},
	cardDescription: {
		fontSize: 12,
		color: "#64748B",
		lineHeight: 16,
	},
	cardArrow: {
		flexShrink: 0,
		opacity: 0.8,
	},

	// Footer
	footer: {
		alignItems: "center",
		marginTop: 32,
		paddingTop: 20,
		borderTopWidth: 1,
		borderTopColor: "#1E293B",
		marginHorizontal: 20,
	},
	footerText: {
		fontSize: 13,
		fontWeight: "700",
		color: "#334155",
		letterSpacing: 0.5,
	},
	footerVersion: {
		fontSize: 11,
		color: "#1E293B",
		marginTop: 3,
	},
});
