import {
	useEffect,
	useState,
	type PropsWithChildren,
	type ReactNode,
} from "react";

type ClientOnlyProps = PropsWithChildren & {
	fallback?: ReactNode;
};

const ClientOnly = ({ children, fallback }: ClientOnlyProps) => {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	return isClient ? children : fallback;
};

export default ClientOnly;
