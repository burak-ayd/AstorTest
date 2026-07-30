// components/UpdateScreen.jsx
import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function UpdateScreen({ status, progress = 0 }) {
	const [pulseAnim] = React.useState(new Animated.Value(1));

	React.useEffect(() => {
		// Pulse animasyonu
		Animated.loop(
			Animated.sequence([
				Animated.timing(pulseAnim, {
					toValue: 1.2,
					duration: 1000,
					useNativeDriver: true,
				}),
				Animated.timing(pulseAnim, {
					toValue: 1,
					duration: 1000,
					useNativeDriver: true,
				}),
			]),
		).start();
	}, []);

	const getStatusIcon = () => {
		if (status.includes("kontrol")) return "🔍";
		if (status.includes("indiriliyor")) return "📥";
		if (status.includes("yükleniyor") || status.includes("yükleyici"))
			return "⚙️";
		if (status.includes("başarılı")) return "✅";
		if (status.includes("hata")) return "❌";
		return "⏳";
	};

	const getProgressPercentage = () => {
		if (status.includes("kontrol")) return 10;
		if (status.includes("bulundu")) return 20;
		if (status.includes("indiriliyor")) return 50;
		if (status.includes("yükleniyor")) return 80;
		if (status.includes("yükleyici")) return 95;
		return progress;
	};

	const progressPercentage = getProgressPercentage();

	return (
		<LinearGradient
			colors={["#0f172a", "#1e293b", "#0f172a"]}
			style={styles.container}>
			{/* Logo veya App Icon */}
			<Animated.View
				style={[
					styles.iconContainer,
					{ transform: [{ scale: pulseAnim }] },
				]}>
				<Text style={styles.iconText}>{getStatusIcon()}</Text>
			</Animated.View>

			{/* App Name */}
			<Text style={styles.appName}>AstorTest2</Text>

			{/* Status Text */}
			<Text style={styles.statusText}>{status}</Text>

			{/* Progress Bar Container */}
			<View style={styles.progressBarContainer}>
				<View style={styles.progressBarBackground}>
					<Animated.View
						style={[
							styles.progressBarFill,
							{ width: `${progressPercentage}%` },
						]}
					/>
					<LinearGradient
						colors={["rgba(59, 130, 246, 0.3)", "transparent"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						style={[
							styles.progressBarGlow,
							{ width: `${progressPercentage}%` },
						]}
					/>
				</View>
				<Text style={styles.progressText}>{progressPercentage}%</Text>
			</View>

			{/* Info Text */}
			<View style={styles.infoContainer}>
				<Text style={styles.infoText}>
					🔒 Güvenli güncelleme yapılıyor
				</Text>
				<Text style={styles.infoSubText}>
					Lütfen uygulamayı kapatmayın
				</Text>
			</View>

			{/* Decorative elements */}
			<View style={styles.decorativeCircle1} />
			<View style={styles.decorativeCircle2} />
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 24,
	},
	iconContainer: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: "rgba(59, 130, 246, 0.1)",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 24,
		borderWidth: 2,
		borderColor: "rgba(59, 130, 246, 0.3)",
	},
	iconText: {
		fontSize: 64,
	},
	appName: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#ffffff",
		marginBottom: 8,
		letterSpacing: 0.5,
	},
	statusText: {
		fontSize: 16,
		color: "#94a3b8",
		marginBottom: 32,
		textAlign: "center",
		paddingHorizontal: 32,
	},
	progressBarContainer: {
		width: "100%",
		maxWidth: 320,
		marginBottom: 48,
	},
	progressBarBackground: {
		width: "100%",
		height: 8,
		backgroundColor: "rgba(59, 130, 246, 0.1)",
		borderRadius: 8,
		overflow: "hidden",
		position: "relative",
		marginBottom: 8,
	},
	progressBarFill: {
		height: "100%",
		backgroundColor: "#3b82f6",
		borderRadius: 8,
		position: "absolute",
		left: 0,
		top: 0,
	},
	progressBarGlow: {
		height: "100%",
		position: "absolute",
		left: 0,
		top: 0,
	},
	progressText: {
		fontSize: 14,
		color: "#64748b",
		textAlign: "center",
		fontWeight: "600",
	},
	infoContainer: {
		alignItems: "center",
		gap: 4,
	},
	infoText: {
		fontSize: 14,
		color: "#3b82f6",
		fontWeight: "500",
	},
	infoSubText: {
		fontSize: 12,
		color: "#64748b",
	},
	decorativeCircle1: {
		position: "absolute",
		top: -100,
		right: -100,
		width: 300,
		height: 300,
		borderRadius: 150,
		backgroundColor: "rgba(59, 130, 246, 0.05)",
	},
	decorativeCircle2: {
		position: "absolute",
		bottom: -150,
		left: -150,
		width: 400,
		height: 400,
		borderRadius: 200,
		backgroundColor: "rgba(139, 92, 246, 0.03)",
	},
});
