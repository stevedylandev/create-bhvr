import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import beaver from "../assets/beaver.svg";
import { useMutation } from "@tanstack/react-query";
import type { ApiResponse } from "shared";
import "../App.css";

export const Route = createFileRoute("/")({
	component: Index,
});

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

function Index() {
	const [data, setData] = useState<ApiResponse | undefined>();

	const { mutate: sendRequest } = useMutation({
		mutationFn: async () => {
			const req = await fetch(`${SERVER_URL}/hello`);
			const res: ApiResponse = await req.json();
			setData(res);
		},
		onError: (err) => console.log(err),
	});

	return (
		<>
			<div>
				<a
					href="https://github.com/stevedylandev/bhvr"
					target="_blank"
					rel="noopener"
				>
					<img src={beaver} className="logo" alt="beaver logo" />
				</a>
			</div>
			<h1>bhvr</h1>
			<h2>Bun + Hono + Vite + React</h2>
			<p>A typesafe fullstack monorepo</p>
			<div className="card">
				<div className="button-container">
					<button type="button" onClick={() => sendRequest()}>
						Call API
					</button>
					<a
						className="docs-link"
						target="_blank"
						href="https://bhvr.dev"
						rel="noopener"
					>
						Docs
					</a>
				</div>
				{data && (
					<pre className="response">
						<code>
							Message: {data.message} <br />
							Success: {data.success.toString()}
						</code>
					</pre>
				)}
			</div>
		</>
	);
}

export default Index;
