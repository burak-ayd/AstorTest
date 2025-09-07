import "@/global.css";
import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
// Expo Router otomatik olarak `app/` içindeki route’ları çözüyor.
export function App() {
	return <ExpoRoot context={require.context("./app")} />;
}

registerRootComponent(App);
