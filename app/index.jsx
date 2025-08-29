// app/index.jsx
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Platform,
	Text,
	View,
	__DEV__,
} from "react-native";
import RNFS from "react-native-fs";
import RNRestart from "react-native-restart";

const OTA_URL = "https://burak-ayd.github.io/AstorTest/index.android.bundle";
// Native koddaki path ile uyumlu olması için aynı konumu kullan
const LOCAL_BUNDLE = RNFS.DocumentDirectoryPath + "/index.android.bundle";

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

				// Documents klasörünün var olduğundan emin ol
				const documentsDir = RNFS.DocumentDirectoryPath;
				if (!(await RNFS.exists(documentsDir))) {
					await RNFS.mkdir(documentsDir);
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
					); // 30 saniye timeout

					const bundleResp = await fetch(OTA_URL, {
						signal: bundleController.signal,
						cache: "no-cache",
					});

					clearTimeout(bundleTimeoutId);

					if (bundleResp.status === 200) {
						const bundleCode = await bundleResp.text();

						// Bundle boyutunu kontrol et
						if (bundleCode.length < 1000) {
							throw new Error(
								"Bundle çok küçük, geçersiz olabilir"
							);
						}

						// Bundle'ı kaydet
						await RNFS.writeFile(LOCAL_BUNDLE, bundleCode, "utf8");
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

						setUpdateStatus("Güncelleme uygulanıyor...");

						// Kısa bir gecikme ekleyin
						setTimeout(() => {
							Alert.alert(
								"Uygulama Güncellendi!",
								"Yeni sürüm yüklendi. Uygulama yeniden başlatılıyor...",
								[
									{
										text: "Tamam",
										onPress: () => {
											RNRestart.Restart();
										},
									},
								],
								{ cancelable: false }
							);
						}, 1000);

						return; // Alert gösterildikten sonra return et
					} else {
						throw new Error(
							`Bundle download failed: ${bundleResp.status}`
						);
					}
				} else {
					console.log("Bundle güncel, güncelleme gerekmiyor");
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
