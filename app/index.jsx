// app/index.jsx
import { Redirect } from "expo-router";
import moment from "moment";
import "moment/locale/tr";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import RNFS from "react-native-fs";
import RNRestart from "react-native-restart";

moment.locale("tr");

const OTA_URL = "https://burak-ayd.github.io/AstorTest/index.android.bundle"; // GitHub Pages veya S3 URL
const LOCAL_BUNDLE = RNFS.DocumentDirectoryPath + "/index.android.bundle";

export default function Index() {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const checkOTA = async () => {
			try {
				// Sadece HEAD request ile last-modified kontrolü
				const response = await fetch(OTA_URL, { method: "HEAD" });
				const remoteLastModified =
					response.headers.get("last-modified");

				const metaPath = LOCAL_BUNDLE + ".meta";
				let localLastModified = null;

				if (await RNFS.exists(metaPath)) {
					localLastModified = await RNFS.readFile(metaPath, "utf8");
				}

				if (remoteLastModified !== localLastModified) {
					// Yeni bundle varsa indir
					const bundleResp = await fetch(OTA_URL);
					const bundleCode = await bundleResp.text();

					await RNFS.writeFile(LOCAL_BUNDLE, bundleCode, "utf8");
					await RNFS.writeFile(metaPath, remoteLastModified, "utf8");

					Alert.alert(
						"Uygulama Güncellendi",
						"Yeniden başlatılıyor..."
					);
					RNRestart.Restart(); // react-native-restart paketine ihtiyaç var
				}
			} catch (error) {
				console.log("OTA update failed:", error);
			} finally {
				setReady(true);
			}
		};

		checkOTA();
	}, []);

	// OTA kontrolü bitene kadar yükleme spinner’ı göster
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
			</View>
		);
	}

	// OTA check tamamlandı, yönlendirmeyi yap
	return <Redirect href="TrafoKayip" />;
}
