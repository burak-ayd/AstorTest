// app/index.js
// App.js veya index.js
import { Redirect } from "expo-router";
import moment from "moment";
import "moment/locale/tr";

// İsteğe bağlı olarak, varsayılan dili ayarlayın
moment.locale("tr");

export default function Index() {
	return <Redirect href="TrafoKayip" />;
}
