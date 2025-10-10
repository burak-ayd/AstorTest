import { MaterialIcons } from "@expo/vector-icons"; // Eğer ikon kullanmak istersen
import React, { useEffect } from "react";
import { Animated, Dimensions, StyleSheet, Text } from "react-native";

const { width, height } = Dimensions.get("window");
const ICONS = {
	success: { name: "check-circle", color: "#4CAF50" },
	error: { name: "error", color: "#FF6B6B" },
	info: { name: "info", color: "#2196F3" },
};
function getPositionStyle(position) {
	switch (position) {
		case "top":
			return { top: 40, left: width * 0.1 };
		case "bottom":
			return { bottom: 50, left: width * 0.1 };
		case "center":
			return {
				top: height / 2 - 40,
				left: width * 0.1,
			};
		case "left":
			return { top: height / 2 - 40, left: 20 };
		case "right":
			return { top: height / 2 - 40, right: 20 };
		case "bottomLeft":
			return { bottom: 40, left: 20 };
		case "bottomRight":
			return { bottom: 40, right: 20 };
		case "topLeft":
			return { top: 40, left: 20 };
		case "topRight":
			return { top: 40, right: 20 };
		default:
			return { bottom: 40, left: width * 0.1 };
	}
}

// Animasyon yönünü pozisyona göre ayarla
function getInitialTranslate(position) {
	switch (position) {
		case "top":
		case "topLeft":
		case "topRight":
			return -100; // yukarıdan gelsin
		case "bottom":
		case "bottomLeft":
		case "bottomRight":
			return 100; // aşağıdan gelsin
		default:
			return 0; // ortada fade-in
	}
}

export default function CustomToast({
	visible,
	message,
	type = "success",
	onHide,
	position = "bottom",
}) {
	const initialTranslate = getInitialTranslate(position);
	const translateY = React.useRef(
		new Animated.Value(initialTranslate)
	).current;

	useEffect(() => {
		if (visible) {
			Animated.spring(translateY, {
				toValue: 0,
				useNativeDriver: true,
			}).start();

			const timer = setTimeout(() => {
				Animated.timing(translateY, {
					toValue: initialTranslate,
					duration: 300,
					useNativeDriver: true,
				}).start(() => {
					onHide && onHide();
				});
			}, 2000);

			return () => clearTimeout(timer);
		} else {
			translateY.setValue(initialTranslate);
		}
	}, [visible, initialTranslate, translateY]);

	if (!visible) return null;

	return (
		<Animated.View
			style={[
				styles.toast,
				type === "success"
					? styles.success
					: type === "info"
					? styles.info
					: styles.error,
				getPositionStyle(position),
				{ transform: [{ translateY }] },
			]}>
			<MaterialIcons
				name={ICONS[type].name}
				size={24}
				color={ICONS[type].color}
				style={styles.icon}
			/>
			<Text style={styles.text}>{message}</Text>
		</Animated.View>
	);
}

// const styles = StyleSheet.create({
// 	toast: {
// 		position: "absolute",
// 		width: width * 0.8,
// 		padding: 16,
// 		paddingLeft: 24,
// 		borderRadius: 12,
// 		alignItems: "center",
// 		justifyContent: "center",
// 		zIndex: 9999,
// 		shadowColor: "#000",
// 		shadowOpacity: 0.2,
// 		shadowRadius: 6,
// 		elevation: 10,
// 		backgroundColor: "#FFF", // Uygulama arka planı
// 		flexDirection: "row",
// 	},
// 	success: {
// 		borderLeftWidth: 8,
// 		borderLeftColor: "#4CAF50",
// 	},
// 	error: {
// 		borderLeftWidth: 8,
// 		borderLeftColor: "#FF6B6B",
// 	},
// 	info: {
// 		borderLeftWidth: 8,
// 		borderLeftColor: "#2196F3",
// 	},
// 	text: {
// 		color: "#222",
// 		fontWeight: "bold",
// 		fontSize: 16,
// 	},
// });

const styles = StyleSheet.create({
	toast: {
		position: "absolute",
		width: width * 0.8,
		minHeight: 56,
		padding: 16,
		paddingLeft: 16,
		borderRadius: 16,
		alignItems: "center",
		flexDirection: "row",
		zIndex: 9999,
		backgroundColor: "rgba(255,255,255,0.95)", // Hafif transparan
		shadowColor: "#000",
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 12,
	},
	success: {
		borderLeftWidth: 6,
		borderLeftColor: "#4CAF50",
	},
	error: {
		borderLeftWidth: 6,
		borderLeftColor: "#FF6B6B",
	},
	info: {
		borderLeftWidth: 6,
		borderLeftColor: "#2196F3",
	},
	icon: {
		marginRight: 12,
	},
	text: {
		color: "#222",
		fontWeight: "500",
		fontSize: 16,
		flex: 1,
	},
});
