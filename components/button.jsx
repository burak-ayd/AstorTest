import { useMemo } from "react";
import { Pressable, Text } from "react-native";

export default function Button({ func, text, secondary }) {
	const style = useMemo(() => {
		if (secondary) {
			return "appearance-none border-0 cursor-pointer px-4 py-3 rounded-[14px] font-bold bg-secondary text-gray-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]";
		}
		return "appearance-none border-0 cursor-pointer px-4 py-3 rounded-[14px] font-bold bg-primary bg-gradient-to-b from-[#4da3ff] to-[#2f7edc] text-white shadow-[0_10px_22px_rgba(77,163,255,0.35)] active:translate-y-[1px]";
	}, [secondary]);

	return (
		<Pressable className={style} onPress={func}>
			<Text className="text-text font-bold">{text}</Text>
		</Pressable>
	);
}
