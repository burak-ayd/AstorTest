import { TextInput } from "react-native";

export default function Input({ value, onChangeText, placeholder }) {
	return (
		<TextInput
			className="bg-background border border-solid rounded-xl border-border p-4 text-sm w-full outline-none color-text focus:border-borderFocus"
			value={value}
			onChangeText={onChangeText}
			placeholder={placeholder || "ör. 2500"}
			placeholderTextColor="#ffffff80"
			keyboardType="numeric"
		/>
	);
}
