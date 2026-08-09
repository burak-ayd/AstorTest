import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

const colors = {
	background: "#111316",
	surface: "#111316",
	surfaceContainerLow: "#1a1c1f",
	surfaceContainer: "#1e2023",
	surfaceContainerHigh: "#282a2d",
	surfaceContainerHighest: "#333538",
	surfaceBright: "#37393d",
	onSurface: "#e2e2e6",
	onSurfaceVariant: "#b9caca",
	outline: "#849495",
	outlineVariant: "#3a494a",

	primary: "#e9feff",
	onPrimary: "#003739",
	primaryContainer: "#00f5ff",
	onPrimaryContainer: "#006c71",
	primaryFixedDim: "#00dce5",
	primaryFixed: "#63f7ff",

	secondary: "#ffdb9d",
	onSecondary: "#412d00",
	secondaryContainer: "#feb700",
	secondaryFixedDim: "#ffba20",
	secondaryFixed: "#ffdea8",

	tertiary: "#fef8ff",
	tertiaryContainer: "#e5d7ff",
	tertiaryFixedDim: "#d0bcff",

	error: "#ffb4ab",
	errorContainer: "#93000a",
	onErrorContainer: "#ffdad6",
};

const spacing = {
	base: 4,
	xs: 8,
	sm: 12,
	md: 16,
	lg: 24,
	xl: 32,
	marginMobile: 16,
};

// ─────────────────────────────────────────────────────────────────────────────
// Section accent configurations
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_GUC = {
	icon: "bolt",
	accent: colors.primaryFixedDim,
	title: "Güç Bilgileri",
};
const SECTION_SARGI = {
	icon: "thermostat",
	accent: colors.secondaryFixedDim,
	title: "Sargı & Sıcaklık",
};
const SECTION_DIRENC = {
	icon: "electrical-services",
	accent: colors.tertiaryFixedDim,
	title: "Direnç Ölçümleri",
};
const SECTION_OLCUM = {
	icon: "speed",
	accent: colors.primaryFixedDim,
	title: "Ölçüm Değerleri",
};
const SECTION_BUTTON = {
	// icon: "speed",
	// accent: colors.primaryFixedDim,
	// title: "Ölçüm Değerleri",
};

