import { MaterialIcons } from "@expo/vector-icons"; // Eğer ikon kullanmak istersen
import React, { useEffect } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

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

	const getBackgroundColor = (type) => {
		switch (type) {
			case "success":
				return "rgba(34,197,94,0.7)"; // yeşil (bg-green-500/10)
			case "error":
				return "rgba(239,68,68,0.7)"; // kırmızı (bg-red-500/15)
			case "info":
				return "rgba(59,130,246,0.7)"; // mavi (bg-blue-500/10)
			default:
				return "rgba(255,255,255,0.95)";
		}
	};

	const getTextColor = (type) => {
		switch (type) {
			case "success":
				return "#166534"; // text-green-800
			case "error":
				return "#991B1B"; // text-red-800
			case "info":
				return "#1E3A8A"; // text-blue-800
			default:
				return "#222";
		}
	};

	const getTitleColor = (type) => {
		switch (type) {
			case "success":
				return "#166534"; // bold green
			case "error":
				return "#991B1B"; // bold red
			case "info":
				return "#1E3A8A"; // bold blue
			default:
				return "#222";
		}
	};

	const getDescriptionColor = (type) => {
		switch (type) {
			case "success":
				return "#15803d"; // text-green-700
			case "error":
				return "#991B1B"; // text-red-700
			case "info":
				return "#1E3A8A"; // text-blue-700
			default:
				return "#555";
		}
	};

	return (
		<Animated.View
			style={[
				styles.toast,
				{
					backgroundColor: getBackgroundColor(type),
				},
				type === "success"
					? styles.success
					: type === "info"
					? styles.info
					: styles.error,
				getPositionStyle(position),
				{ transform: [{ translateY }] },
			]}>
			<View
				style={[
					styles.iconContainer,
					{
						backgroundColor: getBackgroundColor(type),
					},
				]}>
				<MaterialIcons name={ICONS[type].name} size={28} color="#fff" />
			</View>
			<View style={styles.textContainer}>
				<Text
					style={[
						styles.text,
						{
							color: getTitleColor(type),
							fontSize: 18,
							fontWeight: "bold",
						},
					]}>
					{type === "success"
						? "Başarılı!"
						: type === "error"
						? "Hata!"
						: "Bilgi"}
				</Text>
				<Text
					style={[
						styles.text,
						{ color: getTextColor(type), fontSize: 16 },
					]}>
					{message ||
						(type === "success"
							? "İşleminiz başarıyla tamamlandı."
							: type === "error"
							? "Bir hata oluştu."
							: "Bilgilendirme mesajı.")}
				</Text>
			</View>
		</Animated.View>
	);
}

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
		shadowColor: "#000",
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 0,
	},
	error: {
		borderLeftWidth: 6,
		borderLeftColor: "#FF6B6B",
	},
	info: {
		borderLeftWidth: 6,
		borderLeftColor: "#2196F3",
	},
	text: {
		color: "#222",
		fontWeight: "500",
		fontSize: 16,
		flex: 1,
	},

	success: {
		// Sol tarafta yuvarlak ikon alanı
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 16,
	},
	icon: {
		// Icon için ekstra stil gerekirse ekle
	},
	textContainer: {
		flex: 1,
	},
});
