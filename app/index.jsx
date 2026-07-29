// import { requireNativeModule } from "expo-modules-core";
import { Redirect } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Index() {
	return (
		<SafeAreaProvider>
			<Redirect href="/(tabs)" />
		</SafeAreaProvider>
	);
}
