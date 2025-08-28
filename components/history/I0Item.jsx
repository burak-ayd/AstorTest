import {
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function I0Item({
	refreshing,
	onRefresh,
	handleDeleteItem,
	EmptyList,
	history,
}) {
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
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<View style={styles.historyItem}>
						<View style={styles.firstRow}>
							<Text style={styles.timestamp}>
								{item.timestamp}
							</Text>
							<TouchableOpacity
								style={styles.deleteButton}
								onPress={() => handleDeleteItem(item.id)}>
								<Text style={styles.deleteButtonText}>Sil</Text>
							</TouchableOpacity>
						</View>
						<Text style={styles.historyItemText}>
							Uk: {item.uk}
						</Text>
						<Text style={styles.historyItemText}>
							Güç: {item.cg}, Çıkılan Akım: {item.ca}, AG Gerilim:{" "}
							{item.kg}, I0: {item.na}
						</Text>
					</View>
				)}
				ListEmptyComponent={EmptyList}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
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
		marginTop: 5,
		alignSelf: "flex-start",
		backgroundColor: "#ff4d4d",
		paddingHorizontal: 10,
		paddingVertical: 5,
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
