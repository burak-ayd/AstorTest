import {
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function TkItem({
	refreshing,
	onRefresh,
	handleDeleteItem,
	EmptyList,
	history,
}) {
	const button = (id) => (
		<TouchableOpacity
			style={styles.deleteButton}
			onPress={() => handleDeleteItem(id)}>
			<Text style={styles.deleteButtonText}>Sil</Text>
		</TouchableOpacity>
	);

	const renderItem = ({ item }) => {
		const fields = [
			{ label: "Tarih", value: item.timestamp },
			{ label: "Sargı Tipi", value: item.sargiTipi },
			{ label: "", value: button(item.id) },
			{ label: "Güç", value: item.guc + " kVA" },
			{ label: "Kademe Ger.", value: item.kademeGerilimi + " kV" },
			{ label: "AG Ger.", value: item.agGerilimi + " kV" },
			{ label: "Ref Temp", value: item.refTemp + " °C" },
			{ label: "Direnç Temp", value: item.direncTemp + " °C" },
			{ label: "Yükte Temp", value: item.yukteTemp + " °C" },
			{ label: "Direnç AB", value: item.direncAB + " Ω" },
			{ label: "Direnç BC", value: item.direncBC + " Ω" },
			{ label: "Direnç CA", value: item.direncCA + " Ω" },
			{ label: "Direnç ab", value: item.direncab + " mΩ" },
			{ label: "Direnç bc", value: item.direncbc + " mΩ" },
			{ label: "Direnç ca", value: item.direncca + " mΩ" },
			{ label: "Kayıp", value: item.kayip + " W" },
			{ label: "Çık. Akım", value: item.cikilanAkim + " A" },
			{ label: "Çık. Gerilim", value: item.cikilanGerilim + " V" },
			{ label: "Pac", value: item.pac + " W" },
			{ label: "Pk", value: item.pk + " W" },
			{ label: "Uk", value: item.uk + " %" },
		];

		return (
			<View style={styles.card2}>
				<View style={styles.grid}>
					{fields.map((f, index) => (
						<View key={index} style={styles.cell}>
							{f.label ? (
								<Text style={styles.label}>{f.label}</Text>
							) : (
								""
							)}
							<Text style={styles.value}>{f.value}</Text>
						</View>
					))}
				</View>
			</View>
		);
	};
	return (
		<View style={styles.card}>
			<FlatList
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
					/>
				}
				contentContainerStyle={{ alignSelf: "stretch" }}
				data={history}
				renderItem={renderItem}
				keyExtractor={(item, index) => index.toString()}
				ListEmptyComponent={EmptyList}
			/>
		</View>
	);
}

// const newEntry = {
// 			timestamp: now.toLocaleString("tr-TR"),
// 			guc: gucValue,
// 			kademeGerilimi: kademeGerilimiValue,
// 			agGerilimi: agGerilimiValue,
// 			sargiTipi: sargiTipiValue,
// 			refTemp: refTempValue,
// 			direncTemp: direncTempValue,
// 			yukteTemp: yukteTempValue,
// 			direncAB: direncABValue,
// 			direncBC: direncBCValue,
// 			direncCA: direncCAValue,
// 			direncab: direncabValue,
// 			direncbc: direncbcValue,
// 			direncca: direnccaValue,
// 			kayip: kayipValue,
// 			cikilanAkim: cikilanAkimValue,
// 			cikilanGerilim: cikilanGerilimValue,
// 		};

const styles = StyleSheet.create({
	card2: {
		backgroundColor: "#fff",
		marginBottom: 4,
		padding: 10,
		borderRadius: 10,
		elevation: 3,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	cell: {
		width: "33.33%", // 3 sütun
		padding: 4,
		borderWidth: 0.5,
		borderColor: "#ccc",
		alignItems: "center",
		justifyContent: "center",
	},
	label: {
		fontWeight: "bold",
		fontSize: 12,
		color: "#0b1020",
	},
	value: {
		fontSize: 12,
		color: "#333",
	},
	contentContainer: {
		padding: 12,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
	},

	card: {
		paddingHorizontal: 12,
		flex: 1,
		marginBottom: 60,
		// display: "flex",
		// flexDirection: "column",
		// gap: 1,
		// maxHeight: 420,
		// overflowY: "auto",
		// backgroundColor: "#fff",
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#fff",
		alignSelf: "center",
	},
	firstRow: {
		// alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
		display: "flex",
	},
	historyItem: {
		backgroundColor: "rgba(255, 255, 255, 0.05)",
		borderWidth: 1,
		borderColor: "rgba(255, 255, 255, 0.1)",
		borderRadius: 12,
		marginBottom: 4,
		padding: 12,
		transitionDuration: 0.2,
		transitionProperty: "backgroundColor",
		transitionTimingFunction: "ease",
	},
	historyItemText: {
		color: "#fff",
		fontWeight: "medium",
	},
	timestamp: {
		color: "#4da3ff",
		fontWeight: "medium",
		fontSize: 18,
	},
	deleteButton: {
		backgroundColor: "#ff4d4d",
		padding: 4,
		borderRadius: 5,
	},
	allDeleteButton: {
		// marginTop: 5,
		backgroundColor: "rgba(255, 107, 107, 0.25)",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
		borderWidth: 1,
		fontWeight: 700,
		borderColor: "rgba(255, 107, 107, 0.4)",
		color: "#ffbaba",
	},
	allDeleteButtonDisabled: {
		backgroundColor: "rgba(200, 200, 200, 0.25)", // disabled arkaplan rengi
		borderColor: "rgba(200, 200, 200, 0.4)",
		fontWeight: 200,
	},
	Button: {
		// marginTop: 5,
		backgroundColor: "rgba(255, 107, 107, 0.25)",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
		borderWidth: 1,
		fontWeight: 700,
		borderColor: "rgba(255, 107, 107, 0.4)",
		color: "#ffbaba",
	},
	deleteButtonText: {
		color: "#fff",
		fontWeight: "bold",
		padding: 4,
	},
	emptyListText: {
		color: "#fff",
		textAlign: "center",
		marginTop: 20,
		fontSize: 16,
		fontWeight: "normal",
	},
});
