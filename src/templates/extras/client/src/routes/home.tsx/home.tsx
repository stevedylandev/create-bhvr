import Home from "../components/Home";

export function meta() {
	return [
		{ title: "bhvr" },
		{ name: "description", content: "A typesafe fullstack monorepo" },
	];
}

export default function HomePage() {
	return <Home />;
}
