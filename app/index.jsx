// app/index.jsx
import { Redirect } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

// Expo APK Update Manager'ı import et
import UpdateScreen from "../components/UpdateScreen";
import { APKUpdateManager } from "../modules/expo-apk-update/src/APKUpdateManager";

export default function Index() {
	const [ready, setReady] = useState(false);
	const [showUpdateScreen, setShowUpdateScreen] = useState(false);
	const [updateStatus, setUpdateStatus] = useState(
		"Güncellemeler kontrol ediliyor...",
	);
	const [updateProgress, setUpdateProgress] = useState(0);
	const updateManagerRef = useRef(null);

	useEffect(() => {
		let updateTimeout = null;

		// Güvenlik için timeout ekle - 60 saniye sonra otomatik devam et
		updateTimeout = setTimeout(() => {
			console.log("Update timeout - proceeding with local version");
			setUpdateStatus("Zaman aşımı - yerel sürümle devam ediliyor");
			setReady(true);
		}, 60000);

		const checkUpdates = async () => {
			// Development modda güncelleme kontrolü yapma (istenirse)
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
				// APK Update Manager oluştur
				const updateManager = new APKUpdateManager({
					onStatusChange: (status) => {
						console.log("Status:", status);
						setUpdateStatus(status);
					},
					onProgressChange: (progress) => {
						console.log("Progress:", progress);
						setUpdateProgress(progress);
					},
					onUpdateAvailable: (version, size, notes) => {
						console.log("Update available:", version, size);
						setShowUpdateScreen(true);
						setUpdateProgress(25);
					},
					onUpdateStarted: () => {
						console.log("Update started");
						setUpdateProgress(30);
					},
					onUpdateComplete: () => {
						console.log("Update completed or cancelled");
						setUpdateProgress(100);
						setTimeout(() => setReady(true), 500);
					},
					onError: (error) => {
						console.error("Update error:", error);
					},
					onNoUpdate: () => {
						console.log("No update available");
						setUpdateProgress(100);
						setReady(true);
					},
				});

				updateManagerRef.current = updateManager;

				// Güncelleme kontrolü yap
				await updateManager.checkForUpdates();
			} catch (error) {
				console.log("Update check failed:", error);
				setUpdateStatus(
					"Güncelleme hatası, yerel sürümle devam ediliyor...",
				);

				setTimeout(() => {
					setReady(true);
				}, 2000);
			}
		};

		checkUpdates();

		// Cleanup function
		return () => {
			if (updateTimeout) {
				clearTimeout(updateTimeout);
			}
			if (updateManagerRef.current) {
				updateManagerRef.current.cleanup();
			}
		};
	}, []);

	if (!ready && showUpdateScreen) {
		return <UpdateScreen status={updateStatus} progress={updateProgress} />;
	}

	return (
		<SafeAreaProvider>
			<Redirect href="/(tabs)" />
		</SafeAreaProvider>
	);
}
