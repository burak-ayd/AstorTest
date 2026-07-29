// app/_layout.jsx
import { Stack } from "expo-router";
import * as Updates from "expo-updates";
import { useEffect, useRef } from "react";
import { Alert, AppState } from "react-native";
import Toast from "react-native-toast-message";
export default function RootLayout() {
	// Aynı anda birden fazla kontrol yapılmasını engellemek için flag
	const isChecking = useRef(false);

	useEffect(() => {
		async function checkAndApplyUpdate() {
			// Eğer geliştirme modundaysak veya halihazırda kontrol yapılıyorsa dur
			if (__DEV__ || isChecking.current) return;

			try {
				isChecking.current = true;

				// 1. Güncelleme var mı kontrol et
				const update = await Updates.checkForUpdateAsync();

				if (update.isAvailable) {
					// 2. Yeni güncelleme dosyasını indir
					const fetched = await Updates.fetchUpdateAsync();

					if (fetched.isNew) {
						// 3. İndirme başarıyla tamamlandıktan sonra kullanıcıya sor
						Alert.alert(
							"Yeni Güncelleme!",
							"Uygulamanın yeni sürümü hazır. Yeniden başlatılsın mı?",
							[
								{
									text: "Şimdi Yenile",
									onPress: async () => {
										try {
											// Anında güvenli reload
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
				}
			} catch (error) {
				console.log("OTA Hatası:", error);
			} finally {
				isChecking.current = false;
			}
		}

		// İlk açılışta güvenli kontrol
		checkAndApplyUpdate();

		// Arka plandan ön plana geçişlerde kontrol
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
			<Toast /> {/* Toast mesajları burada gösterilecek */}
		</>
	);
}
