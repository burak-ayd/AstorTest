// app/_layout.jsx
import { Stack } from "expo-router";
import * as Updates from "expo-updates";
import { useEffect } from "react";
import { Alert, AppState } from "react-native";
import Toast from "react-native-toast-message";

export default function RootLayout() {
	useEffect(() => {
		async function checkAndApplyUpdate() {
			try {
				// Geliştirme modunda (DEV) OTA kontrollerini atla
				if (__DEV__) return;

				// 1. Sunucuda yeni bir güncelleme var mı kontrol et
				const update = await Updates.checkForUpdateAsync();

				if (update.isAvailable) {
					// 2. Yeni bundle ve asset'leri arka planda indir
					await Updates.fetchUpdateAsync();

					// 3. Kullanıcıya bildir ve JS runtime'ını anında reload et
					Alert.alert(
						"Yeni Güncelleme!",
						"Uygulamanın yeni sürümü indirildi. Yeniden başlatılsın mı?",
						[
							{
								text: "Şimdi Yeniden Başlat",
								onPress: async () => {
									// JS Thread'ini yeni bundle ile hemen yeniden başlatır
									await Updates.reloadAsync();
								},
							},
						],
						{ cancelable: false },
					);
				}
			} catch (error) {
				console.log("OTA Güncelleme Hatası:", error);
			}
		}

		// 1. İlk açılışta hemen kontrol et
		checkAndApplyUpdate();

		// 2. Uygulama arka plandan (background) ön plana (foreground) her geldiğinde tekrar kontrol et
		const subscription = AppState.addEventListener(
			"change",
			(nextAppState) => {
				if (nextAppState === "active") {
					checkAndApplyUpdate();
				}
			},
		);

		return () => {
			subscription.remove();
		};
	}, []);

	return (
		<>
			<Stack
				screenOptions={{
					headerShown: false,
				}}
			/>
			<Toast /> {/* Toast mesajları burada gösterilecek */}
		</>
	);
}
