// app/_layout.jsx
import { Stack } from "expo-router";
import * as Updates from "expo-updates";
import { useEffect, useRef } from "react";
import { Alert, AppState } from "react-native";
import Toast from "react-native-toast-message";

export default function RootLayout() {
	const isChecking = useRef(false);

	useEffect(() => {
		async function checkAndApplyUpdate() {
			if (__DEV__ || isChecking.current) return;

			try {
				isChecking.current = true;

				// 1. Yeni güncelleme var mı kontrol et
				const update = await Updates.checkForUpdateAsync();

				if (update.isAvailable) {
					// 2. Yeni bundle'ı ve asset'leri indir
					await Updates.fetchUpdateAsync();

					// 3. İndirme bittiği an kullanıcıya sor ve reload yap
					Alert.alert(
						"Yeni Güncelleme!",
						"Uygulamanın yeni sürümü indirildi. Şimdi yenilensin mi?",
						[
							{
								text: "Şimdi Yenile",
								onPress: async () => {
									try {
										// Anında yeni JS bundle ile baştan başlatır
										await Updates.reloadAsync();
									} catch (e) {
										console.log("Reload hatası:", e);
									}
								},
							},
						],
						{ cancelable: false },
					);
				}
			} catch (error) {
				console.log("OTA Hatası:", error);
			} finally {
				isChecking.current = false;
			}
		}

		// İlk açılışta kontrol et
		checkAndApplyUpdate();

		// Arka plandan ön plana geçişlerde kontrol et
		const subscription = AppState.addEventListener(
			"change",
			(nextAppState) => {
				if (nextAppState === "active") {
					checkAndApplyUpdate();
				}
			},
		);

		return () => subscription.remove();
	}, []);

	return (
		<>
			<Stack
				screenOptions={{
					headerShown: false,
				}}
			/>
			<Toast />
		</>
	);
}