export default function CiftAGKayip({ showToast }) {
	const [guc, setGuc] = useState("");
	const [kademeIlkGerilimi, setKademeIlkGerilimi] = useState("");
	const [kademeNomGerilimi, setKademeNomGerilimi] = useState("");
	const [kademeSonGerilimi, setKademeSonGerilimi] = useState("");
	const [agGerilimi, setAgGerilimi] = useState("");
	const [sargiTipi, setSargiTipi] = useState("al");
	const [refTemp, setRefTemp] = useState("75");
	const [temp, setTemp] = useState("");
	const [direncIlk, setDirencIlk] = useState("");
	const [direncNom, setDirencNom] = useState("");
	const [direncSon, setDirencSon] = useState("");
	const [direnc2U, setDirenc2U] = useState("");
	const [direnc3U, setDirenc3U] = useState("");
	const [ilkKademeAkım, setIlkKademeAkım] = useState("");
	const [ilkKademeGerilim, setIlkKademeGerilim] = useState("");
	const [ilkKademeKayip, setIlkKademeKayip] = useState("");
	const [nomKademeAkım, setNomKademeAkım] = useState("");
	const [nomKademeGerilim, setNomKademeGerilim] = useState("");
	const [nomKademeKayip, setNomKademeKayip] = useState("");
	const [sonKademeAkım, setSonKademeAkım] = useState("");
	const [sonKademeGerilim, setSonKademeGerilim] = useState("");
	const [sonKademeKayip, setSonKademeKayip] = useState("");
	const [wç, setWÇ] = useState(1);
	const [aç, setAÇ] = useState(1);
	const [gç, setGÇ] = useState(1);
	const [pk75Ilk, setPK75Ilk] = useState("");
	const [pac75Ilk, setPac75Ilk] = useState("");
	const [uk75Ilk, setUK75Ilk] = useState("");
	const [pk75Nom, setPK75Nom] = useState("");
	const [pac75Nom, setPac75Nom] = useState("");
	const [uk75Nom, setUK75Nom] = useState("");
	const [pk75Son, setPK75Son] = useState("");
	const [pac75Son, setPac75Son] = useState("");
	const [uk75Son, setUK75Son] = useState("");
	const formatPct = (x) =>
		!isFinite(x)
			? "—"
			: `${x.toLocaleString("tr-TR", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				})} %`;
	function parseNum(v) {
		if (typeof v !== "string") return NaN;
		v = v.trim().replace(/\s+/g, "").replace(/\./g, "").replace(/,/, ".");
		return Number(v);
	}

	const sıcaklıkKatsayısı = useCallback(() => {
		const sargiTipiValue = sargiTipi === "al" ? 225 : 235;
		const refTempNum = parseNum(refTemp);
		const tempNum = parseNum(temp);

		const hesap =
			(sargiTipiValue + refTempNum) / (sargiTipiValue + tempNum);

		return hesap;
	}, [sargiTipi, refTemp, temp]);

	function Ukhesap(
		kademeGerilimi,
		cikilanGerilim,
		Polculen,
		guc,
		pk75,
		akimOrani,
	) {
		const Uk =
			(cikilanGerilim * Math.sqrt(3) * akimOrani) / kademeGerilimi / 10;

		const Ur = (Polculen / (guc * 1000)) * 100;

		const Ux = Math.sqrt(Uk ** 2 - Ur ** 2);

		const Ur_75 = (pk75 / (guc * 1000)) * 100;

		const Ux_75 = Ux;

		const Uk_75 = Math.sqrt(Ur_75 ** 2 + Ux_75 ** 2);
		return Uk_75;
	}

	// const direncHesapla = useCallback(() => {
	// 	const yg1 = 0.326;
	// 	const yg2 = 0.3473;
	// 	const yg3 = 0.3673;
	// 	const ag1 = 0.623;
	// 	const ag2 = 0.534;
	// 	const refTempNum = parseNum(refTemp);
	// 	const tempNum = parseNum(temp);
	// 	const sargiTipiValue = sargiTipi === "al" ? 225 : 235;

	// 	const yg1Direnc =
	// 		(yg1 * (sargiTipiValue + tempNum)) / (sargiTipiValue + tempNum);
	// 	const yg2Direnc =
	// 		(yg2 * (sargiTipiValue + tempNum)) / (sargiTipiValue + tempNum);
	// 	const yg3Direnc =
	// 		(yg3 * (sargiTipiValue + tempNum)) / (sargiTipiValue + tempNum);
	// 	const ag1Direnc =
	// 		(ag1 * (sargiTipiValue + tempNum)) / (sargiTipiValue + tempNum);
	// 	const ag2Direnc =
	// 		(ag2 * (sargiTipiValue + tempNum)) / (sargiTipiValue + tempNum);

	// 	console.log(
	// 		"test",
	// 		yg1Direnc,
	// 		yg2Direnc,
	// 		yg3Direnc,
	// 		ag1Direnc,
	// 		ag2Direnc,
	// 	);
	// }, []);

	const ilkKademe = useCallback(() => {
		const gucNum = parseNum(guc);
		const ag1GerilimiNum = parseNum(agGerilimi);
		const kademeIlkGerilimiNum = parseNum(kademeIlkGerilimi);
		const direncIlkNum = parseNum(direncIlk);
		const direnc2UNum = parseNum(direnc2U);
		const direnc3UNum = parseNum(direnc3U);

		const ilkKademeGerilimNum = parseNum(ilkKademeGerilim);
		const ilkKademeKayipNum = parseNum(ilkKademeKayip);
		const ilkKademeAkımNum = parseNum(ilkKademeAkım);

		// console.log("Güç:", gucNum, "kVA");
		// console.log("AG Gerilimi:", ag1GerilimiNum, "V");
		// console.log("Kademe İlk Gerilimi:", kademeIlkGerilimiNum, "V");
		// console.log("Direnç İlk:", direncIlkNum, "Ω");
		// console.log("Direnç 2U:", direnc2UNum, "mΩ");
		// console.log("Direnç 3U:", direnc3UNum, "mΩ");
		// console.log("Ref. Sıcaklık:", refTempNum, "°C");
		// console.log("Sıcaklık:", tempNum, "°C");
		// console.log("İlk Kademe Gerilim:", ilkKademeGerilimNum, "V");
		// console.log("İlk Kademe Kayıp:", ilkKademeKayipNum, "W");
		// console.log("İlk Kademe Akım:", ilkKademeAkımNum, "A");
		// console.log("Sargı Tipi:", sargiTipi, `(${sargiTipiValue} °C)`);

		const kademeAkim = gucNum / kademeIlkGerilimiNum / Math.sqrt(3);
		// console.log("Kademe Akım:", kademeAkim.toFixed(2), "A");
		const agAkim = gucNum / 2 / ag1GerilimiNum / Math.sqrt(3);
		// console.log("AG Akım:", agAkim.toFixed(2), "A");
		// ölçülen değerler
		const Olculen_sekonder_akım = (ilkKademeAkımNum / kademeAkim) * agAkim;
		const Olculen_pdcPrimer = 1.5 * direncIlkNum * ilkKademeAkımNum ** 2;
		const Olculen_pdcSekonder =
			1.5 * direnc2UNum * Olculen_sekonder_akım ** 2 * 0.001;
		const Olculen_pdcToplam = Olculen_pdcPrimer + Olculen_pdcSekonder;

		// console.log(sekonder_akım, pdcPrimer, pdcSekonder, pdcToplam);
		// console.log("İlk Kademe Olculen Değerler:");
		// console.log("Sekonder Akım:", Olculen_sekonder_akım.toFixed(3), "A");
		// console.log("Pdc Primer:", Olculen_pdcPrimer.toFixed(3), "W");
		// console.log("Pdc Sekonder:", Olculen_pdcSekonder.toFixed(3), "W");
		// console.log("Pdc Toplam:", Olculen_pdcToplam.toFixed(3), "W");

		// Nominal Akıma uyarlanmış değerler
		const akimOranı = kademeAkim / ilkKademeAkımNum;

		// 1. Tüm hesaplamaları saf sayı (Number) olarak yapın
		const P_olculen_val = ilkKademeKayipNum * akimOranı ** 2 * wç * aç * gç;
		const Pdc_primer_val = 1.5 * direncIlkNum * kademeAkim ** 2;
		const Pdc_2u_val = 1.5 * direnc2UNum * agAkim ** 2 * 0.001;
		const Pdc_3u_val = 1.5 * direnc3UNum * agAkim ** 2 * 0.001;

		const Pdc_toplam_val = Pdc_primer_val + Pdc_2u_val + Pdc_3u_val;
		const Pac_val = Math.abs(P_olculen_val - Pdc_toplam_val);

		const katsayi = sıcaklıkKatsayısı();
		const Pdc_75_val = (Pdc_primer_val + Pdc_2u_val + Pdc_3u_val) * katsayi;
		const Pac_75_val = Pac_val / katsayi;
		const Pk_75_val = Pdc_75_val + Pac_75_val;

		// 2. Yalnızca çıktı/gösterim aşamasında formatlayın
		// const P_olculen = P_olculen_val.toFixed(3);
		// const Pdc_primer = Pdc_primer_val.toFixed(3);
		// const Pdc_2u = Pdc_2u_val.toFixed(3);
		// const Pdc_3u = Pdc_3u_val.toFixed(3);
		// const Pdc_toplam = Pdc_toplam_val.toFixed(3);
		// const Pac = Pac_val.toFixed(3);
		// const Pdc_75 = Pdc_75_val.toFixed(3);
		const Pac_75 = Pac_75_val.toFixed(3);
		const Pk_75 = Pk_75_val.toFixed(0);
		const Uk75_ilkKademe = Ukhesap(
			kademeIlkGerilimiNum,
			ilkKademeGerilimNum,
			P_olculen_val,
			gucNum,
			Pk_75_val,
			akimOranı,
		);

		setPK75Ilk(Pk_75);
		setUK75Ilk(formatPct(Uk75_ilkKademe));
		setPac75Ilk(Pac_75);

		// console.log("--------------------------------------------");
		// console.log("P_olculen: ", P_olculen);
		// console.log("Pdc_primer: ", Pdc_primer);
		// console.log("Pdc_2u: ", Pdc_2u);
		// console.log("Pdc_3u: ", Pdc_3u);
		// console.log("Pdc_toplam: ", Pdc_toplam);
		// console.log("Pac: ", Pac);
		// console.log("Pdc_75: ", Pdc_75);
		// console.log("Pac_75: ", Pac_75);
		// console.log("Pk_75: ", Pk_75);
		// console.log(
		// 	"Uk: ",
		// 	Ukhesap(
		// 		kademeIlkGerilimiNum,
		// 		ilkKademeGerilimNum,
		// 		P_olculen_val,
		// 		gucNum,
		// 		Pk_75_val,
		// 		akimOranı,
		// 	),
		// );
		// console.log("--------------------------------------------");
	}, [
		guc,
		agGerilimi,
		kademeIlkGerilimi,
		direncIlk,
		direnc2U,
		direnc3U,

		ilkKademeGerilim,
		ilkKademeKayip,
		ilkKademeAkım,

		aç,
		wç,
		gç,
		sıcaklıkKatsayısı,
	]);
	const nomKademe = useCallback(() => {
		const gucNum = parseNum(guc);
		const ag1GerilimiNum = parseNum(agGerilimi);
		const kademeNomGerilimiNum = parseNum(kademeNomGerilimi);
		const direncNomNum = parseNum(direncNom);
		const direnc2UNum = parseNum(direnc2U);
		const direnc3UNum = parseNum(direnc3U);

		const NomKademeGerilimNum = parseNum(nomKademeGerilim);
		const NomKademeKayipNum = parseNum(nomKademeKayip);
		const NomKademeAkımNum = parseNum(nomKademeAkım);

		const kademeAkim = gucNum / kademeNomGerilimiNum / Math.sqrt(3);
		const agAkim = gucNum / 2 / ag1GerilimiNum / Math.sqrt(3);
		// ölçülen değerler
		const Olculen_sekonder_akım = (NomKademeAkımNum / kademeAkim) * agAkim;
		const Olculen_pdcPrimer = 1.5 * direncNomNum * NomKademeAkımNum ** 2;
		const Olculen_pdcSekonder =
			1.5 * direnc2UNum * Olculen_sekonder_akım ** 2 * 0.001;
		const Olculen_pdcToplam = Olculen_pdcPrimer + Olculen_pdcSekonder;

		// Nominal Akıma uyarlanmış değerler
		const akimOranı = kademeAkim / NomKademeAkımNum;

		// 1. Tüm hesaplamaları saf sayı (Number) olarak yapın
		const P_olculen_val = NomKademeKayipNum * akimOranı ** 2 * wç * aç * gç;
		const Pdc_primer_val = 1.5 * direncNomNum * kademeAkim ** 2;
		const Pdc_2u_val = 1.5 * direnc2UNum * agAkim ** 2 * 0.001;
		const Pdc_3u_val = 1.5 * direnc3UNum * agAkim ** 2 * 0.001;

		const Pdc_toplam_val = Pdc_primer_val + Pdc_2u_val + Pdc_3u_val;
		const Pac_val = Math.abs(P_olculen_val - Pdc_toplam_val);

		const katsayi = sıcaklıkKatsayısı();
		const Pdc_75_val = (Pdc_primer_val + Pdc_2u_val + Pdc_3u_val) * katsayi;
		const Pac_75_val = Pac_val / katsayi;
		const Pk_75_val = Pdc_75_val + Pac_75_val;

		// 2. Yalnızca çıktı/gösterim aşamasında formatlayın
		// const P_olculen = P_olculen_val.toFixed(3);
		// const Pdc_primer = Pdc_primer_val.toFixed(3);
		// const Pdc_2u = Pdc_2u_val.toFixed(3);
		// const Pdc_3u = Pdc_3u_val.toFixed(3);
		// const Pdc_toplam = Pdc_toplam_val.toFixed(3);
		// const Pac = Pac_val.toFixed(3);
		// const Pdc_75 = Pdc_75_val.toFixed(3);
		const Pac_75 = Pac_75_val.toFixed(3);
		const Pk_75 = Pk_75_val.toFixed(0);
		const Uk75_NomKademe = Ukhesap(
			kademeNomGerilimiNum,
			NomKademeGerilimNum,
			P_olculen_val,
			gucNum,
			Pk_75_val,
			akimOranı,
		);

		setPK75Nom(Pk_75);
		setUK75Nom(formatPct(Uk75_NomKademe));
		setPac75Nom(Pac_75);
	}, [
		guc,
		agGerilimi,
		kademeNomGerilimi,
		direncNom,
		direnc2U,
		direnc3U,

		nomKademeGerilim,
		nomKademeKayip,
		nomKademeAkım,

		aç,
		wç,
		gç,
		sıcaklıkKatsayısı,
	]);
	const sonKademe = useCallback(() => {
		const gucNum = parseNum(guc);
		const ag1GerilimiNum = parseNum(agGerilimi);
		const kademeSonGerilimiNum = parseNum(kademeSonGerilimi);
		const direncSonNum = parseNum(direncSon);
		const direnc2UNum = parseNum(direnc2U);
		const direnc3UNum = parseNum(direnc3U);

		const SonKademeGerilimNum = parseNum(sonKademeGerilim);
		const SonKademeKayipNum = parseNum(sonKademeKayip);
		const SonKademeAkımNum = parseNum(sonKademeAkım);

		const kademeAkim = gucNum / kademeSonGerilimiNum / Math.sqrt(3);
		const agAkim = gucNum / 2 / ag1GerilimiNum / Math.sqrt(3);
		// ölçülen değerler
		const Olculen_sekonder_akım = (SonKademeAkımNum / kademeAkim) * agAkim;
		const Olculen_pdcPrimer = 1.5 * direncSonNum * SonKademeAkımNum ** 2;
		const Olculen_pdcSekonder =
			1.5 * direnc2UNum * Olculen_sekonder_akım ** 2 * 0.001;
		const Olculen_pdcToplam = Olculen_pdcPrimer + Olculen_pdcSekonder;

		// Soninal Akıma uyarlanmış değerler
		const akimOranı = kademeAkim / SonKademeAkımNum;

		// 1. Tüm hesaplamaları saf sayı (Number) olarak yapın
		const P_olculen_val = SonKademeKayipNum * akimOranı ** 2 * wç * aç * gç;
		const Pdc_primer_val = 1.5 * direncSonNum * kademeAkim ** 2;
		const Pdc_2u_val = 1.5 * direnc2UNum * agAkim ** 2 * 0.001;
		const Pdc_3u_val = 1.5 * direnc3UNum * agAkim ** 2 * 0.001;

		const Pdc_toplam_val = Pdc_primer_val + Pdc_2u_val + Pdc_3u_val;
		const Pac_val = Math.abs(P_olculen_val - Pdc_toplam_val);

		const katsayi = sıcaklıkKatsayısı();
		const Pdc_75_val = (Pdc_primer_val + Pdc_2u_val + Pdc_3u_val) * katsayi;
		const Pac_75_val = Pac_val / katsayi;
		const Pk_75_val = Pdc_75_val + Pac_75_val;

		// 2. Yalnızca çıktı/gösterim aşamasında formatlayın
		// const P_olculen = P_olculen_val.toFixed(3);
		// const Pdc_primer = Pdc_primer_val.toFixed(3);
		// const Pdc_2u = Pdc_2u_val.toFixed(3);
		// const Pdc_3u = Pdc_3u_val.toFixed(3);
		// const Pdc_toplam = Pdc_toplam_val.toFixed(3);
		// const Pac = Pac_val.toFixed(3);
		// const Pdc_75 = Pdc_75_val.toFixed(3);
		const Pac_75 = Pac_75_val.toFixed(3);
		const Pk_75 = Pk_75_val.toFixed(0);
		const Uk75_SonKademe = Ukhesap(
			kademeSonGerilimiNum,
			SonKademeGerilimNum,
			P_olculen_val,
			gucNum,
			Pk_75_val,
			akimOranı,
		);

		setPK75Son(Pk_75);
		setUK75Son(formatPct(Uk75_SonKademe));
		setPac75Son(Pac_75);
	}, [
		guc,
		agGerilimi,
		kademeSonGerilimi,
		direncSon,
		direnc2U,
		direnc3U,

		sonKademeGerilim,
		sonKademeKayip,
		sonKademeAkım,

		aç,
		wç,
		gç,
		sıcaklıkKatsayısı,
	]);

	const Hesapla = useCallback(() => {
		ilkKademe();
		nomKademe();
		sonKademe();
	}, [ilkKademe, nomKademe, sonKademe]);

	useEffect(() => {
		const isProvided = (value) => {
			if (typeof value === "string") {
				return value.trim().length > 0;
			}
			return value !== null && value !== undefined;
		};

		Hesapla();
	}, [Hesapla]);

	function Temizle() {
		setGuc("");
		setKademeIlkGerilimi("");
		setKademeNomGerilimi("");
		setKademeSonGerilimi("");
		setAgGerilimi("");
		setSargiTipi("al");
		setRefTemp("75");
		setTemp("");
		setDirencIlk("");
		setDirencNom("");
		setDirencSon("");
		setDirenc2U("");
		setDirenc3U("");
		setIlkKademeAkım("");
		setIlkKademeGerilim("");
		setIlkKademeKayip("");
		setNomKademeAkım("");
		setNomKademeGerilim("");
		setNomKademeKayip("");
		setSonKademeAkım("");
		setSonKademeGerilim("");
		setSonKademeKayip("");
		setWÇ(1);
		setAÇ(1);
		setGÇ(1);
		setPK75Ilk("");
		setPac75Ilk("");
		setUK75Ilk("");
		setPK75Nom("");
		setPac75Nom("");
		setUK75Nom("");
		setPK75Son("");
		setPac75Son("");
		setUK75Son("");
		showToast && showToast("Temizlendi!", "bottom", "info");
	}

	// Validate that every displayed result is a finite parseable number.
	// Values may be:
	//   - .toFixed() strings ("14068", "NaN", "0")
	//   - formatPct() strings ("5,69 %", "—") with tr-TR locale + suffix
	// Truthy check ("pk75Ilk ?") is unreliable here — we must parse it.
	const allResultsValid = useMemo(() => {
		const values = [
			pk75Ilk,
			pac75Ilk,
			uk75Ilk,
			pk75Nom,
			pac75Nom,
			uk75Nom,
			pk75Son,
			pac75Son,
			uk75Son,
		];
		return values.every((v) => {
			if (typeof v !== "string") return false;
			// Strip any unit suffixes (e.g. " %", " W", " V", " A")
			// and whitespace, then normalise decimal comma → dot.
			const stripped = v
				.replace(/\s*(%|W|V|A|Ω|Hz|kVA|kV|kW)\s*$/i, "")
				.replace(/\s+/g, "")
				.replace(",", ".");
			if (stripped === "" || stripped === "-") return false;
			const n = Number(stripped);
			return Number.isFinite(n);
		});
	}, [
		pk75Ilk,
		pac75Ilk,
		uk75Ilk,
		pk75Nom,
		pac75Nom,
		uk75Nom,
		pk75Son,
		pac75Son,
		uk75Son,
	]);

	return (
		<KeyboardAvoidingView
			style={styles.root}
			behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.content}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}>
				{/* ═══════════════════════ Güç Bilgileri ═══════════════════════ */}
				<SectionCard config={SECTION_GUC} glow="topRight">
					<View style={styles.row2}>
						<Field
							label="Güç (kVA)"
							value={guc}
							onChangeText={setGuc}
							placeholder="1250"
							ring={colors.primaryFixedDim}
						/>

						<Field
							style={styles.col}
							label="AG Gerilimi (V)"
							value={agGerilimi}
							onChangeText={setAgGerilimi}
							placeholder="400"
							ring={colors.primaryFixedDim}
						/>
					</View>
					<View style={styles.row3}>
						<Field
							style={styles.col}
							label="İlk Kdm. Gerilimi (V)"
							value={kademeIlkGerilimi}
							onChangeText={setKademeIlkGerilimi}
							placeholder="28,5 kV"
							ring={colors.primaryFixedDim}
						/>
						<Field
							style={styles.col}
							label="Nom Kdm. Gerilimi (V)"
							value={kademeNomGerilimi}
							onChangeText={setKademeNomGerilimi}
							placeholder="33 kV"
							ring={colors.primaryFixedDim}
						/>
						<Field
							style={styles.col}
							label="Son Kdm. Gerilimi (V)"
							value={kademeSonGerilimi}
							onChangeText={setKademeSonGerilimi}
							placeholder="36 kV"
							ring={colors.primaryFixedDim}
						/>
					</View>
				</SectionCard>
				{/* ═══════════════════════ Sargı & Sıcaklık ═══════════════════════ */}
				<SectionCard config={SECTION_SARGI} glow="bottomLeft">
					<View>
						<Label>Sargı Tipi</Label>
						<Segmented
							value={sargiTipi}
							options={[
								{ label: "Alüminyum", value: "al" },
								{ label: "Bakır", value: "cu" },
							]}
							onChange={setSargiTipi}
							accent={colors.secondaryFixedDim}
						/>
					</View>

					<View style={styles.row2}>
						<Field
							style={{ width: "40%" }}
							label="Ref. Sıc. (°C)"
							value={refTemp}
							onChangeText={setRefTemp}
							placeholder="75 °C"
							ring={colors.secondaryFixedDim}
						/>
						<Field
							style={{ width: "40%" }}
							label="Sıcaklık (°C)"
							value={temp}
							onChangeText={setTemp}
							placeholder="23 °C"
							ring={colors.secondaryFixedDim}
						/>
					</View>
				</SectionCard>

				{/* ═══════════════════════ Direnç Ölçümleri ═══════════════════════ */}
				<SectionCard config={SECTION_DIRENC} glow="center">
					<DirencGroup
						label="YG DİRENÇ"
						values={[direncIlk, direncNom, direncSon]}
						setters={[setDirencIlk, setDirencNom, setDirencSon]}
						placeholders={["2,5 Ω", "2,5 Ω", "2,5 Ω"]}
						labels={["İlk Kad", "Nom Kad", "Son Kad"]}
						accent={colors.tertiaryFixedDim}
						ratio={formatPct(0)}
					/>
					<DirencGroup
						label="AG DİRENÇ"
						values={[direnc2U, direnc3U]}
						setters={[setDirenc2U, setDirenc3U]}
						placeholders={["1,5 mΩ", "1,5 mΩ"]}
						labels={["AG1 (2U)", "AG2 (3U)"]}
						accent={colors.tertiaryFixedDim}
						ratio={formatPct(0)}
					/>
				</SectionCard>

				{/* ═══════════════════════ Ölçüm Değerleri ═══════════════════════ */}
				<SectionCard config={SECTION_OLCUM} glow={null}>
					<OlcumGroup
						label="İlk Kademe Ölçümleri"
						values={[
							ilkKademeAkım,
							ilkKademeKayip,
							ilkKademeGerilim,
						]}
						setters={[
							setIlkKademeAkım,
							setIlkKademeKayip,
							setIlkKademeGerilim,
						]}
						labels={["Akım", "Kayıp", "Gerilim"]}
						placeholders={["10 A", "2000 W", "920,2 V"]}
						accent={colors.primaryFixedDim}
						ratio={formatPct(0)}
					/>
					<OlcumGroup
						label="Nom Kademe Ölçümleri"
						values={[
							nomKademeAkım,
							nomKademeKayip,
							nomKademeGerilim,
						]}
						setters={[
							setNomKademeAkım,
							setNomKademeKayip,
							setNomKademeGerilim,
						]}
						labels={["Akım", "Kayıp", "Gerilim"]}
						placeholders={["10 A", "2000 W", "920,2 V"]}
						accent={colors.secondaryFixedDim}
						ratio={formatPct(0)}
					/>
					<OlcumGroup
						label="Son Kademe Ölçümleri"
						values={[
							sonKademeAkım,
							sonKademeKayip,
							sonKademeGerilim,
						]}
						setters={[
							setSonKademeAkım,
							setSonKademeKayip,
							setSonKademeGerilim,
						]}
						labels={["Akım", "Kayıp", "Gerilim"]}
						placeholders={["10 A", "2000 W", "920,2 V"]}
						accent={colors.tertiaryFixedDim}
						ratio={formatPct(0)}
					/>
				</SectionCard>

				{/* ═══════════════════════ Buttonlar ═══════════════════════ */}

				<SectionCard config={SECTION_BUTTON} glow={null}>
					<View
						style={{
							flex: 1,
							flexDirection: "row",
							justifyContent: "space-between",
							gap: 4,
						}}>
						{/* <PrimaryBtn
							text="Hesapla"
							icon="calculate"
							// onPress={Hesapla}
						/> */}
						{/* Save / Clear secondary buttons (kept as native, themed) */}

						<PrimaryBtn
							text="Temizle"
							icon="refresh"
							onPress={Temizle}
						/>
						{/* <SecondaryBtn
							text="Kaydet"
							icon="save"
							// onPress={gecmisKaydet}
						/> */}
					</View>
				</SectionCard>

				{/* ═══════════════════════ Results ═══════════════════════ */}
				{allResultsValid ? (
					<ResultsTable
						pk75Ilk={pk75Ilk}
						pac75Ilk={pac75Ilk}
						uk75Ilk={uk75Ilk}
						pk75Nom={pk75Nom}
						pac75Nom={pac75Nom}
						uk75Nom={uk75Nom}
						pk75Son={pk75Son}
						pac75Son={pac75Son}
						uk75Son={uk75Son}
					/>
				) : null}
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Results Table (matches HTML's bg-surface-container + border-l-4 primary-fixed-dim
// + bg-primary/5 wash + analytics-icon "SONUÇLAR" header + 4-col grid table)
// ─────────────────────────────────────────────────────────────────────────────
function ResultsTable({
	pk75Ilk,
	pac75Ilk,
	uk75Ilk,
	pk75Nom,
	pac75Nom,
	uk75Nom,
	pk75Son,
	pac75Son,
	uk75Son,
}) {
	return (
		<View style={styles.resultsCard}>
			{/* Wash overlay (HTML: bg-primary/5 pointer-events-none) */}
			<View style={[styles.resultsWash]} pointerEvents="none" />

			<View style={styles.resultsInner}>
				{/* Header row: analytics icon + SONUÇLAR label */}
				{/* <View style={styles.resultsHeader}>
					<MaterialIcons
						name="analytics"
						size={16}
						color={colors.primaryFixedDim}
					/>
					<Text style={styles.resultsKicker}>SONUÇLAR</Text>
				</View> */}

				{/* 4-column grid table */}
				<View style={styles.resultsGrid}>
					{/* Empty top-left corner */}
					<View style={styles.gridCellEmpty} />

					{/* Column headers */}
					<View style={styles.gridCellHeader}>
						<Text style={styles.gridHeaderLabel}>PAc</Text>
					</View>
					<View style={styles.gridCellHeader}>
						<Text style={styles.gridHeaderLabel}>Uk (%)</Text>
					</View>
					<View style={styles.gridCellHeader}>
						<Text style={styles.gridHeaderLabel}>Pk (W)</Text>
					</View>

					{/* Row 1: İlk Kademe */}
					<View style={styles.gridCellLabel}>
						<Text style={styles.gridRowLabel}>İlk Kademe</Text>
					</View>
					<View style={styles.gridCellValue}>
						<Text
							style={[
								styles.gridValue,
								{ color: colors.primaryFixedDim },
							]}>
							{pac75Ilk || "—"}
						</Text>
					</View>
					<View style={styles.gridCellValue}>
						<Text
							style={[
								styles.gridValue,
								{ color: colors.primaryFixedDim },
							]}>
							{uk75Ilk || "—"}
						</Text>
					</View>
					<View style={styles.gridCellValue}>
						<Text
							style={[
								styles.gridValue,
								{ color: colors.primaryFixedDim },
							]}>
							{pk75Ilk || "—"}
						</Text>
					</View>

					{/* Row 2: Nom Kademe */}
					<View style={styles.gridCellLabel}>
						<Text style={styles.gridRowLabel}>Nom. Kademe</Text>
					</View>
					<View style={styles.gridCellValue}>
						<Text
							style={[
								styles.gridValue,
								{ color: colors.secondaryFixedDim },
							]}>
							{pac75Nom || "—"}
						</Text>
					</View>
					<View style={styles.gridCellValue}>
						<Text
							style={[
								styles.gridValue,
								{ color: colors.secondaryFixedDim },
							]}>
							{uk75Nom || "—"}
						</Text>
					</View>
					<View style={styles.gridCellValue}>
						<Text
							style={[
								styles.gridValue,
								{ color: colors.secondaryFixedDim },
							]}>
							{pk75Nom || "—"}
						</Text>
					</View>

					{/* Row 3: Son Kademe */}
					<View style={styles.gridCellLabel}>
						<Text style={styles.gridRowLabel}>Son Kademe</Text>
					</View>
					<View style={styles.gridCellValue}>
						<Text
							style={[
								styles.gridValue,
								{ color: colors.tertiaryFixedDim },
							]}>
							{pac75Son || "—"}
						</Text>
					</View>
					<View style={styles.gridCellValue}>
						<Text
							style={[
								styles.gridValue,
								{ color: colors.tertiaryFixedDim },
							]}>
							{uk75Son || "—"}
						</Text>
					</View>
					<View style={styles.gridCellValue}>
						<Text
							style={[
								styles.gridValue,
								{ color: colors.tertiaryFixedDim },
							]}>
							{pk75Son || "—"}
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Ölçüm group (YG / AG)
// ─────────────────────────────────────────────────────────────────────────────
function OlcumGroup({ label, values, setters, labels, placeholders, accent }) {
	return (
		<View style={{ gap: 12 }}>
			<View style={styles.direncHeader}>
				<View style={[styles.direncBar, { backgroundColor: accent }]} />
				<Text style={styles.direncLabel}>{label}</Text>
			</View>
			<View style={styles.row3}>
				{values.map((v, i) => (
					<View key={i} style={styles.col}>
						<Label>{labels[i]}</Label>
						<TextInput
							style={[
								styles.input,
								{ borderColor: `${accent}55` },
							]}
							value={v}
							onChangeText={setters[i]}
							placeholder={placeholders[i]}
							placeholderTextColor="#ffffff66"
							keyboardType="decimal-pad"
							selectionColor={accent}
						/>
					</View>
				))}
			</View>
		</View>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Direnç group (YG / AG)
// ─────────────────────────────────────────────────────────────────────────────
function DirencGroup({
	label,
	values,
	setters,
	labels,
	placeholders,
	accent,
	ratio,
}) {
	return (
		<View style={{ gap: 12 }}>
			<View style={styles.direncHeader}>
				<View style={[styles.direncBar, { backgroundColor: accent }]} />
				<Text style={styles.direncLabel}>
					{label}
					{/* ·{" "} */}
					{/* <Text style={{ color: colors.onSurface }}>{ratio}</Text> */}
				</Text>
			</View>
			<View style={styles.row3}>
				{values.map((v, i) => (
					<View key={i} style={styles.col}>
						<Label>{labels[i]}</Label>
						<TextInput
							style={[
								styles.input,
								{ borderColor: `${accent}55` },
							]}
							value={v}
							onChangeText={setters[i]}
							placeholder={placeholders[i]}
							placeholderTextColor="#ffffff66"
							keyboardType="decimal-pad"
							selectionColor={accent}
						/>
					</View>
				))}
			</View>
		</View>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Segmented control (Sargı Tipi)
// ─────────────────────────────────────────────────────────────────────────────
function SegmentedOption({ option, active, accent, onPress }) {
	const composed = useMemo(() => {
		return (
			StyleSheet.flatten([
				styles.segmentItem,
				active ? { backgroundColor: accent } : null,
			]) || styles.segmentItem
		);
	}, [active, accent]);

	return (
		<Pressable
			onPress={onPress}
			android_ripple={{ color: "#ffffff10" }}
			style={composed}>
			<Text
				style={[
					styles.segmentText,
					{
						color: active
							? colors.onSecondary
							: colors.onSurfaceVariant,
					},
				]}>
				{option.label}
			</Text>
		</Pressable>
	);
}

function Segmented({ value, options, onChange, accent }) {
	return (
		<View style={styles.segmentTrack}>
			{options.map((opt) => (
				<SegmentedOption
					key={opt.value}
					option={opt}
					active={value === opt.value}
					accent={accent}
					onPress={() => onChange(opt.value)}
				/>
			))}
		</View>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Card (mirrors HTML: bg-surface-container, rounded-xl, p-4, shadow,
// very subtle accent-tinted glow, header row with icon + title)
// ─────────────────────────────────────────────────────────────────────────────
function SectionCard({ config, glow, children }) {
	return (
		<View style={styles.sectionCard}>
			{/* Glow accent */}
			{glow ? <GlowBlob position={glow} color={config.accent} /> : null}
			{config.icon && config.title ? (
				<View style={styles.sectionHeader}>
					<MaterialIcons
						name={config.icon}
						size={20}
						color={config.accent}
					/>
					<Text style={styles.sectionTitle}>{config.title}</Text>
				</View>
			) : null}
			<View style={styles.sectionBody}>{children}</View>
		</View>
	);
}

function GlowBlob({ position, color }) {
	const blobStyle = {
		position: "absolute",
		width: 128,
		height: 128,
		borderRadius: 999,
		backgroundColor: `${color}0D`, // ~5% alpha
		opacity: 0.6,
	};
	if (position === "topRight") {
		blobStyle.top = -64;
		blobStyle.right = -64;
	} else if (position === "bottomLeft") {
		blobStyle.bottom = -48;
		blobStyle.left = -48;
		blobStyle.width = 96;
		blobStyle.height = 96;
	} else if (position === "center") {
		blobStyle.width = 192;
		blobStyle.height = 192;
		blobStyle.top = "50%";
		blobStyle.left = "50%";
		blobStyle.marginTop = -96;
		blobStyle.marginLeft = -96;
		blobStyle.opacity = 0.35;
	}
	return <View pointerEvents="none" style={blobStyle} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Label + Input
// ─────────────────────────────────────────────────────────────────────────────
function Label({ children }) {
	return <Text style={styles.label}>{children}</Text>;
}

function Field({ label, value, onChangeText, placeholder, ring, style }) {
	return (
		<View style={style}>
			{label ? <Label>{label}</Label> : null}
			<TextInput
				style={[
					styles.input,
					{ borderColor: ring ? `${ring}55` : colors.outlineVariant },
				]}
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor="#ffffff66"
				keyboardType="decimal-pad"
				selectionColor={ring || colors.primaryFixedDim}
			/>
		</View>
	);
}
// ─────────────────────────────────────────────────────────────────────────────
// Primary button (Hesapla)
// ─────────────────────────────────────────────────────────────────────────────
function PrimaryBtn({ text, icon, onPress, disabled = false, style }) {
	const [pressed, setPressed] = useState(false);

	// Compose all variants into a single flat object so the style prop
	// passed to Pressable is a stable, non-array, non-falsy value.
	const composed = useMemo(() => {
		return (
			StyleSheet.flatten([
				styles.primaryBtn,
				disabled ? styles.primaryBtnDisabled : null,
				pressed ? styles.primaryBtnPressed : null,
				style,
			]) || styles.primaryBtn
		);
	}, [disabled, pressed, style]);

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			accessibilityRole="button"
			accessibilityState={{ disabled }}
			style={composed}
			onPressIn={() => setPressed(true)}
			onPressOut={() => setPressed(false)}
			android_ripple={{ color: "#ffffff22" }}>
			<MaterialIcons
				name={icon}
				size={22}
				color={disabled ? "#ffffff80" : colors.onPrimary}
			/>
			<Text
				style={[
					styles.primaryBtnText,
					disabled && styles.primaryBtnTextDisabled,
				]}>
				{text}
			</Text>
		</Pressable>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Secondary buttons (Temizle / Kaydet)
// ─────────────────────────────────────────────────────────────────────────────
function SecondaryBtn({ text, icon, onPress, disabled = false, style }) {
	const [pressed, setPressed] = useState(false);

	const composed = useMemo(() => {
		return (
			StyleSheet.flatten([
				styles.secondaryBtn,
				disabled ? styles.secondaryBtnDisabled : null,
				pressed ? styles.secondaryBtnPressed : null,
				style,
			]) || styles.secondaryBtn
		);
	}, [disabled, pressed, style]);

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			accessibilityRole="button"
			accessibilityState={{ disabled }}
			style={composed}
			onPressIn={() => setPressed(true)}
			onPressOut={() => setPressed(false)}
			android_ripple={{ color: "#ffffff22" }}>
			<MaterialIcons
				name={icon}
				size={18}
				color={disabled ? "#ffffff80" : colors.onSurface}
			/>
			<Text
				style={[
					styles.secondaryBtnText,
					disabled && styles.secondaryBtnTextDisabled,
				]}>
				{text}
			</Text>
		</Pressable>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: colors.background },
	scroll: { backgroundColor: colors.background },
	content: {
		paddingHorizontal: spacing.marginMobile,
		paddingTop: spacing.sm,
		paddingBottom: 96, // bottom safe
		gap: spacing.base,
	},

	// ---------- Section card ----------
	sectionCard: {
		backgroundColor: colors.surfaceContainer,
		borderRadius: 12,
		padding: spacing.md,
		// shadow-sm equivalent
		shadowColor: "#000",
		shadowOpacity: 0.04,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 1 },
		elevation: 1,
		overflow: "hidden",
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
		marginBottom: spacing.xs,
	},
	sectionTitle: {
		fontFamily: "Inter",
		fontSize: 18,
		fontWeight: "600",
		color: colors.onSurface,
	},
	sectionBody: { gap: spacing.sm },

	// ---------- Label ----------
	label: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 1.2,
		marginBottom: 4,
		textTransform: "uppercase",
	},

	// ---------- Input ----------
	input: {
		backgroundColor: colors.surface,
		color: colors.onSurface,
		borderRadius: 8,
		borderWidth: 1,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontFamily: "Inter",
		fontSize: 16,
		fontVariant: ["tabular-nums"],
	},

	// ---------- Rows ----------
	row2: {
		flexDirection: "row",
		gap: spacing.md,
		justifyContent: "space-between",
	},
	row3: { flexDirection: "row", gap: spacing.sm },
	col: { flex: 1 },

	// ---------- Segmented ----------
	segmentTrack: {
		flexDirection: "row",
		backgroundColor: colors.surface,
		borderRadius: 8,
		padding: 4,
		gap: 4,
	},
	segmentItem: {
		flex: 1,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 6,
		alignItems: "center",
		justifyContent: "center",
	},
	segmentText: {
		fontFamily: "Inter",
		fontSize: 14,
		fontWeight: "600",
	},

	// ---------- Direnç group ----------
	direncHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
	},
	direncBar: {
		width: 4,
		height: 16,
		borderRadius: 2,
	},
	direncLabel: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 1.2,
		textTransform: "uppercase",
	},

	// ---------- Primary button ----------
	primaryBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xs,
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingVertical: 4,
		paddingHorizontal: 6,
		// marginTop: 4,
	},
	primaryBtnPressed: {
		transform: [{ scale: 0.98 }],
		opacity: 0.92,
	},
	primaryBtnDisabled: {
		backgroundColor: colors.surfaceContainerHigh,
		opacity: 0.6,
	},
	primaryBtnText: {
		fontFamily: "Inter",
		fontSize: 18,
		fontWeight: "600",
		color: colors.onPrimary,
	},
	primaryBtnTextDisabled: {
		color: "#ffffff80",
	},

	// ---------- Results Table ----------
	resultsCard: {
		backgroundColor: colors.surfaceContainer,
		borderRadius: 12,
		padding: spacing.md,
		// shadow-md
		shadowColor: "#000",
		shadowOpacity: 0.08,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
		position: "relative",
		overflow: "hidden",
		// border-l-4 border-primary-fixed-dim
		borderLeftWidth: 4,
		borderLeftColor: colors.primaryFixedDim,
	},
	resultsWash: {
		position: "absolute",
		left: 4, // offset to avoid covering the left accent border
		top: 0,
		right: 0,
		bottom: 0,
		backgroundColor: `${colors.primary}0D`, // 5% alpha
	},
	resultsInner: {
		position: "relative",
		zIndex: 1,
		gap: spacing.md,
	},
	resultsHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
		opacity: 0.8,
	},
	resultsKicker: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 1.5,
		textTransform: "uppercase",
	},
	resultsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	gridCellEmpty: {
		width: "25%",
		padding: spacing.xs,
	},
	gridCellHeader: {
		width: "25%",
		padding: spacing.xs,
		alignItems: "center",
	},
	gridHeaderLabel: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 1,
		textTransform: "uppercase",
		opacity: 0.6,
		textAlign: "center",
	},
	gridCellLabel: {
		width: "25%",
		padding: spacing.xs,
		alignItems: "flex-start",
		justifyContent: "center",
	},
	gridRowLabel: {
		fontFamily: "Inter",
		fontSize: 12,
		fontWeight: "600",
		color: colors.onSurfaceVariant,
		letterSpacing: 1,
		textTransform: "uppercase",
	},
	gridCellValue: {
		width: "25%",
		padding: spacing.xs,
		alignItems: "center",
		justifyContent: "center",
	},
	gridValue: {
		fontFamily: "Inter",
		fontSize: 14,
		fontWeight: "700",
		fontVariant: ["tabular-nums"],
		textAlign: "center",
	},

	// ---------- Warnings ----------
	warn: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
		backgroundColor: "#ff6b6b1f",
		borderColor: "#ff6b6b73",
		borderWidth: 1,
		borderRadius: 12,
		padding: 12,
	},
	warnText: {
		color: "#ffd5d5",
		fontFamily: "Inter",
		fontSize: 13,
		fontWeight: "600",
		flex: 1,
	},
	warnTitle: {
		color: "#ffd5d5",
		fontFamily: "Inter",
		fontSize: 16,
		fontWeight: "800",
	},

	// ---------- Secondary buttons ----------
	secondaryRow: {
		flexDirection: "row",
		gap: spacing.sm,
		marginTop: spacing.md,
	},
	secondaryBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 2,
		paddingVertical: 12,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: colors.outlineVariant,
		backgroundColor: "transparent",
	},
	secondaryBtnPressed: {
		opacity: 0.7,
		backgroundColor: colors.surfaceContainer,
	},
	secondaryBtnDisabled: {
		opacity: 0.4,
	},
	secondaryBtnText: {
		color: colors.onSurface,
		fontFamily: "Inter",
		fontSize: 14,
		fontWeight: "600",
	},
	secondaryBtnTextDisabled: {
		color: "#ffffff80",
	},
});
