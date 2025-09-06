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
import RNFS from "react-native-fs";
import RNRestart from "react-native-restart";

const { BundleReloadModule, APKUpdateModule } = NativeModules;

const OTA_URL = "https://burak-ayd.github.io/AstorTest/index.android.bundle";
const GITHUB_API_URL =
	"https://api.github.com/repos/burak-ayd/AstorTest/releases/latest";
const LOCAL_BUNDLE = RNFS.DocumentDirectoryPath + "/index.android.bundle";
const VERSION_FILE = RNFS.DocumentDirectoryPath + "/bundle-version.txt";

export default function Index() {
	const [ready, setReady] = useState(false);
	const [updateStatus, setUpdateStatus] = useState(
		"Güncellemeler kontrol ediliyor..."
	);

	// Icon cache temizleme fonksiyonu
	const clearIconCache = async () => {
		try {
			// React Native Vector Icons ve diğer icon cache'lerini temizle
			const iconCachePaths = [
				RNFS.CachesDirectoryPath + "/RNVectorIcons",
				RNFS.DocumentDirectoryPath + "/RNVectorIcons",
				RNFS.TemporaryDirectoryPath + "/RNVectorIcons",
				RNFS.CachesDirectoryPath + "/icons",
				RNFS.DocumentDirectoryPath + "/icons",
			];

			for (const path of iconCachePaths) {
				if (await RNFS.exists(path)) {
					await RNFS.unlink(path);
					console.log("Icon cache temizlendi:", path);
				}
			}

			// Font cache temizliği
			const fontCachePaths = [
				RNFS.CachesDirectoryPath + "/fonts",
				RNFS.DocumentDirectoryPath + "/fonts",
			];

			for (const path of fontCachePaths) {
				if (await RNFS.exists(path)) {
					await RNFS.unlink(path);
					console.log("Font cache temizlendi:", path);
				}
			}
		} catch (error) {
			console.log("Icon/Font cache temizleme hatası:", error);
		}
	};

	// Tüm cache'leri temizleme fonksiyonu
	const clearAllCaches = async () => {
		try {
			// Icon cache temizliği
			await clearIconCache();

			// Expo cache temizliği
			const expoCacheDir = RNFS.DocumentDirectoryPath + "/.expo";
			if (await RNFS.exists(expoCacheDir)) {
				await RNFS.unlink(expoCacheDir);
				console.log("Expo cache temizlendi");
			}

			// Metro cache temizliği
			const metroCacheDir = RNFS.CachesDirectoryPath + "/metro";
			if (await RNFS.exists(metroCacheDir)) {
				await RNFS.unlink(metroCacheDir);
				console.log("Metro cache temizlendi");
			}

			// Temp dosyaları temizle
			const tempDir = RNFS.TemporaryDirectoryPath;
			const tempFiles = await RNFS.readDir(tempDir);
			for (const file of tempFiles) {
				if (file.isFile() && file.name.includes("bundle")) {
					await RNFS.unlink(file.path);
					console.log("Temp dosya temizlendi:", file.name);
				}
			}
		} catch (error) {
			console.log("Cache temizleme hatası (normal):", error.message);
		}
	};

	// Version bilgisini asset version ile birlikte kaydet
	const saveVersionWithAssets = async (bundleVersion) => {
		const versionInfo = {
			bundle: bundleVersion,
			assets: "1.0.0", // Asset version'ı - gerekirse güncelleyin
			timestamp: Date.now(),
			requiresHardRestart: true, // Icon sorunu için hard restart gerekli
		};

		await RNFS.writeFile(VERSION_FILE, JSON.stringify(versionInfo), "utf8");
	};

	// Version kontrolü
	const getVersionInfo = async () => {
		try {
			if (await RNFS.exists(VERSION_FILE)) {
				const content = await RNFS.readFile(VERSION_FILE, "utf8");
				// Eski format kontrolü (sadece string)
				if (content.startsWith("{")) {
					return JSON.parse(content);
				} else {
					// Eski format, yeni formata çevir
					return {
						bundle: content,
						assets: "1.0.0",
						timestamp: Date.now(),
						requiresHardRestart: false,
					};
				}
			}
		} catch (error) {
			console.log("Version info okuma hatası:", error);
		}
		return null;
	};

	const checkOTA = async () => {
		try {
			setUpdateStatus("Uzak sunucu kontrol ediliyor...");

			// Timeout ile fetch yap
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000);

			const response = await fetch(OTA_URL, {
				method: "HEAD",
				signal: controller.signal,
				cache: "no-cache",
			});

			clearTimeout(timeoutId);

			if (response.status !== 200) {
				console.log(
					"Bundle sunucuya erişilemiyor, yerel sürümle devam ediliyor"
				);
				setReady(true);
				return;
			}

			const remoteLastModified = response.headers.get("last-modified");
			const metaPath = LOCAL_BUNDLE + ".meta";
			let localLastModified = null;
			let currentVersionInfo = null;

			// Documents klasörünün var olduğundan emin ol
			const documentsDir = RNFS.DocumentDirectoryPath;
			if (!(await RNFS.exists(documentsDir))) {
				await RNFS.mkdir(documentsDir);
			}

			// Mevcut version bilgisini kontrol et
			currentVersionInfo = await getVersionInfo();
			if (currentVersionInfo) {
				console.log("Mevcut Version Info:", currentVersionInfo);
			}

			// Yerel meta dosyasını kontrol et
			if (await RNFS.exists(metaPath)) {
				localLastModified = await RNFS.readFile(metaPath, "utf8");
			}

			console.log("Remote Last Modified:", remoteLastModified);
			console.log("Local Last Modified:", localLastModified);

			// Güncelleme gerekli mi kontrol et
			if (
				remoteLastModified &&
				remoteLastModified !== localLastModified
			) {
				setUpdateStatus("Yeni sürüm indiriliyor...");

				const bundleController = new AbortController();
				const bundleTimeoutId = setTimeout(
					() => bundleController.abort(),
					30000
				);

				const bundleResp = await fetch(OTA_URL, {
					signal: bundleController.signal,
					cache: "no-cache",
				});

				clearTimeout(bundleTimeoutId);

				if (bundleResp.status === 200) {
					const bundleCode = await bundleResp.text();

					// Bundle boyutunu ve içeriğini kontrol et
					if (bundleCode.length < 1000) {
						throw new Error("Bundle çok küçük, geçersiz olabilir");
					}

					// Bundle içeriğinin JavaScript olduğunu kontrol et
					if (
						!bundleCode.includes("__d(function") &&
						!bundleCode.includes("(function(")
					) {
						throw new Error("Bundle içeriği geçersiz görünüyor");
					}

					console.log(
						"Bundle validation passed - Size:",
						bundleCode.length
					);

					// Önce tüm eski dosyaları temizle
					const filesToClean = [
						LOCAL_BUNDLE,
						metaPath,
						VERSION_FILE,
						RNFS.DocumentDirectoryPath + "/bundle.checksum",
					];

					for (const file of filesToClean) {
						if (await RNFS.exists(file)) {
							await RNFS.unlink(file);
							console.log("Silindi:", file);
						}
					}

					// TÜM cache'leri temizle (icon cache dahil)
					await clearAllCaches();

					// Yeni bundle'ı kaydet
					await RNFS.writeFile(LOCAL_BUNDLE, bundleCode, "utf8");

					// Bundle checksum oluştur
					const bundleHash = bundleCode.length + "_" + Date.now();
					await RNFS.writeFile(
						RNFS.DocumentDirectoryPath + "/bundle.checksum",
						bundleHash,
						"utf8"
					);

					// Yeni version bilgisini asset info ile kaydet
					const newVersion = Date.now().toString();
					await saveVersionWithAssets(newVersion);

					// Dosyanın gerçekten yazıldığını kontrol et
					const writtenFile = await RNFS.readFile(
						LOCAL_BUNDLE,
						"utf8"
					);
					if (writtenFile.length !== bundleCode.length) {
						throw new Error(
							"Bundle yazma hatası - boyut uyuşmuyor"
						);
					}

					// Meta dosyasını kaydet
					await RNFS.writeFile(metaPath, remoteLastModified, "utf8");

					console.log("Bundle başarıyla kaydedildi:", LOCAL_BUNDLE);

					setUpdateStatus("Güncelleme uygulanıyor...");

					// Icon sorunu için her zaman HARD RESTART yap
					setTimeout(() => {
						Alert.alert(
							"Uygulama Güncellendi!",
							`Yeni sürüm yüklendi (${Math.round(
								bundleCode.length / 1024
							)}KB).\n\nIcon ve fontların düzgün yüklenmesi için uygulama yeniden başlatılacak.`,
							[
								{
									text: "Yeniden Başlat",
									onPress: () => {
										// Her zaman hard restart yap - icon sorunu çözümü
										console.log(
											"Hard restart yapılıyor - icon sorunu önlemi"
										);
										RNRestart.Restart();
									},
								},
							],
							{ cancelable: false }
						);
					}, 1500);

					return;
				} else {
					throw new Error(
						`Bundle download failed: ${bundleResp.status}`
					);
				}
			} else {
				console.log("Bundle güncel");

				// Eğer önceki güncelleme hard restart gerektiriyorsa kontrol et
				if (
					currentVersionInfo &&
					currentVersionInfo.requiresHardRestart
				) {
					// Bir kerelik hard restart flag'ini temizle
					currentVersionInfo.requiresHardRestart = false;
					await RNFS.writeFile(
						VERSION_FILE,
						JSON.stringify(currentVersionInfo),
						"utf8"
					);
				}
			}
		} catch (error) {
			console.log("OTA update failed:", error);
			setUpdateStatus(
				"Güncelleme hatası, yerel sürümle devam ediliyor..."
			);

			// Hata durumunda da cache temizliği yap
			await clearIconCache();

			setTimeout(() => setReady(true), 2000);
			return;
		}

		setReady(true);
	};

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
			if (__DEV__) {
				console.log("Development modda güncelleme kontrolü atlanıyor");
				setReady(true);
				return;
			}

			// Android'de çalıştır
			if (Platform.OS !== "android") {
				setReady(true);
				return;
			}

			try {
				// İlk açılışta icon cache temizliği (önceki sorunlu güncellemeler için)
				const versionInfo = await getVersionInfo();
				if (versionInfo && versionInfo.requiresHardRestart) {
					console.log(
						"Önceki güncelleme icon sorunu yaratmış olabilir, cache temizleniyor"
					);
					await clearIconCache();
				}

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

	const checkForAPKUpdate = async () => {
		try {
			setUpdateStatus("GitHub releases kontrol ediliyor...");

			// Timeout ile GitHub API çağrısı
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 15000);

			const releaseResponse = await fetch(GITHUB_API_URL, {
				headers: {
					"Accept": "application/vnd.github.v3+json",
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
				if (latestVersion !== currentVersion) {
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
								`Sürüm ${latestVersion} indirilsin mi?\n\nBoyut: ${Math.round(
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
