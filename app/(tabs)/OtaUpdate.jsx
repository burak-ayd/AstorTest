import { useCheckVersion } from "@/scripts/useCheckVersion";
import { Button, StyleSheet, Text, View } from "react-native";
export default function OtaUpdate() {
	const { version } = useCheckVersion();

	return (
		<View style={styles.container}>
			<Text className="text-text text-lg">{`Version: ${version.state.version}`}</Text>
			<Button
				title={"check update OTA"}
				onPress={version.onCheckVersion}
			/>

			{version.state.loading && (
				<Text className="text-text text-lg">Loading from git...</Text>
			)}
			{!!version.state.progress && (
				<View style={styles.progress}>
					<View
						style={[
							styles.process,
							{
								width: `${version.state.progress}%`,
							},
						]}
					/>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
	},
	box: {
		width: 60,
		height: 60,
		marginVertical: 20,
	},
	progress: {
		height: 10,
		width: "80%",
		marginTop: 20,
		borderRadius: 8,
		borderColor: "grey",
		borderWidth: 1,
		overflow: "hidden",
	},
	process: {
		height: 10,
		backgroundColor: "blue",
	},
	img: {
		width: 180,
		height: 180,
		resizeMode: "contain",
		marginBottom: 20,
	},
});
