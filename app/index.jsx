// app/index.jsx
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	NativeModules,
	Platform,
	Text,
	View,
	__DEV__,
} from "react-native";
import RNFS from "react-native-fs";
import RNRestart from "react-native-restart";

const { DebugModule, BundleReloadModule } = NativeModules;

const OTA_URL = "https://burak-ayd.github.io/AstorTest/index.android.bundle";
// Android'de RNFS.DocumentDirectoryPath aslında /data/data/{package}/files dizinini işaret eder
// Bu native koddaki context.filesDir ile aynıdır
const LOCAL_BUNDLE = RNFS.DocumentDirectoryPath + "/index.android.bundle";
const VERSION_FILE = RNFS.DocumentDirectoryPath + "/bundle-version.txt";

export default function Index() {
	const [ready, setReady] = useState(false);
	const [updateStatus, setUpdateStatus] = useState(
		"Güncellemeler kontrol ediliyor..."
	);

	useEffect(() => {
		const checkOTA = async () => {
			// Development modda OTA kontrolü yapma
			if (__DEV__) {
				console.log("Development modda OTA kontrolü atlanıyor");
				setReady(true);
				return;
			}

			// Android'de çalıştır
			if (Platform.OS !== "android") {
				setReady(true);
				return;
			}

			try {
				setUpdateStatus("Uzak sunucu kontrol ediliyor...");

				// Timeout ile fetch yap
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout

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

				const remoteLastModified =
					response.headers.get("last-modified");
				const metaPath = LOCAL_BUNDLE + ".meta";
				let localLastModified = null;
				let currentBundleVersion = null;

				// Documents klasörünün var olduğundan emin ol
				const documentsDir = RNFS.DocumentDirectoryPath;
				if (!(await RNFS.exists(documentsDir))) {
					await RNFS.mkdir(documentsDir);
				}

				// Mevcut bundle versiyonunu kontrol et
				if (await RNFS.exists(VERSION_FILE)) {
					currentBundleVersion = await RNFS.readFile(
						VERSION_FILE,
						"utf8"
					);
					console.log("Mevcut Bundle Version:", currentBundleVersion);
				}

				// Yerel meta dosyasını kontrol et
				if (await RNFS.exists(metaPath)) {
					localLastModified = await RNFS.readFile(metaPath, "utf8");
				}

				console.log("Remote Last Modified:", remoteLastModified);
				console.log("Local Last Modified:", localLastModified);
				console.log("Bundle Path:", LOCAL_BUNDLE);

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
							throw new Error(
								"Bundle çok küçük, geçersiz olabilir"
							);
						}

						// Bundle içeriğinin JavaScript olduğunu kontrol et
						if (
							!bundleCode.includes("__d(function") &&
							!bundleCode.includes("(function(")
						) {
							throw new Error(
								"Bundle içeriği geçersiz görünüyor"
							);
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

						// Cache temizliği için eski meta dosyalarını da sil
						try {
							// Expo cache dosyalarını temizle
							const cacheDir =
								RNFS.DocumentDirectoryPath + "/.expo";
							if (await RNFS.exists(cacheDir)) {
								await RNFS.unlink(cacheDir);
								console.log("Expo cache temizlendi");
							}
						} catch (e) {
							console.log(
								"Cache temizleme hatası (normal):",
								e.message
							);
						}

						// Yeni bundle'ı kaydet
						await RNFS.writeFile(LOCAL_BUNDLE, bundleCode, "utf8");

						// Bundle checksum oluştur (değişiklikleri garantilemek için)
						const bundleHash = bundleCode.length + "_" + Date.now();
						await RNFS.writeFile(
							RNFS.DocumentDirectoryPath + "/bundle.checksum",
							bundleHash,
							"utf8"
						);

						// Yeni versiyon kaydet
						const newVersion = Date.now().toString();
						await RNFS.writeFile(VERSION_FILE, newVersion, "utf8");

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

						// Tab dosyalarının bundle'da olduğunu kontrol et
						const tabFiles = ["(tabs)", "_layout", "TrafoKayip"];
						const missingFiles = tabFiles.filter(
							(file) => !bundleCode.includes(file)
						);
						if (missingFiles.length > 0) {
							console.warn(
								"Bundle'da eksik dosyalar:",
								missingFiles
							);
						} else {
							console.log("Tüm tab dosyaları bundle'da mevcut");
						}

						// Meta dosyasını kaydet
						await RNFS.writeFile(
							metaPath,
							remoteLastModified,
							"utf8"
						);

						console.log(
							"Bundle başarıyla kaydedildi:",
							LOCAL_BUNDLE
						);
						console.log(
							"Bundle boyutu:",
							bundleCode.length,
							"karakter"
						);
						console.log(
							"Dosya yazıldı - boyut kontrol:",
							writtenFile.length
						);

						setUpdateStatus("Güncelleme uygulanıyor...");

						// Başarı mesajı göster ve advanced restart yap
						setTimeout(() => {
							Alert.alert(
								"Uygulama Güncellendi!",
								`Yeni sürüm yüklendi (${Math.round(bundleCode.length / 1024)}KB). Bundle yeniden yüklenecek...`,
								[
									{
										text: "Bundle Reload",
										onPress: async () => {
											console.log(
												"Bundle reload yapılıyor..."
											);
											try {
												if (BundleReloadModule) {
													await BundleReloadModule.reloadBundle();
													console.log(
														"Bundle reload başarılı"
													);
												} else {
													console.log(
														"BundleReloadModule bulunamadı, RNRestart kullanılıyor"
													);
													RNRestart.Restart();
												}
											} catch (e) {
												console.log(
													"Bundle reload hatası, RNRestart kullanılıyor:",
													e
												);
												RNRestart.Restart();
											}
										},
									},
									{
										text: "Hard Restart",
										onPress: () => {
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
					console.log("Bundle güncel, güncelleme gerekmiyor");
					console.log(
						"Bundle mevcut mu:",
						await RNFS.exists(LOCAL_BUNDLE)
					);

					// Native'den bundle bilgilerini kontrol et
					if (DebugModule) {
						try {
							const bundleInfo =
								await DebugModule.checkBundleFile();
							console.log("Native Bundle Info:", bundleInfo);
						} catch (e) {
							console.log("Native bundle check failed:", e);
						}
					}
				}
			} catch (error) {
				console.log("OTA update failed:", error);
				setUpdateStatus(
					"Güncelleme hatası, yerel sürümle devam ediliyor..."
				);

				// Network hatası durumunda hızlıca geç
				setTimeout(() => {
					setReady(true);
				}, 1000);
				return;
			}

			setReady(true);
		};

		checkOTA();
	}, []);

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
			</View>
		);
	}

	return <Redirect href="TrafoKayip" />;
}
