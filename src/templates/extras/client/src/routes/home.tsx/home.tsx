import Home from "../components/Home";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "bhvr" },
		{ name: "description", content: "A typesafe fullstack monorepo" },
	];
}

export default function HomePage() {
	return <Home />;
}
