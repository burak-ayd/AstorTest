import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import "./global.css";
// Expo Router otomatik olarak `app/` içindeki route’ları çözüyor.
export function App() {
	return <ExpoRoot context={require.context("./app")} />;
}

registerRootComponent(App);
