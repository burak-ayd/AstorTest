import CustomToast from "@/components/CustomToast";
import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext({
	showToast: (msg, position = "bottom", type = "success") => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
	const [visible, setVisible] = useState(false);
	const [message, setMessage] = useState("");
	const [position, setPosition] = useState("bottom");
	const [type, setType] = useState("success");

	const showToast = useCallback((msg, pos = "bottom", typ = "success") => {
		setMessage(msg);
		setPosition(pos);
		setType(typ);
		setVisible(true);
	}, []);

	const hideToast = useCallback(() => {
		setVisible(false);
	}, []);

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			<CustomToast
				visible={visible}
				message={message}
				type={type}
				position={position}
				onHide={hideToast}
			/>
		</ToastContext.Provider>
	);
};
