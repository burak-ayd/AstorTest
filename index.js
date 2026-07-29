import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import { useEffect } from "react";
import "./global.css";
// Expo Router otomatik olarak `app/` içindeki route’ları çözüyor.
export function App() {
	useEffect(() => {
		async function onFetchUpdateAsync() {
			try {
				// Geliştirme modunda (DEV) OTA güncellemeleri çalışmaz
				if (__DEV__) return;

				// Yeni bir güncelleme var mı kontrol et
				const update = await Updates.checkForUpdateAsync();

				if (update.isAvailable) {
					// Yeni güncellemeyi arka planda indir
					await Updates.fetchUpdateAsync();

					// Opsiyonel: Kullanıcıya bildirim gösterip onay alarak veya doğrudan yeniden başlatın
					Alert.alert(
						"Yeni Güncelleme!",
						"Uygulamanın yeni sürümü indirildi. Uygulanması için yeniden başlatılıyor.",
						[
							{
								text: "Şimdi Yeniden Başlat",
								onPress: async () => {
									// JS Engine'i kapatıp yeni bundle ile anında yeniden başlatır
									await Updates.reloadAsync();
								},
							},
						],
					);
				}
			} catch (error) {
				// OTA sunucusuna ulaşılamazsa veya ağ hatası olursa yakalayın
				console.log("Update error:", error);
			}
		}

		onFetchUpdateAsync();
	}, []);
	return <ExpoRoot context={require.context("./app")} />;
}

registerRootComponent(App);
