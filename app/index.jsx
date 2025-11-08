import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	DeviceEventEmitter,
	NativeModules,
	Platform,
	Text,
	View,
} from "react-native";
import "../global.css";
const { APKUpdateModule } = NativeModules;

const OTA_URL = "https://burak-ayd.github.io/AstorTest/index.android.bundle";
const GITHUB_API_URL =
	"https://api.github.com/repos/burak-ayd/AstorTest/releases/latest";

function formatReleaseNotes(body) {
    if (typeof body !== "string" || body.trim().length === 0) {
        return "Bilgi yok.";
    }
    let text = body.replace(/\r\n/g, "\n");
    text = text.replace(/#+\s*/g, "");
    text = text.replace(/\*\*/g, "");
    text = text.replace(/^\s*[-*]\s+/gm, "• ");
    text = text.replace(/[\t ]+/g, " ");
    const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    return lines.slice(0, 12).join("\n");
}

export default function Index() {
	const [ready, setReady] = useState(false);
	const [updateStatus, setUpdateStatus] = useState(
		"Güncellemeler kontrol ediliyor..."
	);

	// // Tüm cache'leri temizleme fonksiyonu
	// const clearAllCaches = async () => {
	// 	try {
	// 		// Icon cache temizliği
	// 		await clearIconCache();

	// 		// Expo cache temizliği
	// 		const expoCacheDir = RNFS.DocumentDirectoryPath + "/.expo";
	// 		if (await RNFS.exists(expoCacheDir)) {
	// 			await RNFS.unlink(expoCacheDir);
	// 			console.log("Expo cache temizlendi");
	// 		}

	// 		// Metro cache temizliği
	// 		const metroCacheDir = RNFS.CachesDirectoryPath + "/metro";
	// 		if (await RNFS.exists(metroCacheDir)) {
	// 			await RNFS.unlink(metroCacheDir);
	// 			console.log("Metro cache temizlendi");
	// 		}

	// 		// Temp dosyaları temizle
	// 		const tempDir = RNFS.TemporaryDirectoryPath;
	// 		const tempFiles = await RNFS.readDir(tempDir);
	// 		for (const file of tempFiles) {
	// 			if (file.isFile() && file.name.includes("bundle")) {
	// 				await RNFS.unlink(file.path);
	// 				console.log("Temp dosya temizlendi:", file.name);
	// 			}
	// 		}
	// 	} catch (error) {
	// 		console.log("Cache temizleme hatası (normal):", error.message);
	// 	}
	// };

	const checkOTA = async () => {
		try {
			setUpdateStatus("Uzak sunucu kontrol ediliyor...");
		} catch (error) {
			console.log("OTA update failed:", error);

			return;
		}

		setReady(true);
	};
	// APK UPDATE
	useEffect(() => {
		let downloadCompleteListener = null;
		let installResultListener = null;
		let updateTimeout = null;

		// APK indirme event listener'ları
		downloadCompleteListener = DeviceEventEmitter.addListener(
			"APKDownloadComplete",
			(result) => {
				console.log("APK indirme sonucu:", result);

				if (typeof result === "string") {
					if (result === "success") {
						setUpdateStatus("APK yükleniyor...");
					} else if (
						result.startsWith("failed:") ||
						result.startsWith("error:")
					) {
						const errorMsg = result.replace(
							/^(failed:|error:)\s*/,
							""
						);
						setUpdateStatus(`İndirme hatası: ${errorMsg}`);
						Alert.alert("İndirme Hatası", errorMsg, [
							{ text: "Tamam", onPress: () => setReady(true) },
						]);
					}
				}
			}
		);

		installResultListener = DeviceEventEmitter.addListener(
			"APKInstallResult",
			(result) => {
				console.log("APK yükleme sonucu:", result);

				if (typeof result === "string") {
					if (result === "install_started") {
						setUpdateStatus("APK yükleyici açılıyor...");
						// APK yükleyici açıldığında uygulamayı hazır hale getir
						setTimeout(() => setReady(true), 2000);
					} else if (result.startsWith("error:")) {
						const errorMsg = result.replace(/^error:\s*/, "");
						setUpdateStatus(`Yükleme hatası: ${errorMsg}`);
						Alert.alert("Yükleme Hatası", errorMsg, [
							{ text: "Tamam", onPress: () => setReady(true) },
						]);
					}
				}
			}
		);

		// Güvenlik için timeout ekle - 60 saniye sonra otomatik devam et
		updateTimeout = setTimeout(() => {
			console.log("Update timeout - proceeding with local version");
			setUpdateStatus("Zaman aşımı - yerel sürümle devam ediliyor");
			setReady(true);
		}, 60000);

		const checkUpdates = async () => {
			// Development modda güncelleme kontrolü yapma
			// if (__DEV__) {
			// 	console.log("Development modda güncelleme kontrolü atlanıyor");
			// 	setReady(true);
			// 	return;
			// }

			// Android'de çalıştır
			if (Platform.OS !== "android") {
				setReady(true);
				return;
			}

			try {
				// Önce APK güncellemesi kontrol et
				const apkUpdateStarted = await checkForAPKUpdate();

				// APK güncellemesi başlatıldıysa, event listener'lar devralacak
				// Aksi halde OTA kontrol et
				if (!apkUpdateStarted) {
					await checkOTA();
				}
			} catch (error) {
				console.log("Update check failed:", error);
				setUpdateStatus(
					"Güncelleme hatası, yerel sürümle devam ediliyor..."
				);

				setTimeout(() => {
					setReady(true);
				}, 2000);
			}
		};

		checkUpdates();

		// Cleanup function
		return () => {
			if (downloadCompleteListener) {
				downloadCompleteListener.remove();
			}
			if (installResultListener) {
				installResultListener.remove();
			}
			if (updateTimeout) {
				clearTimeout(updateTimeout);
			}
		};
	}, []);

	function compareVersions(v1, v2) {
		const v1parts = v1.replace(/^v/, "").split(".").map(Number);
		const v2parts = v2.replace(/^v/, "").split(".").map(Number);

		for (let i = 0; i < 3; i++) {
			if (v1parts[i] > v2parts[i]) return 1; // v1 daha yeni
			if (v1parts[i] < v2parts[i]) return -1; // v1 daha eski
		}
		return 0; // eşit
	}

	const checkForAPKUpdate = async () => {
		try {
			setUpdateStatus("GitHub releases kontrol ediliyor...");
			// Check if APKUpdateModule is available
			if (
				!APKUpdateModule ||
				typeof APKUpdateModule.getCurrentVersion !== "function"
			) {
				console.log("APKUpdateModule is not available.");
				return false;
			}
			// Timeout ile GitHub API çağrısı
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 15000);

			const releaseResponse = await fetch(GITHUB_API_URL, {
				headers: {
					Accept: "application/vnd.github.v3+json",
					"User-Agent": "AstorTest2-App",
				},
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (releaseResponse.status === 200) {
				const releaseData = await releaseResponse.json();
				const latestVersion = releaseData.tag_name;

				// Mevcut sürümü al
				const currentVersionInfo =
					await APKUpdateModule.getCurrentVersion();
				const currentVersion = "v" + currentVersionInfo.versionName;

				console.log("Mevcut sürüm:", currentVersion);
				console.log("En son sürüm:", latestVersion);

				// Sürüm karşılaştırması
				if (compareVersions(latestVersion, currentVersion) > 0) {
					// APK dosyasını release'de ara
					const apkAsset = releaseData.assets.find(
						(asset) =>
							asset.name.includes(".apk") &&
							asset.name.includes("release")
					);

					if (apkAsset) {
						setUpdateStatus("Yeni sürüm bulundu!");

						// İzin kontrolü
						const hasPermission =
							await APKUpdateModule.checkInstallPermission();

						if (!hasPermission) {
							Alert.alert(
								"İzin Gerekli",
								"APK güncellemesi için bilinmeyen kaynaklardan yükleme izni gerekiyor.",
								[
									{
										text: "İzin Ver",
										onPress: () => {
											APKUpdateModule.requestInstallPermission();
											// İzin verildikten sonra kullanıcı geri dönerse devam et
											setTimeout(
												() => setReady(true),
												3000
											);
										},
									},
									{
										text: "İptal",
										style: "cancel",
										onPress: () => setReady(true),
									},
								]
							);
							return false;
						}

						return new Promise((resolve) => {
							Alert.alert(
								"Yeni Sürüm Mevcut!",
								`Yeni Özellikler:\n${formatReleaseNotes(releaseData.body)}\n\nSürüm ${latestVersion} indirilsin mi?\n\nBoyut: ${Math.round(
									apkAsset.size / (1024 * 1024)
								)}MB`,
								[
									{
										text: "İndir ve Yükle",
										onPress: async () => {
											setUpdateStatus(
												"APK indiriliyor..."
											);
											try {
												const result =
													await APKUpdateModule.downloadAndInstallAPK(
														apkAsset.browser_download_url
													);
												console.log(
													"Download başlatıldı:",
													result,
													apkAsset.browser_download_url
												);
												resolve(true);
											} catch (e) {
												console.error(
													"APK indirme hatası:",
													e
												);
												Alert.alert(
													"Hata",
													"APK indirme hatası: " +
														e.message,
													[
														{
															text: "Tamam",
															onPress: () =>
																setReady(true),
														},
													]
												);
												resolve(false);
											}
										},
									},
									{
										text: "Şimdi Değil",
										style: "cancel",
										onPress: () => {
											setReady(true);
											resolve(false);
										},
									},
								]
							);
						});
					} else {
						console.log("APK asset bulunamadı");
						return false;
					}
				} else {
					console.log("APK güncel");
					return false;
				}
			} else {
				console.log(
					"GitHub API'ye erişilemiyor:",
					releaseResponse.status
				);
				return false;
			}
		} catch (error) {
			console.log("APK update kontrol hatası:", error);
			if (error.name === "AbortError") {
				console.log("GitHub API timeout");
			}
			return false;
		}
	};

	if (!ready) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "#0b1020",
				}}>
				<ActivityIndicator size="large" color="#ffffff" />
				<Text
					style={{
						marginTop: 16,
						color: "#ffffff",
						textAlign: "center",
						paddingHorizontal: 20,
						fontSize: 14,
					}}>
					{updateStatus}
				</Text>
				<Text
					style={{
						marginTop: 8,
						color: "#888888",
						textAlign: "center",
						paddingHorizontal: 20,
						fontSize: 12,
					}}>
					Bu işlem biraz zaman alabilir...
				</Text>
			</View>
		);
	}

	return <Redirect href="TrafoKayip" />;
}
